import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payments, enrollments, invoices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'
import { verifyPaymentSchema } from '@/lib/validations'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [payment] = await db.select().from(payments).where(eq(payments.id, id))
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    if (session.user.role !== 'admin' && payment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(payment)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = verifyPaymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { status } = parsed.data

    const [existing] = await db.select().from(payments).where(eq(payments.id, id))
    if (!existing) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    if (existing.status !== 'pending') {
      return NextResponse.json({ error: 'Payment has already been processed' }, { status: 400 })
    }

    const result = await db.transaction(async (tx) => {
      const [updated] = await tx.update(payments).set({
        status,
        verifiedBy: session!.user.id,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(payments.id, id)).returning()

      if (status === 'verified') {
        const [enrollment] = await tx.select().from(enrollments).where(eq(enrollments.id, existing.enrollmentId))
        if (enrollment) {
          await tx.update(enrollments).set({
            paidAmount: enrollment.paidAmount + existing.amount,
            dueAmount: enrollment.dueAmount - existing.amount,
            updatedAt: new Date(),
          }).where(eq(enrollments.id, existing.enrollmentId))

          const [invoice] = await tx.select().from(invoices).where(eq(invoices.enrollmentId, existing.enrollmentId))
          if (invoice) {
            const newPaidAmount = invoice.paidAmount + existing.amount
            const newDueAmount = invoice.dueAmount - existing.amount
            await tx.update(invoices).set({
              paidAmount: newPaidAmount,
              dueAmount: newDueAmount,
              status: newDueAmount <= 0 ? 'paid' : 'partial',
              updatedAt: new Date(),
            }).where(eq(invoices.id, invoice.id))
          }
        }
      }

      return updated
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}
