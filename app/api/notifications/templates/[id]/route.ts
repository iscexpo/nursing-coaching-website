import { NextRequest } from 'next/server'
import {unauthorized, ok, notFound, serverError, validationError} from '@/lib/api/response'
import { db } from '@/lib/db'
import { notificationTemplates } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { updateNotificationTemplateSchema } from '@/lib/core/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

/**
 * PUT /api/notifications/templates/[id] — update a template (admin)
 * DELETE /api/notifications/templates/[id] — delete a template (admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return unauthorized()

    const body = await request.json()
    const parsed = updateNotificationTemplateSchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const [existing] = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.id, id))
    if (!existing)
      return notFound('Template not found')

    const [updated] = await db
      .update(notificationTemplates)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(notificationTemplates.id, id))
      .returning()

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'notification_template',
          resourceId: id,
          action: 'notification_template.update',
          details: { name: updated.name },
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return ok(updated)
  } catch {
    return serverError('Failed to update template')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return unauthorized()

    await db
      .delete(notificationTemplates)
      .where(eq(notificationTemplates.id, id))

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'notification_template',
          resourceId: id,
          action: 'notification_template.delete',
          details: {},
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return ok({ success: true })
  } catch {
    return serverError('Failed to delete template')
  }
}