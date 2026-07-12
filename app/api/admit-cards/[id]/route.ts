import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { admitCards } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { updateAdmitCardSchema } from '@/lib/validations'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [card] = await db.select().from(admitCards).where(eq(admitCards.id, id))
    if (!card) return NextResponse.json({ error: 'Admit card not found' }, { status: 404 })

    if (session.user.role !== 'admin' && card.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(card)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch admit card' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = updateAdmitCardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [updated] = await db.update(admitCards).set({
      ...parsed.data,
      updatedAt: new Date(),
    }).where(eq(admitCards.id, id)).returning()

    if (!updated) return NextResponse.json({ error: 'Admit card not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update admit card' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [deleted] = await db.delete(admitCards).where(eq(admitCards.id, id)).returning()
    if (!deleted) return NextResponse.json({ error: 'Admit card not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete admit card' }, { status: 500 })
  }
}
