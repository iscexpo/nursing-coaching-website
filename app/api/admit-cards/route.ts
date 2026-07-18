import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { admitCards } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/permissions'
import { createAdmitCardSchema, paginationSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    return NextResponse.json({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch admit cards' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = createAdmitCardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [card] = await db
      .insert(admitCards)
      .values({
        id: crypto.randomUUID(),
        ...parsed.data,
      })
      .returning()

    return NextResponse.json(card, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create admit card' },
      { status: 500 },
    )
  }
}
