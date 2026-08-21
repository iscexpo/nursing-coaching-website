import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import {
  unauthorized,
  ok,
  serverError,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { scheduledNotifications } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { createScheduledNotificationSchema } from '@/lib/core/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

/**
 * GET /api/notifications/scheduled — list scheduled notifications (admin)
 * POST /api/notifications/scheduled — schedule a notification (admin)
 */
export async function GET() {
  try {
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response

    const data = await db
      .select()
      .from(scheduledNotifications)
      .orderBy(desc(scheduledNotifications.scheduledAt))

    return ok({ data })
  } catch {
    return serverError('Failed to fetch scheduled notifications')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = createScheduledNotificationSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const [scheduled] = await db
      .insert(scheduledNotifications)
      .values({ id: randomUUID(), ...parsed.data })
      .returning()

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'scheduled_notification',
          resourceId: scheduled.id,
          action: 'scheduled_notification.create',
          details: {
            title: scheduled.title,
            scheduledAt: scheduled.scheduledAt.toISOString(),
          },
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return ok(scheduled, 201)
  } catch {
    return serverError('Failed to schedule notification')
  }
}
