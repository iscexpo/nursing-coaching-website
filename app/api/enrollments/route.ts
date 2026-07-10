import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enrollments, courses, user } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let data
    if (session.user.role === 'admin') {
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
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { courseId, notes } = body

    const [course] = await db.select().from(courses).where(eq(courses.id, courseId))
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    const fee = course.discountFee || course.fee

    const [enrollment] = await db.insert(enrollments).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      courseId,
      totalFee: fee,
      dueAmount: fee,
      notes,
    }).returning()

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
  }
}