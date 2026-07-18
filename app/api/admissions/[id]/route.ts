import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { admissions, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { getSession, requireAdmin } from '@/lib/permissions'
import { updateAdmissionSchema } from '@/lib/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

function deriveStudentEmail(phone: string): string {
  const normalized = phone.replace(/[^0-9]/g, '')
  return `student-${normalized}@iscexpo.edu.bd`
}

async function ensureStudentFromAdmission(admission: {
  id: string
  name: string
  phone: string
  ssc: unknown
  hsc: unknown
  honors: unknown
}) {
  const email = deriveStudentEmail(admission.phone)
  const phone = admission.phone

  const [existing] = await db.select().from(user).where(eq(user.email, email))
  if (existing) {
    if (!existing.admissionId) {
      await db
        .update(user)
        .set({ admissionId: admission.id })
        .where(eq(user.id, existing.id))
    }
    return existing
  }

  const [existingPhone] = await db
    .select()
    .from(user)
    .where(eq(user.phoneNumber, phone))
  if (existingPhone) {
    if (!existingPhone.admissionId) {
      await db
        .update(user)
        .set({ admissionId: admission.id })
        .where(eq(user.id, existingPhone.id))
    }
    return existingPhone
  }

  const password = crypto.randomUUID().replace(/-/g, '').slice(0, 10)

  const result = await auth.api.signUpEmail({
    body: {
      name: admission.name,
      email,
      password,
    },
  })

  const userId = result.user.id

  const updateData: Record<string, unknown> = {
    phoneNumber: phone,
    admissionId: admission.id,
    phoneNumberVerified: true,
  }
  if (admission.ssc) updateData.ssc = admission.ssc
  if (admission.hsc) updateData.hsc = admission.hsc
  if (admission.honors) updateData.honors = admission.honors

  const [created] = await db
    .update(user)
    .set(updateData)
    .where(eq(user.id, userId))
    .returning()

  return created
}

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

    let createdStudentId: string | null = null
    if (parsed.data.status === 'approved' && existing.status !== 'approved') {
      const student = await ensureStudentFromAdmission(existing)
      createdStudentId = student.id
    }

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'admission',
          resourceId: id,
          action: 'update',
          details: {
            reference: updated.reference,
            status: updated.status,
            createdStudentId,
          },
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return NextResponse.json({
      ...updated,
      createdStudentId,
    })
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
