import { NextRequest, NextResponse } from 'next/server'
import { unauthorized, notFound } from '@/lib/api/response'
import { db } from '@/lib/db'
import { notices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { updateNoticeSchema } from '@/lib/core/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session)
      return unauthorized()

    const [notice] = await db.select().from(notices).where(eq(notices.id, id))
    if (!notice)
      return notFound('Notice not found')

    return NextResponse.json(notice)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch notice' },
      { status: 500 },
    )
  }
}

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
    const parsed = updateNoticeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [updated] = await db
      .update(notices)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(notices.id, id))
      .returning()

    if (!updated)
      return notFound('Notice not found')

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'notice',
          resourceId: id,
          action: 'update',
          details: parsed.data,
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
      { error: 'Failed to update notice' },
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
      return unauthorized()

    const [deleted] = await db
      .delete(notices)
      .where(eq(notices.id, id))
      .returning()
    if (!deleted)
      return notFound('Notice not found')

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'notice',
          resourceId: id,
          action: 'delete',
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
      { error: 'Failed to delete notice' },
      { status: 500 },
    )
  }
}
