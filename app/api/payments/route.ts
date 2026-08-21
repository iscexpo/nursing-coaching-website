import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { payments, enrollments, invoices } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { getSession, isAdmin } from '@/lib/core/permissions'
import { createPaymentSchema, paginationSchema } from '@/lib/core/validations'
import { rateLimit } from '@/lib/core/rate-limit'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  serverError,
  validationError,
} from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20 }

    const where = isAdmin(session.user.role)
      ? undefined
      : eq(payments.userId, session.user.id)

    const data = await db
      .select()
      .from(payments)
      .where(where)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db
      .select({ count: count() })
      .from(payments)
      .where(where)

    return ok({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch (error) {
    console.error('Error:', error)
    return serverError('Failed to fetch payments')
  }
}

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 10,
    prefix: 'payments.create',
  })
  if (limiter) return limiter

  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = createPaymentSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const { enrollmentId, amount, method, transactionId, senderNumber, notes } =
      parsed.data

    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, enrollmentId))
    if (!enrollment) return notFound('Enrollment not found')

    if (!isAdmin(session.user.role) && enrollment.userId !== session.user.id) {
      return forbidden()
    }

    if (enrollment.status !== 'active' && enrollment.status !== 'approved') {
      return badRequest(
        'Cannot make payment for enrollment with status: ' + enrollment.status,
      )
    }

    if (amount > enrollment.dueAmount) {
      return badRequest('Payment amount exceeds due amount')
    }

    const isCashPayment = method === 'cash'
    const result = await db.transaction(async (tx) => {
      const [payment] = await tx
        .insert(payments)
        .values({
          id: randomUUID(),
          userId: enrollment.userId,
          enrollmentId,
          amount,
          method,
          transactionId,
          senderNumber,
          notes,
          status:
            isCashPayment && isAdmin(session.user.role)
              ? 'verified'
              : 'pending',
        })
        .returning()

      if (isCashPayment && isAdmin(session.user.role)) {
        await tx
          .update(enrollments)
          .set({
            paidAmount: enrollment.paidAmount + amount,
            dueAmount: enrollment.dueAmount - amount,
            updatedAt: new Date(),
          })
          .where(eq(enrollments.id, enrollmentId))

        const [invoice] = await tx
          .select()
          .from(invoices)
          .where(eq(invoices.enrollmentId, enrollmentId))
        if (invoice) {
          const newPaidAmount = invoice.paidAmount + amount
          const newDueAmount = invoice.dueAmount - amount
          await tx
            .update(invoices)
            .set({
              paidAmount: newPaidAmount,
              dueAmount: newDueAmount,
              status: newDueAmount <= 0 ? 'paid' : 'partial',
              updatedAt: new Date(),
            })
            .where(eq(invoices.id, invoice.id))
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
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return ok(result, 201)
  } catch (error) {
    console.error('Error:', error)
    return serverError('Failed to create payment')
  }
}
