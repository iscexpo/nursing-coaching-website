import { NextRequest } from 'next/server'
import { ok, serverError } from '@/lib/api/response'
import { db } from '@/lib/db'
import { enrollments, courses } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/core/permissions'
import { sql, desc, and, gte, lte, count, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const courseId = searchParams.get('courseId')

    const conditions = []

    if (startDate) {
      conditions.push(gte(enrollments.enrolledAt, new Date(startDate)))
    }
    if (endDate) {
      conditions.push(lte(enrollments.enrolledAt, new Date(endDate)))
    }
    if (courseId) {
      conditions.push(eq(enrollments.courseId, courseId))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [summaryRow] = await db
      .select({
        totalEnrollments: count(),
        activeEnrollments: sql<number>`cast(sum(case when ${enrollments.status} = 'active' then 1 else 0 end) as int)`,
        completedEnrollments: sql<number>`cast(sum(case when ${enrollments.status} = 'completed' then 1 else 0 end) as int)`,
        cancelledEnrollments: sql<number>`cast(sum(case when ${enrollments.status} = 'cancelled' then 1 else 0 end) as int)`,
        totalRevenue: sql<number>`cast(coalesce(sum(${enrollments.totalFee}), 0) as int)`,
        totalPaid: sql<number>`cast(coalesce(sum(${enrollments.paidAmount}), 0) as int)`,
        totalDue: sql<number>`cast(coalesce(sum(${enrollments.dueAmount}), 0) as int)`,
      })
      .from(enrollments)
      .where(where)

    const byStatus = await db
      .select({
        status: enrollments.status,
        count: count(),
      })
      .from(enrollments)
      .where(where)
      .groupBy(enrollments.status)

    const byCourse = await db
      .select({
        courseId: enrollments.courseId,
        courseTitle: courses.title,
        count: count(),
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(where)
      .groupBy(enrollments.courseId, courses.title)
      .orderBy(desc(count()))
      .limit(10)

    const byDate = await db
      .select({
        date: sql<string>`to_char(${enrollments.enrolledAt}, 'YYYY-MM-DD')`,
        count: count(),
      })
      .from(enrollments)
      .where(where)
      .groupBy(sql`to_char(${enrollments.enrolledAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${enrollments.enrolledAt}, 'YYYY-MM-DD')`)

    return ok({
      summary: {
        totalEnrollments: summaryRow?.totalEnrollments ?? 0,
        activeEnrollments: summaryRow?.activeEnrollments ?? 0,
        completedEnrollments: summaryRow?.completedEnrollments ?? 0,
        cancelledEnrollments: summaryRow?.cancelledEnrollments ?? 0,
        totalRevenue: summaryRow?.totalRevenue ?? 0,
        totalPaid: summaryRow?.totalPaid ?? 0,
        totalDue: summaryRow?.totalDue ?? 0,
      },
      byStatus,
      byCourse,
      byDate,
    })
  } catch {
    return serverError('Failed to fetch enrollment report')
  }
}
