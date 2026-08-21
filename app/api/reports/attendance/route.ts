import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { attendance, user } from '@/lib/db/schema'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { sql, desc, and, gte, lte, count, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const userId = searchParams.get('userId')

    const conditions = []

    if (startDate) {
      conditions.push(gte(attendance.date, new Date(startDate)))
    }
    if (endDate) {
      conditions.push(lte(attendance.date, new Date(endDate)))
    }
    if (userId) {
      conditions.push(eq(attendance.userId, userId))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [summaryRow] = await db
      .select({
        totalDays: count(),
        presentCount: sql<number>`cast(sum(case when ${attendance.status} = 'present' then 1 else 0 end) as int)`,
        lateCount: sql<number>`cast(sum(case when ${attendance.status} = 'late' then 1 else 0 end) as int)`,
        absentCount: sql<number>`cast(sum(case when ${attendance.status} = 'absent' then 1 else 0 end) as int)`,
      })
      .from(attendance)
      .where(where)

    const totalDays = summaryRow?.totalDays ?? 0
    const presentCount = summaryRow?.presentCount ?? 0
    const lateCount = summaryRow?.lateCount ?? 0
    const absentCount = summaryRow?.absentCount ?? 0
    const attendanceRate =
      totalDays > 0 ? ((presentCount + lateCount) / totalDays) * 100 : 0

    const byDate = await db
      .select({
        date: sql<string>`to_char(${attendance.date}, 'YYYY-MM-DD')`,
        present: sql<number>`cast(sum(case when ${attendance.status} = 'present' then 1 else 0 end) as int)`,
        late: sql<number>`cast(sum(case when ${attendance.status} = 'late' then 1 else 0 end) as int)`,
        absent: sql<number>`cast(sum(case when ${attendance.status} = 'absent' then 1 else 0 end) as int)`,
        total: count(),
      })
      .from(attendance)
      .where(where)
      .groupBy(sql`to_char(${attendance.date}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${attendance.date}, 'YYYY-MM-DD')`)

    const topStudents = await db
      .select({
        userId: attendance.userId,
        userName: user.name,
        presentRate: sql<number>`cast(
          case when count(*) > 0
            then sum(case when ${attendance.status} in ('present', 'late') then 1 else 0 end)::float / count(*)::float * 100
            else 0
          end as double precision
        )`,
      })
      .from(attendance)
      .leftJoin(user, eq(attendance.userId, user.id))
      .where(where)
      .groupBy(attendance.userId, user.name)
      .orderBy(
        desc(sql`case when count(*) > 0
        then sum(case when ${attendance.status} in ('present', 'late') then 1 else 0 end)::float / count(*)::float * 100
        else 0
      end`),
      )
      .limit(20)

    return NextResponse.json({
      summary: {
        totalDays,
        presentCount,
        lateCount,
        absentCount,
        attendanceRate,
      },
      byDate,
      topStudents,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch attendance report' },
      { status: 500 },
    )
  }
}
