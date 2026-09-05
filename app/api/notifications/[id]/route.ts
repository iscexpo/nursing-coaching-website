import { NextRequest } from 'next/server'
import {
  unauthorized,
  forbidden,
  ok,
  notFound,
  serverError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, isAdmin } from '@/lib/core/permissions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return unauthorized()

    const [existing] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
    if (!existing) return notFound('Notification not found')

    if (existing.userId !== session.user.id) {
      return forbidden()
    }

    const body = await request.json()
    const { isRead } = body as { isRead?: boolean }

    const [updated] = await db
      .update(notifications)
      .set({
        isRead: isRead ?? existing.isRead,
        readAt:
          isRead === true && !existing.isRead ? new Date() : existing.readAt,
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, id))
      .returning()

    return ok(updated)
  } catch {
    return serverError('Failed to update notification')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return unauthorized()

    const [existing] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
    if (!existing) return notFound('Notification not found')

    if (existing.userId !== session.user.id && !isAdmin(session.user.role)) {
      return forbidden()
    }

    await db.delete(notifications).where(eq(notifications.id, id))
    return ok({ success: true })
  } catch {
    return serverError('Failed to delete notification')
  }
}
