import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession, isAdmin } from '@/lib/permissions'
import { createNotificationSchema } from '@/lib/validations'

export async function GET() {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt))

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = createNotificationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { title, message, type, link, targetUserId } = parsed.data

    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: 'Only admins can create notifications' },
        { status: 403 },
      )
    }

    const userId = targetUserId || session.user.id

    const [notification] = await db
      .insert(notifications)
      .values({
        id: crypto.randomUUID(),
        userId,
        title,
        message,
        type: type || 'info',
        link,
      })
      .returning()

    return NextResponse.json(notification, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 },
    )
  }
}
