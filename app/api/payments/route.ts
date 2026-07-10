import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payments, enrollments, invoices } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let data
    if (session.user.role === 'admin') {
      data = await db.select().from(payments).orderBy(desc(payments.createdAt))
    } else {
      data = await db.select().from(payments).where(eq(payments.userId, session.user.id)).orderBy(desc(payments.createdAt))
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { enrollmentId, amount, method, transactionId, senderNumber, notes } = body

    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId))
    if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

    if (session.user.role !== 'admin' && enrollment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [payment] = await db.insert(payments).values({
      id: crypto.randomUUID(),
      userId: enrollment.userId,
      enrollmentId,
      amount,
      method,
      transactionId,
      senderNumber,
      notes,
      status: method === 'cash' ? 'verified' : 'pending',
    }).returning()

    if (method === 'cash') {
      await db.update(enrollments).set({
        paidAmount: enrollment.paidAmount + amount,
        dueAmount: enrollment.dueAmount - amount,
        updatedAt: new Date(),
      }).where(eq(enrollments.id, enrollmentId))

      const [invoice] = await db.select().from(invoices).where(eq(invoices.enrollmentId, enrollmentId))
      if (invoice) {
        await db.update(invoices).set({
          paidAmount: invoice.paidAmount + amount,
          dueAmount: invoice.dueAmount - amount,
          status: invoice.dueAmount - amount <= 0 ? 'paid' : 'partial',
          updatedAt: new Date(),
        }).where(eq(invoices.id, invoice.id))
      }
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}