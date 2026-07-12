import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { admitCards } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { createAdmitCardSchema, paginationSchema } from '@/lib/validations'

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

    let data
    if (session.user.role === 'admin') {
      data = await db.select().from(admitCards).orderBy(desc(admitCards.createdAt)).limit(limit).offset((page - 1) * limit)
    } else {
      data = await db.select().from(admitCards).where(eq(admitCards.userId, session.user.id)).orderBy(desc(admitCards.createdAt)).limit(limit).offset((page - 1) * limit)
    }

    return NextResponse.json({ data, page, limit })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch admit cards' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = createAdmitCardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [card] = await db.insert(admitCards).values({
      id: crypto.randomUUID(),
      ...parsed.data,
    }).returning()

    return NextResponse.json(card, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create admit card' }, { status: 500 })
  }
}
