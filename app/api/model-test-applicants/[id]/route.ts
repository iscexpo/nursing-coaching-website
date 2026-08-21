import { NextRequest } from 'next/server'
import {unauthorized, ok, notFound, serverError, validationError} from '@/lib/api/response'
import { db } from '@/lib/db'
import { modelTestApplicants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { updateModelTestApplicantSchema } from '@/lib/core/validations'
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
      return unauthorized()

    const [applicant] = await db
      .select()
      .from(modelTestApplicants)
      .where(eq(modelTestApplicants.id, id))
    if (!applicant)
      return notFound('Applicant not found')

    return ok(applicant)
  } catch {
    return serverError('Failed to fetch applicant')
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
      return unauthorized()

    const body = await request.json()
    const parsed = updateModelTestApplicantSchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors,)
    }

    const [existing] = await db
      .select()
      .from(modelTestApplicants)
      .where(eq(modelTestApplicants.id, id))
    if (!existing)
      return notFound('Applicant not found')

    const [updated] = await db
      .update(modelTestApplicants)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(modelTestApplicants.id, id))
      .returning()
    if (!updated)
      return notFound('Applicant not found')

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

    return ok(updated)
  } catch {
    return serverError('Failed to update applicant')
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

    const [existing] = await db
      .select()
      .from(modelTestApplicants)
      .where(eq(modelTestApplicants.id, id))
    if (!existing)
      return notFound('Applicant not found')

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

    return ok({ success: true })
  } catch {
    return serverError('Failed to delete applicant')
  }
}
