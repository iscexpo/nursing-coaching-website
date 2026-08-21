import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession, isAdmin } from '@/lib/core/permissions'
import { createNotificationSchema } from '@/lib/core/validations'
import { ok, unauthorized, forbidden, serverError, validationError } from '@/lib/api/response'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const data = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt))

    return ok(data)
  } catch (error) {
    console.error("Error:", error)
    return serverError('Failed to fetch notifications')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = createNotificationSchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const { title, message, type, link, targetUserId } = parsed.data

    if (!isAdmin(session.user.role)) {
      return forbidden('Only admins can create notifications')
    }

    const userId = targetUserId || session.user.id

    const [notification] = await db
      .insert(notifications)
      .values({
        id: randomUUID(),
        userId,
        title,
        message,
        type: type || 'info',
        link,
      })
      .returning()

    return ok(notification, 201)
  } catch (error) {
    console.error("Error:", error)
    return serverError('Failed to create notification')
  }
}
