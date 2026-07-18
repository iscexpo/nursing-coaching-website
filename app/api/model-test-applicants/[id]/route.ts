import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { modelTestApplicants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { updateModelTestApplicantSchema } from '@/lib/validations'
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

    const [applicant] = await db
      .select()
      .from(modelTestApplicants)
      .where(eq(modelTestApplicants.id, id))
    if (!applicant)
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 },
      )

    return NextResponse.json(applicant)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch applicant' },
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
    const parsed = updateModelTestApplicantSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const [existing] = await db
      .select()
      .from(modelTestApplicants)
      .where(eq(modelTestApplicants.id, id))
    if (!existing)
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 },
      )

    const [updated] = await db
      .update(modelTestApplicants)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(modelTestApplicants.id, id))
      .returning()
    if (!updated)
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 },
      )

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'model_test_applicant',
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
      { error: 'Failed to update applicant' },
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
      .from(modelTestApplicants)
      .where(eq(modelTestApplicants.id, id))
    if (!existing)
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 },
      )

    await db.delete(modelTestApplicants).where(eq(modelTestApplicants.id, id))

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'model_test_applicant',
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
      { error: 'Failed to delete applicant' },
      { status: 500 },
    )
  }
}
