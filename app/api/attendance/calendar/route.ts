import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { getSession, isAdmin } from '@/lib/core/permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // 0-indexed (0 = January)
    const year = searchParams.get('year')
    const userId = searchParams.get('userId')

    if (!month || !year) {
      return NextResponse.json(
        { error: 'month and year are required' },
        { status: 400 },
      )
    }

    const startDate = new Date(Number(year), Number(month), 1)
    const endDate = new Date(
      Number(year),
      Number(month) + 1,
      0,
      23,
      59,
      59,
      999,
    )

    const conditions = [
      gte(attendance.date, startDate),
      lte(attendance.date, endDate),
    ]

    if (isAdmin(session.user.role)) {
      if (userId) conditions.push(eq(attendance.userId, userId))
    } else {
      conditions.push(eq(attendance.userId, session.user.id))
    }

    const records = await db
      .select()
      .from(attendance)
      .where(and(...conditions))
      .orderBy(attendance.date)

    // Group by date for calendar view
    const byDate: Record<
      string,
      Array<{ id: string; userId: string; status: string; time: string | null }>
    > = {}
    for (const r of records) {
      const key = r.date.toISOString().slice(0, 10)
      if (!byDate[key]) byDate[key] = []
      byDate[key].push({
        id: r.id,
        userId: r.userId,
        status: r.status,
        time: r.time,
      })
    }

    return NextResponse.json({ records, byDate })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch calendar attendance' },
      { status: 500 },
    )
  }
}
