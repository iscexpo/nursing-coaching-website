import { NextRequest, NextResponse } from 'next/server'
import { unauthorized, notFound } from '@/lib/api/response'
import { db } from '@/lib/db'
import { payments, enrollments, invoices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { refundPaymentSchema } from '@/lib/core/validations'
import { calculatePaymentRefund } from '@/lib/core/lms-logic'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { notify } from '@/lib/notifications'

/**
 * POST /api/payments/[id]/refund
 * Refund a verified payment. Defaults to the full payment amount.
 * Body: { amount?: number } — partial refunds supported.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return unauthorized()

    const body = await request.json().catch(() => ({}))
    const parsed = refundPaymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
    if (!payment)
      return notFound('Payment not found')

    if (payment.status !== 'verified') {
      return NextResponse.json(
        { error: 'Only verified payments can be refunded' },
        { status: 400 },
      )
    }

    const refundAmount = parsed.data.amount ?? payment.amount
    if (refundAmount > payment.amount) {
      return NextResponse.json(
        { error: 'Refund amount cannot exceed the payment amount' },
        { status: 400 },
      )
    }

    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, payment.enrollmentId))

    const result = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(payments)
        .set({
          status: 'refunded',
          notes: payment.notes
            ? `${payment.notes}\nRefunded: ${refundAmount}`
            : `Refunded: ${refundAmount}`,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, id))
        .returning()

      if (enrollment) {
        const [invoice] = await tx
          .select()
          .from(invoices)
          .where(eq(invoices.enrollmentId, payment.enrollmentId))

        const totals = calculatePaymentRefund(
          enrollment.paidAmount,
          enrollment.dueAmount,
          invoice?.paidAmount ?? 0,
          invoice?.dueAmount ?? enrollment.dueAmount,
          refundAmount,
        )

        await tx
          .update(enrollments)
          .set({
            paidAmount: totals.enrollmentPaid,
            dueAmount: totals.enrollmentDue,
            updatedAt: new Date(),
          })
          .where(eq(enrollments.id, payment.enrollmentId))

        if (invoice) {
          await tx
            .update(invoices)
            .set({
              paidAmount: totals.invoicePaid,
              dueAmount: totals.invoiceDue,
              status: totals.invoiceStatus as 'paid' | 'partial',
              updatedAt: new Date(),
            })
            .where(eq(invoices.id, invoice.id))
        }
      }

      return updated
    })

    void notify({
      userId: payment.userId,
      title: 'পেমেন্ট রিফান্ড',
      message: `আপনার ${payment.amount} টাকার পেমেন্ট ${refundAmount} টাকা রিফান্ড করা হয়েছে।`,
      type: 'payment',
      link: `/dashboard/payments`,
    })

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'payment',
          resourceId: id,
          action: 'payment.refund',
          details: { refundAmount },
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return NextResponse.json({ ...result, refundAmount })
  } catch {
    return NextResponse.json(
      { error: 'Failed to refund payment' },
      { status: 500 },
    )
  }
}