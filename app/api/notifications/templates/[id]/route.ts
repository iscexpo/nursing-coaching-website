import { NextRequest, NextResponse } from 'next/server'
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = updateNotificationTemplateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [existing] = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.id, id))
    if (!existing)
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 },
      )

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

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 },
    )
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 },
    )
  }
}