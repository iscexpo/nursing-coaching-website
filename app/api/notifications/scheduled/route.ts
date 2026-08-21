import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
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

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch scheduled notifications' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = createScheduledNotificationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
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

    return NextResponse.json(scheduled, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to schedule notification' },
      { status: 500 },
    )
  }
}