import { NextRequest } from 'next/server'
import {ok, serverError} from '@/lib/api/response'
import { db } from '@/lib/db'
import { payments, enrollments, user, courses } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/core/permissions'
import { sql, desc, and, eq, gte, lte, count, sum } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const courseId = searchParams.get('courseId')

    const baseConditions = []
    if (startDate) {
      baseConditions.push(gte(payments.createdAt, new Date(startDate)))
    }
    if (endDate) {
      baseConditions.push(lte(payments.createdAt, new Date(endDate)))
    }
    if (courseId) {
      baseConditions.push(eq(enrollments.courseId, courseId))
    }

    const paymentJoin = sql`${payments.enrollmentId} = ${enrollments.id}`

    const [summaryRow] = await db
      .select({
        totalRevenue: sql<number>`coalesce(sum(${payments.amount}), 0)`,
        totalPayments: count(),
      })
      .from(payments)
      .innerJoin(enrollments, paymentJoin)
      .where(and(...baseConditions, eq(payments.status, 'verified')))

    const [pendingRow] = await db
      .select({
        pendingRevenue: sql<number>`coalesce(sum(${payments.amount}), 0)`,
      })
      .from(payments)
      .innerJoin(enrollments, paymentJoin)
      .where(and(...baseConditions, eq(payments.status, 'pending')))

    const totalPayments = summaryRow?.totalPayments ?? 0
    const totalRevenue = summaryRow?.totalRevenue ?? 0
    const verifiedRevenue = totalRevenue
    const pendingRevenue = pendingRow?.pendingRevenue ?? 0
    const avgPayment =
      totalPayments > 0 ? Math.round(totalRevenue / totalPayments) : 0

    const byMethod = await db
      .select({
        method: payments.method,
        count: count(),
        total: sql<number>`coalesce(sum(${payments.amount}), 0)`,
      })
      .from(payments)
      .innerJoin(enrollments, paymentJoin)
      .where(and(...baseConditions, eq(payments.status, 'verified')))
      .groupBy(payments.method)

    const byDate = await db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${payments.createdAt}), 'YYYY-MM-DD')`,
        revenue: sql<number>`coalesce(sum(${payments.amount}), 0)`,
        count: count(),
      })
      .from(payments)
      .innerJoin(enrollments, paymentJoin)
      .where(and(...baseConditions, eq(payments.status, 'verified')))
      .groupBy(sql`date_trunc('day', ${payments.createdAt})`)
      .orderBy(desc(sql`date_trunc('day', ${payments.createdAt})`))

    const recentPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        method: payments.method,
        transactionId: payments.transactionId,
        paidAt: payments.paidAt,
        userName: user.name,
        courseTitle: courses.title,
      })
      .from(payments)
      .innerJoin(enrollments, sql`${payments.enrollmentId} = ${enrollments.id}`)
      .innerJoin(user, sql`${payments.userId} = ${user.id}`)
      .innerJoin(courses, sql`${enrollments.courseId} = ${courses.id}`)
      .where(and(...baseConditions, eq(payments.status, 'verified')))
      .orderBy(desc(payments.createdAt))
      .limit(10)

    return ok({
      summary: {
        totalRevenue,
        verifiedRevenue,
        pendingRevenue,
        totalPayments,
        avgPayment,
      },
      byMethod,
      byDate,
      recentPayments,
    })
  } catch {
    return serverError('Failed to fetch revenue report')
  }
}
