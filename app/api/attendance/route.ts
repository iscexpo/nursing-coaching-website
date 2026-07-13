import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'
import { eq, desc, and, gte, lte, count } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/permissions'
import { createAttendanceSchema, paginationSchema } from '@/lib/validations'

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
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const conditions = []

    if (isAdmin(session.user.role)) {
      if (userId) conditions.push(eq(attendance.userId, userId))
    } else {
      conditions.push(eq(attendance.userId, session.user.id))
    }

    if (startDate) conditions.push(gte(attendance.date, new Date(startDate)))
    if (endDate) conditions.push(lte(attendance.date, new Date(endDate)))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const data = await db.select().from(attendance)
      .where(where)
      .orderBy(desc(attendance.date))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db.select({ count: count() }).from(attendance).where(where)

    return NextResponse.json({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = createAttendanceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { userId, date, status, time } = parsed.data

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const existing = await db.select().from(attendance).where(
      and(
        eq(attendance.userId, userId),
        gte(attendance.date, startOfDay),
        lte(attendance.date, endOfDay),
      )
    )

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Attendance already marked for this date' }, { status: 409 })
    }

    const [record] = await db.insert(attendance).values({
      id: crypto.randomUUID(),
      userId,
      date,
      status,
      time,
      markedBy: session.user.id,
    }).returning()

    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 })
  }
}
