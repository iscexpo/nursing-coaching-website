import { NextRequest, NextResponse } from 'next/server'
import { unauthorized, forbidden, notFound, badRequest, conflict } from '@/lib/api/response'
import { db } from '@/lib/db'
import { payments, enrollments, invoices } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/core/permissions'
import { verifyPaymentSchema } from '@/lib/core/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { notifyPaymentUpdate } from '@/lib/notifications'
import { calculatePaymentUpdate, validatePaymentAmount } from '@/lib/core/lms-logic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session)
      return unauthorized()

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
    if (!payment)
      return notFound('Payment not found')

    if (!isAdmin(session.user.role) && payment.userId !== session.user.id) {
      return forbidden()
    }

    return NextResponse.json(payment)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 },
    )
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
    if (!session)
      return unauthorized()

    const body = await request.json()
    const parsed = verifyPaymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { status } = parsed.data

    const result = await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(payments).where(eq(payments.id, id))
      if (!existing) {
        const err = new Error('Payment not found') as Error & { status?: number }
        err.status = 404
        throw err
      }
      if (existing.status !== 'pending') {
        const err = new Error('Payment has already been processed') as Error & { status?: number }
        err.status = 400
        throw err
      }

      const [enrollment] = await tx.select().from(enrollments).where(eq(enrollments.id, existing.enrollmentId))

      if (status === 'verified') {
        if (!enrollment) {
          const err = new Error('Enrollment not found for payment') as Error & { status?: number }
          err.status = 400
          throw err
        }
        const paymentCheck = validatePaymentAmount(existing.amount, Math.max(0, enrollment.dueAmount))
        if (!paymentCheck.ok) {
          const err = new Error(paymentCheck.error) as Error & { status?: number }
          err.status = 400
          throw err
        }
      }

      const [updated] = await tx
        .update(payments)
        .set({
          status,
          verifiedBy: session!.user.id,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(payments.id, id), eq(payments.status, 'pending')))
        .returning()

      if (!updated) {
        const err = new Error('Conflict: payment status changed') as Error & { status?: number }
        err.status = 409
        throw err
      }

      if (status === 'verified' && enrollment) {
        const [invoice] = await tx.select().from(invoices).where(eq(invoices.enrollmentId, existing.enrollmentId))

        const totals = calculatePaymentUpdate(
          enrollment.paidAmount,
          enrollment.dueAmount,
          invoice?.paidAmount ?? 0,
          invoice?.dueAmount ?? enrollment.dueAmount,
          existing.amount,
        )

        await tx
          .update(enrollments)
          .set({
            paidAmount: totals.enrollmentPaid,
            dueAmount: totals.enrollmentDue,
            updatedAt: new Date(),
          })
          .where(eq(enrollments.id, existing.enrollmentId))

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

    if (status === 'verified' || status === 'rejected') {
      void notifyPaymentUpdate({
        userId: result.userId,
        amount: result.amount,
        method: result.method,
        status,
      })
    }

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'payment',
          resourceId: id,
          action: status === 'verified' ? 'payment.verify' : 'payment.reject',
          details: { status },
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return NextResponse.json(result)
  } catch (e: unknown) {
    const err = e as Error & { status?: number }
    if (err.status === 404) return notFound(err.message)
    if (err.status === 400) return badRequest(err.message)
    if (err.status === 409) return conflict(err.message)
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 },
    )
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
    if (!session)
      return unauthorized()

    const [existing] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
    if (!existing)
      return notFound('Payment not found')

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only delete pending payments' },
        { status: 400 },
      )
    }

    await db.delete(payments).where(eq(payments.id, id))

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'payment',
          resourceId: id,
          action: 'payment.delete',
          details: { status: existing.status },
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 },
    )
  }
}
