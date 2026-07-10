import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await db.select().from(notifications)
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt))

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, message, type, link, targetUserId } = body

    if (session.user.role === 'admin' && targetUserId) {
      const [notification] = await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: targetUserId,
        title,
        message,
        type,
        link,
      }).returning()
      return NextResponse.json(notification, { status: 201 })
    }

    const [notification] = await db.insert(notifications).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      title,
      message,
      type,
      link,
    }).returning()

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}