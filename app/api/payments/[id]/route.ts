import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payments, enrollments, invoices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'

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
  } catch (error) {
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
    const { status, verifiedBy } = body

    const [existing] = await db.select().from(payments).where(eq(payments.id, id))
    if (!existing) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    const [updated] = await db.update(payments).set({
      status,
      verifiedBy: verifiedBy || session.user.id,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(payments.id, id)).returning()

    if (status === 'verified') {
      const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, existing.enrollmentId))
      if (enrollment) {
        await db.update(enrollments).set({
          paidAmount: enrollment.paidAmount + existing.amount,
          dueAmount: enrollment.dueAmount - existing.amount,
          updatedAt: new Date(),
        }).where(eq(enrollments.id, existing.enrollmentId))

        const [invoice] = await db.select().from(invoices).where(eq(invoices.enrollmentId, existing.enrollmentId))
        if (invoice) {
          await db.update(invoices).set({
            paidAmount: invoice.paidAmount + existing.amount,
            dueAmount: invoice.dueAmount - existing.amount,
            status: invoice.dueAmount - existing.amount <= 0 ? 'paid' : 'partial',
            updatedAt: new Date(),
          }).where(eq(invoices.id, invoice.id))
        }
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}