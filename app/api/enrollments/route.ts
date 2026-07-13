import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enrollments, courses, user, studentLifecycleEvents } from '@/lib/db/schema'
import { eq, desc, and, count } from 'drizzle-orm'
import { getSession, isAdmin } from '@/lib/permissions'
import { createEnrollmentSchema, paginationSchema } from '@/lib/validations'
import { writeLifecycleEvent } from '@/lib/audit'
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
        totalFee: enrollments.totalFee,
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
  const limiter = await rateLimit(request, { windowMs: 60_000, max: 10, prefix: 'enrollments.create' })
  if (limiter) return limiter

  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = createEnrollmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { courseId, notes } = parsed.data

    const [course] = await db.select().from(courses).where(eq(courses.id, courseId))
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    if (!course.isActive) return NextResponse.json({ error: 'Course is not active' }, { status: 400 })

    const existingEnrollment = await db.select().from(enrollments).where(
      and(eq(enrollments.userId, session.user.id), eq(enrollments.courseId, courseId))
    )
    if (existingEnrollment.length > 0) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 409 })
    }

    if (course.maxStudents && course.currentStudents >= course.maxStudents) {
      return NextResponse.json({ error: 'Course is full' }, { status: 400 })
    }

    const fee = course.discountFee || course.fee

    const result = await db.transaction(async (tx) => {
      const [enrollment] = await tx.insert(enrollments).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        courseId,
        totalFee: fee,
        dueAmount: fee,
        notes,
      }).returning()

      await tx.update(courses).set({
        currentStudents: course.currentStudents + 1,
        updatedAt: new Date(),
      }).where(eq(courses.id, courseId))

      await tx.insert(studentLifecycleEvents).values({
        id: crypto.randomUUID(),
        studentId: session.user.id,
        enrollmentId: enrollment.id,
        eventType: 'enrollment.pending',
        details: { courseId, totalFee: fee },
      })

      return enrollment
    })

    await writeLifecycleEvent({
      studentId: session.user.id,
      enrollmentId: result.id,
      eventType: 'enrollment.created',
      details: { courseId, totalFee: fee },
    })

    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
  }
}
