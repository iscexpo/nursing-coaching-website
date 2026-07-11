import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payments, enrollments, invoices } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'
import { createPaymentSchema, paginationSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 }

    let data
    if (session.user.role === 'admin') {
      data = await db.select().from(payments).orderBy(desc(payments.createdAt)).limit(limit).offset((page - 1) * limit)
    } else {
      data = await db.select().from(payments).where(eq(payments.userId, session.user.id)).orderBy(desc(payments.createdAt)).limit(limit).offset((page - 1) * limit)
    }

    return NextResponse.json({ data, page, limit })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = createPaymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { enrollmentId, amount, method, transactionId, senderNumber, notes } = parsed.data

    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId))
    if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

    if (session.user.role !== 'admin' && enrollment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (amount > enrollment.dueAmount) {
      return NextResponse.json({ error: 'Payment amount exceeds due amount' }, { status: 400 })
    }

    const result = await db.transaction(async (tx) => {
      const [payment] = await tx.insert(payments).values({
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
        await tx.update(enrollments).set({
          paidAmount: enrollment.paidAmount + amount,
          dueAmount: enrollment.dueAmount - amount,
          updatedAt: new Date(),
        }).where(eq(enrollments.id, enrollmentId))

        const [invoice] = await tx.select().from(invoices).where(eq(invoices.enrollmentId, enrollmentId))
        if (invoice) {
          const newPaidAmount = invoice.paidAmount + amount
          const newDueAmount = invoice.dueAmount - amount
          await tx.update(invoices).set({
            paidAmount: newPaidAmount,
            dueAmount: newDueAmount,
            status: newDueAmount <= 0 ? 'paid' : 'partial',
            updatedAt: new Date(),
          }).where(eq(invoices.id, invoice.id))
        }
      }

      return payment
    })

    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
