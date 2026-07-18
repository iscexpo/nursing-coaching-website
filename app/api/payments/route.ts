import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payments, enrollments, invoices } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { getSession, isAdmin } from '@/lib/permissions'
import { createPaymentSchema, paginationSchema } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

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

    const where = isAdmin(session.user.role) ? undefined : eq(payments.userId, session.user.id)

    const data = await db.select().from(payments)
      .where(where)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db.select({ count: count() }).from(payments).where(where)

    return NextResponse.json({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, { windowMs: 60_000, max: 10, prefix: 'payments.create' })
  if (limiter) return limiter

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

    if (!isAdmin(session.user.role) && enrollment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (enrollment.status !== 'active' && enrollment.status !== 'approved') {
      return NextResponse.json({ error: 'Cannot make payment for enrollment with status: ' + enrollment.status }, { status: 400 })
    }

    if (amount > enrollment.dueAmount) {
      return NextResponse.json({ error: 'Payment amount exceeds due amount' }, { status: 400 })
    }

    const isCashPayment = method === 'cash'
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
        status: isCashPayment && isAdmin(session.user.role) ? 'verified' : 'pending',
      }).returning()

      if (isCashPayment && isAdmin(session.user.role)) {
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

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'payment',
          resourceId: result.id,
          action: 'create',
          details: { enrollmentId, amount, method, status: result.status },
        },
        session,
        request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
      )
    )

    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
