import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enrollments, studentLifecycleEvents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requirePermission, getSession } from '@/lib/core/permissions'
import { getEnrollmentTransitionError } from '@/lib/core/lms-logic'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requirePermission('student.manage')
  if (!authz.ok) return authz.response
  const body = await request.json().catch(() => ({})) as { reason?: string }
  const { id } = await params
  const [existing] = await db.select().from(enrollments).where(eq(enrollments.id, id))
  if (!existing) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  const error = getEnrollmentTransitionError(existing.status, 'suspended')
  if (error) return NextResponse.json({ error }, { status: 400 })
  const now = new Date()
  const result = await db.transaction(async (tx) => {
    const [updated] = await tx.update(enrollments).set({ status: 'suspended', suspendedReason: body.reason?.trim() || null, updatedAt: now }).where(eq(enrollments.id, id)).returning()
    await tx.insert(studentLifecycleEvents).values({ id: randomUUID(), studentId: existing.userId, enrollmentId: id, eventType: 'enrollment.suspended', details: { reason: body.reason ?? null, previousStatus: existing.status } })
    return updated
  })
  const session = await getSession()
  void writeAudit(buildAuditEntry({ resourceType: 'enrollment', resourceId: id, action: 'suspend', details: { reason: body.reason ?? null } }, session, request.headers.get('x-forwarded-for') ?? undefined))
  return NextResponse.json(result)
}
