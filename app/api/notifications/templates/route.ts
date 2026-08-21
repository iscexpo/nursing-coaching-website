import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notificationTemplates } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import {
  createNotificationTemplateSchema,
  updateNotificationTemplateSchema,
} from '@/lib/core/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

/**
 * GET /api/notifications/templates — list notification templates (admin)
 * POST /api/notifications/templates — create a template (admin)
 */
export async function GET() {
  try {
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response

    const data = await db
      .select()
      .from(notificationTemplates)
      .orderBy(desc(notificationTemplates.createdAt))

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
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
    const parsed = createNotificationTemplateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [template] = await db
      .insert(notificationTemplates)
      .values({ id: randomUUID(), ...parsed.data })
      .returning()

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'notification_template',
          resourceId: template.id,
          action: 'notification_template.create',
          details: { name: template.name, channel: template.channel },
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return NextResponse.json(template, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 },
    )
  }
}