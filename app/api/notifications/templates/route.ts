import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import {unauthorized, ok, serverError, validationError} from '@/lib/api/response'
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

    return ok({ data })
  } catch {
    return serverError('Failed to fetch templates')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return unauthorized()

    const body = await request.json()
    const parsed = createNotificationTemplateSchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
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

    return ok(template, 201)
  } catch {
    return serverError('Failed to create template')
  }
}