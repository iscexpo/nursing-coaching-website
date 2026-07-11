import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [existing] = await db.select().from(notifications).where(eq(notifications.id, id))
    if (!existing) return NextResponse.json({ error: 'Notification not found' }, { status: 404 })

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { isRead } = body as { isRead?: boolean }

    const [updated] = await db.update(notifications).set({
      isRead: isRead ?? existing.isRead,
      readAt: isRead === true && !existing.isRead ? new Date() : existing.readAt,
      updatedAt: new Date(),
    }).where(eq(notifications.id, id)).returning()

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [existing] = await db.select().from(notifications).where(eq(notifications.id, id))
    if (!existing) return NextResponse.json({ error: 'Notification not found' }, { status: 404 })

    if (existing.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.delete(notifications).where(eq(notifications.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
  }
}
