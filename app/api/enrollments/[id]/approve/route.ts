import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  ok,
  badRequest,
  notFound,
  conflict,
  serverError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { enrollments, invoices, studentLifecycleEvents } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { requirePermission, getSession } from '@/lib/core/permissions'
import {
  getEnrollmentTransitionError,
  calculateExpiryDate,
} from '@/lib/core/lms-logic'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

function generateInvoiceNumber(): string {
  const now = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `INV-${now.toString(36).toUpperCase()}${random.toString(36).toUpperCase().padStart(3, '0')}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authz = await requirePermission('student.manage')
  if (!authz.ok) return authz.response
  const { id } = await params
  const [existing] = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.id, id))
  if (!existing) return notFound('Enrollment not found')
  if (existing.status === 'approved') return ok(existing)
  const error = getEnrollmentTransitionError(existing.status, 'approved')
  if (error) return badRequest(error)
  const now = new Date()
  const expiresAt = existing.expiresAt ?? calculateExpiryDate(now, 12)
  const result = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(enrollments)
      .set({ status: 'approved', approvedAt: now, expiresAt, updatedAt: now })
      .where(
        and(eq(enrollments.id, id), eq(enrollments.status, existing.status)),
      )
      .returning()
    if (!updated) return null

    // Auto-generate invoice if none exists for this enrollment
    const [existingInvoice] = await tx
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.enrollmentId, id))
    if (!existingInvoice) {
      let invoiceNumber = generateInvoiceNumber()
      for (let attempts = 0; attempts < 9; attempts++) {
        const [collision] = await tx
          .select({ id: invoices.id })
          .from(invoices)
          .where(eq(invoices.invoiceNumber, invoiceNumber))
        if (!collision) break
        invoiceNumber = generateInvoiceNumber()
      }
      await tx.insert(invoices).values({
        id: randomUUID(),
        invoiceNumber,
        userId: existing.userId,
        enrollmentId: id,
        amount: existing.totalFee,
        dueAmount: existing.totalFee,
        status: existing.totalFee > 0 ? 'unpaid' : 'paid',
        description: `Invoice for enrollment ${id}`,
      })
    }

    await tx.insert(studentLifecycleEvents).values({
      id: randomUUID(),
      studentId: existing.userId,
      enrollmentId: id,
      eventType: 'enrollment.approved',
      details: { previousStatus: existing.status },
    })
    return updated
  })
  if (!result) return conflict('Conflict: enrollment status changed')
  const session = await getSession()
  try {
    await writeAudit(
      buildAuditEntry(
        { resourceType: 'enrollment', resourceId: id, action: 'approve' },
        session,
        request.headers.get('x-forwarded-for') ?? undefined,
      ),
    )
  } catch (auditError) {
    console.error(
      'Failed to write audit log for enrollment approve',
      auditError,
    )
    return serverError('Failed to persist audit log')
  }
  return ok(result)
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
