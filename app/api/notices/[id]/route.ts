import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'
import { updateNoticeSchema } from '@/lib/validations'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [notice] = await db.select().from(notices).where(eq(notices.id, id))
    if (!notice) return NextResponse.json({ error: 'Notice not found' }, { status: 404 })

    return NextResponse.json(notice)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notice' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateNoticeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [updated] = await db.update(notices).set({
      ...parsed.data,
      updatedAt: new Date(),
    }).where(eq(notices.id, id)).returning()

    if (!updated) return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update notice' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [deleted] = await db.delete(notices).where(eq(notices.id, id)).returning()
    if (!deleted) return NextResponse.json({ error: 'Notice not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 })
  }
}
