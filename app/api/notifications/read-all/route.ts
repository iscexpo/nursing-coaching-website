import { NextResponse } from 'next/server'
import { unauthorized } from '@/lib/api/response'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getSession } from '@/lib/core/permissions'

export async function POST() {
  try {
    const session = await getSession()
    if (!session)
      return unauthorized()

    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.isRead, false),
        ),
      )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to mark all as read' },
      { status: 500 },
    )
  }
}
