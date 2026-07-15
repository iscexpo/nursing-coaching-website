import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enrollments, courses, user, studentLifecycleEvents } from '@/lib/db/schema'
import { eq, desc, and, count } from 'drizzle-orm'
import { getSession, isAdmin, requireAdmin } from '@/lib/permissions'
import { createEnrollmentSchema, paginationSchema } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 }

    const admin = isAdmin(session.user.role)
    let data
    if (admin) {
      data = await db.select({
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        status: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
        startDate: enrollments.startDate,
        endDate: enrollments.endDate,
        totalFee: enrollments.totalFee,
        discount: enrollments.discount,
        paidAmount: enrollments.paidAmount,
        dueAmount: enrollments.dueAmount,
        notes: enrollments.notes,
        userName: user.name,
        userPhone: user.phoneNumber,
        courseTitle: courses.title,
      })
        .from(enrollments)
        .leftJoin(user, eq(enrollments.userId, user.id))
        .leftJoin(courses, eq(enrollments.courseId, courses.id))
        .orderBy(desc(enrollments.createdAt))
        .limit(limit)
        .offset((page - 1) * limit)
    } else {
      data = await db.select({
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        status: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
        totalFee: enrollments.totalFee,
        paidAmount: enrollments.paidAmount,
        dueAmount: enrollments.dueAmount,
        notes: enrollments.notes,
        courseTitle: courses.title,
        courseDuration: courses.duration,
      })
        .from(enrollments)
        .leftJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.userId, session.user.id))
        .orderBy(desc(enrollments.createdAt))
        .limit(limit)
        .offset((page - 1) * limit)
    }

    const countWhere = admin ? undefined : eq(enrollments.userId, session.user.id)
    const [totalRow] = await db.select({ count: count() }).from(enrollments).where(countWhere)

    return NextResponse.json({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, { windowMs: 60_000, max: 20, prefix: 'enrollments.create' })
  if (limiter) return limiter

  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = createEnrollmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const admin = isAdmin(session.user.role)
    const targetUserId = admin && parsed.data.userId ? parsed.data.userId : session.user.id
    const discountAmount = parsed.data.discount || 0
    const notes = parsed.data.notes

    if (admin && parsed.data.userId) {
      const authz = await requireAdmin()
      if (!authz.ok) return authz.response
    }

    const courseIds = parsed.data.courseIds || (parsed.data.courseId ? [parsed.data.courseId] : [])

    const enrolled: Array<{ courseId: string; enrollmentId: string }> = []
    const errors: Array<{ courseId: string; error: string }> = []

    await db.transaction(async (tx) => {
      for (const cid of courseIds) {
        const [course] = await tx.select().from(courses).where(eq(courses.id, cid))
        if (!course) { errors.push({ courseId: cid, error: 'Course not found' }); continue }
        if (!course.isActive) { errors.push({ courseId: cid, error: 'Course is not active' }); continue }

        const existingEnrollment = await tx.select().from(enrollments).where(
          and(eq(enrollments.userId, targetUserId), eq(enrollments.courseId, cid))
        )
        if (existingEnrollment.length > 0) { errors.push({ courseId: cid, error: 'Already enrolled' }); continue }

        if (course.maxStudents && course.currentStudents >= course.maxStudents) {
          errors.push({ courseId: cid, error: 'Course is full' }); continue
        }

        const fee = course.discountFee || course.fee
        const totalFee = Math.max(0, fee - discountAmount)

        const [freshCourse] = await tx.select().from(courses).where(eq(courses.id, cid))
        if (!freshCourse) { errors.push({ courseId: cid, error: 'Course not found' }); continue }
        if (freshCourse.maxStudents && freshCourse.currentStudents >= freshCourse.maxStudents) {
          errors.push({ courseId: cid, error: 'Course is full' }); continue
        }

        const [enrollment] = await tx.insert(enrollments).values({
          id: crypto.randomUUID(),
          userId: targetUserId,
          courseId: cid,
          totalFee,
          discount: discountAmount,
          dueAmount: totalFee,
          notes,
        }).returning()

        await tx.update(courses).set({
          currentStudents: freshCourse.currentStudents + 1,
          updatedAt: new Date(),
        }).where(eq(courses.id, cid))

        await tx.insert(studentLifecycleEvents).values({
          id: crypto.randomUUID(),
          studentId: targetUserId,
          enrollmentId: enrollment.id,
          eventType: 'enrollment.pending',
          details: { courseId: cid, totalFee, discount: discountAmount, createdByAdmin: admin },
        })

        enrolled.push({ courseId: cid, enrollmentId: enrollment.id })
      }
    })

    if (enrolled.length === 0 && errors.length > 0) {
      return NextResponse.json({ error: 'কোনো এনরোলমেন্ট তৈরি হয়নি', details: errors }, { status: 400 })
    }

    return NextResponse.json({ enrolled, errors, count: enrolled.length }, { status: 201 })
  } catch (e) {
    if (e instanceof Error && e.message === 'COURSE_FULL') {
      return NextResponse.json({ error: 'Course is full' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
  }
}
