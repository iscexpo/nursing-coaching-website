import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { admissions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { updateAdmissionSchema } from '@/lib/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

export async function GET(
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

    const [admission] = await db
      .select()
      .from(admissions)
      .where(eq(admissions.id, id))
    if (!admission)
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 },
      )

    return NextResponse.json(admission)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch admission' },
      { status: 500 },
    )
  }
}

export async function PATCH(
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
    const parsed = updateAdmissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [existing] = await db
      .select()
      .from(admissions)
      .where(eq(admissions.id, id))
    if (!existing)
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 },
      )

    const [updated] = await db
      .update(admissions)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(admissions.id, id))
      .returning()
    if (!updated)
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 },
      )

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'admission',
          resourceId: id,
          action: 'update',
          details: { reference: updated.reference, status: updated.status },
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
      { error: 'Failed to update admission' },
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

    const [existing] = await db
      .select()
      .from(admissions)
      .where(eq(admissions.id, id))
    if (!existing)
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 },
      )

    await db.delete(admissions).where(eq(admissions.id, id))

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'admission',
          resourceId: id,
          action: 'delete',
          details: { reference: existing.reference },
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
      { error: 'Failed to delete admission' },
      { status: 500 },
    )
  }
}
