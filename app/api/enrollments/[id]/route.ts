import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enrollments, courses, studentLifecycleEvents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/permissions'
import { updateEnrollmentSchema } from '@/lib/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id))
    if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

    if (!isAdmin(session.user.role) && enrollment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(enrollment)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch enrollment' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = updateEnrollmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [existing] = await db.select().from(enrollments).where(eq(enrollments.id, id))
    if (!existing) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

    const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() }

    if (parsed.data.discount !== undefined || parsed.data.totalFee !== undefined) {
      let newTotalFee = existing.totalFee
      if (parsed.data.totalFee !== undefined) {
        newTotalFee = parsed.data.totalFee
      } else if (parsed.data.discount !== undefined) {
        const [course] = await db.select().from(courses).where(eq(courses.id, existing.courseId))
        const courseFee = course ? (course.discountFee || course.fee) : existing.totalFee
        newTotalFee = Math.max(0, courseFee - parsed.data.discount)
      }
      updateData.totalFee = newTotalFee
      if (parsed.data.discount !== undefined) updateData.discount = parsed.data.discount
      updateData.dueAmount = Math.max(0, newTotalFee - existing.paidAmount)
    }

    const eventType = parsed.data.status ? `enrollment.${parsed.data.status}` : 'enrollment.updated'

    const [updated] = await db.transaction(async (tx) => {
      const [result] = await tx.update(enrollments).set(updateData).where(eq(enrollments.id, id)).returning()

      await tx.insert(studentLifecycleEvents).values({
        id: crypto.randomUUID(),
        studentId: existing.userId,
        enrollmentId: existing.id,
        eventType,
        details: {
          ...parsed.data,
          previousStatus: existing.status,
        },
      })

      return [result]
    })

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'enrollment',
          resourceId: id,
          action: 'update',
          details: {
            ...parsed.data,
            previousStatus: existing.status,
          },
        },
        session,
        request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
      )
    )

    if (!updated) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [existing] = await db.select().from(enrollments).where(eq(enrollments.id, id))
    if (!existing) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

    if (existing.status === 'cancelled') {
      return NextResponse.json({ error: 'এনরোলমেন্ট ইতিমধ্যে বাতিল হয়েছে' }, { status: 400 })
    }

    const previousStatus = existing.status

    await db.transaction(async (tx) => {
      await tx.update(enrollments).set({
        status: 'cancelled',
        updatedAt: new Date(),
      }).where(eq(enrollments.id, id))

      const [course] = await tx.select().from(courses).where(eq(courses.id, existing.courseId))
      if (course && course.currentStudents > 0) {
        await tx.update(courses).set({
          currentStudents: course.currentStudents - 1,
          updatedAt: new Date(),
        }).where(eq(courses.id, existing.courseId))
      }

      await tx.insert(studentLifecycleEvents).values({
        id: crypto.randomUUID(),
        studentId: existing.userId,
        enrollmentId: existing.id,
        eventType: 'enrollment.cancelled',
        details: { previousStatus, cancelledBy: session!.user.id },
      })
    })

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'enrollment',
          resourceId: id,
          action: 'enrollment.cancel',
          details: { previousStatus },
        },
        session,
        request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
      )
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to cancel enrollment' }, { status: 500 })
  }
}
