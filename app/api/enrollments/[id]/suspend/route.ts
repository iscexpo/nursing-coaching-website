import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enrollments, studentLifecycleEvents } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { requirePermission, getSession } from '@/lib/core/permissions'
import { getEnrollmentTransitionError } from '@/lib/core/lms-logic'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requirePermission('student.manage')
  if (!authz.ok) return authz.response
  const rawBody: unknown = await request.json().catch(() => null)
  if (rawBody !== null && typeof rawBody !== 'object') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  const reasonRaw = (rawBody as { reason?: unknown } | null)?.reason
  if (reasonRaw !== undefined && reasonRaw !== null && typeof reasonRaw !== 'string') {
    return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
  }
  const normalizedReason = typeof reasonRaw === 'string' ? reasonRaw.trim() || null : null
  const { id } = await params
  const [existing] = await db.select().from(enrollments).where(eq(enrollments.id, id))
  if (!existing) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  if (existing.status === 'suspended') return NextResponse.json(existing)
  const error = getEnrollmentTransitionError(existing.status, 'suspended')
  if (error) return NextResponse.json({ error }, { status: 400 })
  const now = new Date()
  const result = await db.transaction(async (tx) => {
    const [updated] = await tx.update(enrollments).set({ status: 'suspended', suspendedReason: normalizedReason, updatedAt: now }).where(and(eq(enrollments.id, id), eq(enrollments.status, existing.status))).returning()
    if (!updated) return null
    await tx.insert(studentLifecycleEvents).values({ id: randomUUID(), studentId: existing.userId, enrollmentId: id, eventType: 'enrollment.suspended', details: { reason: normalizedReason, previousStatus: existing.status } })
    return updated
  })
  if (!result) return NextResponse.json({ error: 'Conflict: enrollment status changed' }, { status: 409 })
  const session = await getSession()
  try {
    await writeAudit(buildAuditEntry({ resourceType: 'enrollment', resourceId: id, action: 'suspend', details: { reason: normalizedReason } }, session, request.headers.get('x-forwarded-for') ?? undefined))
  } catch (auditError) {
    console.error('Failed to write audit log for enrollment suspend', auditError)
    return NextResponse.json({ error: 'Failed to persist audit log' }, { status: 500 })
  }
  return NextResponse.json(result)
}
