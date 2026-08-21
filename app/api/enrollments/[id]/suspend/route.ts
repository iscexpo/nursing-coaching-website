import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  ok,
  notFound,
  badRequest,
  conflict,
  serverError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { enrollments, studentLifecycleEvents } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { requirePermission, getSession } from '@/lib/core/permissions'
import { getEnrollmentTransitionError } from '@/lib/core/lms-logic'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authz = await requirePermission('student.manage')
  if (!authz.ok) return authz.response
  const rawBody: unknown = await request.json().catch(() => null)
  if (rawBody !== null && typeof rawBody !== 'object') {
    return badRequest('Invalid input')
  }
  const reasonRaw = (rawBody as { reason?: unknown } | null)?.reason
  if (
    reasonRaw !== undefined &&
    reasonRaw !== null &&
    typeof reasonRaw !== 'string'
  ) {
    return badRequest('Invalid reason')
  }
  const normalizedReason =
    typeof reasonRaw === 'string' ? reasonRaw.trim() || null : null
  const { id } = await params
  const [existing] = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.id, id))
  if (!existing) return notFound('Enrollment not found')
  if (existing.status === 'suspended') return ok(existing)
  const error = getEnrollmentTransitionError(existing.status, 'suspended')
  if (error) return badRequest(error)
  const now = new Date()
  const result = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(enrollments)
      .set({
        status: 'suspended',
        suspendedReason: normalizedReason,
        updatedAt: now,
      })
      .where(
        and(eq(enrollments.id, id), eq(enrollments.status, existing.status)),
      )
      .returning()
    if (!updated) return null
    await tx
      .insert(studentLifecycleEvents)
      .values({
        id: randomUUID(),
        studentId: existing.userId,
        enrollmentId: id,
        eventType: 'enrollment.suspended',
        details: { reason: normalizedReason, previousStatus: existing.status },
      })
    return updated
  })
  if (!result) return conflict('Conflict: enrollment status changed')
  const session = await getSession()
  try {
    await writeAudit(
      buildAuditEntry(
        {
          resourceType: 'enrollment',
          resourceId: id,
          action: 'suspend',
          details: { reason: normalizedReason },
        },
        session,
        request.headers.get('x-forwarded-for') ?? undefined,
      ),
    )
  } catch (auditError) {
    console.error(
      'Failed to write audit log for enrollment suspend',
      auditError,
    )
    return serverError('Failed to persist audit log')
  }
  return ok(result)
}
