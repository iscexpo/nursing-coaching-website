import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import {
  unauthorized,
  ok,
  serverError,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { admitCards } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/core/permissions'
import { createAdmitCardSchema, paginationSchema } from '@/lib/core/validations'

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
      : eq(admitCards.userId, session.user.id)

    const data = await db
      .select()
      .from(admitCards)
      .where(where)
      .orderBy(desc(admitCards.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db
      .select({ count: count() })
      .from(admitCards)
      .where(where)

    return ok({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch (error) {
    console.error('Error:', error)
    return serverError('Failed to fetch admit cards')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = createAdmitCardSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const [card] = await db
      .insert(admitCards)
      .values({
        id: randomUUID(),
        ...parsed.data,
      })
      .returning()

    return ok(card, 201)
  } catch (error) {
    console.error('Error:', error)
    return serverError('Failed to create admit card')
  }
}
