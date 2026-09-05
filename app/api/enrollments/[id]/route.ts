import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import {
  unauthorized,
  forbidden,
  badRequest,
  ok,
  notFound,
  serverError,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { enrollments, courses, studentLifecycleEvents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/core/permissions'
import { updateEnrollmentSchema } from '@/lib/core/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { rateLimit } from '@/lib/core/rate-limit'
import {
  getEnrollmentTransitionError,
  getLifecycleTimestamp,
} from '@/lib/core/lms-logic'
import { notifyEnrollmentStatusChange } from '@/lib/notifications'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return unauthorized()

    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, id))
    if (!enrollment) return notFound('Enrollment not found')

    if (!isAdmin(session.user.role) && enrollment.userId !== session.user.id) {
      return forbidden()
    }

    return ok(enrollment)
  } catch {
    return serverError('Failed to fetch enrollment')
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = updateEnrollmentSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const [existing] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, id))
    if (!existing) return notFound('Enrollment not found')

    if (parsed.data.status && parsed.data.status !== existing.status) {
      const transitionError = getEnrollmentTransitionError(
        existing.status,
        parsed.data.status,
      )
      if (transitionError) {
        return badRequest(transitionError)
      }
    }

    const updateData: Record<string, unknown> = {
      ...parsed.data,
      updatedAt: new Date(),
    }

    if (parsed.data.status) {
      const timestampCol = getLifecycleTimestamp(parsed.data.status)
      if (timestampCol) {
        updateData[timestampCol] = new Date()
      }
    }

    if (
      parsed.data.discount !== undefined ||
      parsed.data.totalFee !== undefined
    ) {
      let newTotalFee = existing.totalFee
      if (parsed.data.totalFee !== undefined) {
        newTotalFee = parsed.data.totalFee
      } else if (parsed.data.discount !== undefined) {
        const [course] = await db
          .select()
          .from(courses)
          .where(eq(courses.id, existing.courseId))
        const courseFee = course
          ? course.discountFee || course.fee
          : existing.totalFee
        newTotalFee = Math.max(0, courseFee - parsed.data.discount)
      }
      updateData.totalFee = newTotalFee
      if (parsed.data.discount !== undefined)
        updateData.discount = parsed.data.discount
      updateData.dueAmount = Math.max(0, newTotalFee - existing.paidAmount)
    }

    const eventType = parsed.data.status
      ? `enrollment.${parsed.data.status}`
      : 'enrollment.updated'

    const [updated] = await db.transaction(async (tx) => {
      const [result] = await tx
        .update(enrollments)
        .set(updateData)
        .where(eq(enrollments.id, id))
        .returning()

      await tx.insert(studentLifecycleEvents).values({
        id: randomUUID(),
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

    if (parsed.data.status && parsed.data.status !== existing.status) {
      void notifyEnrollmentStatusChange({
        userId: existing.userId,
        enrollmentId: existing.id,
        previousStatus: existing.status,
        newStatus: parsed.data.status,
      })
    }

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
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    if (!updated) return notFound('Enrollment not found')
    return ok(updated)
  } catch {
    return serverError('Failed to update enrollment')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const [existing] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, id))
    if (!existing) return notFound('Enrollment not found')

    if (existing.status === 'cancelled') {
      return badRequest('এনরোলমেন্ট ইতিমধ্যে বাতিল হয়েছে')
    }

    const previousStatus = existing.status

    await db.transaction(async (tx) => {
      await tx
        .update(enrollments)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(enrollments.id, id))

      const [course] = await tx
        .select()
        .from(courses)
        .where(eq(courses.id, existing.courseId))
      if (course && course.currentStudents > 0) {
        await tx
          .update(courses)
          .set({
            currentStudents: course.currentStudents - 1,
            updatedAt: new Date(),
          })
          .where(eq(courses.id, existing.courseId))
      }

      await tx.insert(studentLifecycleEvents).values({
        id: randomUUID(),
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
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return ok({ success: true })
  } catch {
    return serverError('Failed to cancel enrollment')
  }
}
