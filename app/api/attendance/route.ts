import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'
import { eq, desc, and, gte, lte, count } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/core/permissions'
import {
  createAttendanceSchema,
  paginationSchema,
} from '@/lib/core/validations'
import {
  ok,
  unauthorized,
  conflict,
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

    const data = await db
      .select()
      .from(attendance)
      .where(where)
      .orderBy(desc(attendance.date))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db
      .select({ count: count() })
      .from(attendance)
      .where(where)

    return ok({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch (error) {
    console.error('Error:', error)
    return serverError('Failed to fetch attendance')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = createAttendanceSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const { userId, date, status, time } = parsed.data

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const existing = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.userId, userId),
          gte(attendance.date, startOfDay),
          lte(attendance.date, endOfDay),
        ),
      )

    if (existing.length > 0) {
      return conflict('Attendance already marked for this date')
    }

    const [record] = await db
      .insert(attendance)
      .values({
        id: randomUUID(),
        userId,
        date,
        status,
        time,
        markedBy: session.user.id,
      })
      .returning()

    return ok(record, 201)
  } catch (error) {
    console.error('Error:', error)
    return serverError('Failed to mark attendance')
  }
}
