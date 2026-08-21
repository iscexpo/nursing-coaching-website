import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import {
  unauthorized,
  ok,
  notFound,
  serverError,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { admissions, user } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { updateAdmissionSchema } from '@/lib/core/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { deriveStudentEmail } from '@/lib/core/domain'

async function generateNextStudentId(): Promise<string> {
  const rows = await db
    .select({ studentId: user.studentId })
    .from(user)
    .where(sql`${user.studentId} IS NOT NULL`)
  let max = 0
  for (const row of rows) {
    const match = /^STU-(\d+)$/.exec(row.studentId || '')
    if (match) {
      const n = parseInt(match[1], 10)
      if (n > max) max = n
    }
  }
  return `STU-${String(max + 1).padStart(3, '0')}`
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

  const password = randomUUID().replace(/-/g, '').slice(0, 10)

  const result = await auth.api.signUpEmail({
    body: {
      name: admission.name,
      email,
      password,
    },
  })

  const userId = result.user.id

  const studentId = await generateNextStudentId()

  const updateData: Record<string, unknown> = {
    phoneNumber: phone,
    admissionId: admission.id,
    studentId,
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
    if (!session) return unauthorized()

    const [admission] = await db
      .select()
      .from(admissions)
      .where(eq(admissions.id, id))
    if (!admission) return notFound('Admission not found')

    return ok(admission)
  } catch {
    return serverError('Failed to fetch admission')
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
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = updateAdmissionSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const [existing] = await db
      .select()
      .from(admissions)
      .where(eq(admissions.id, id))
    if (!existing) return notFound('Admission not found')

    const [updated] = await db
      .update(admissions)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(admissions.id, id))
      .returning()
    if (!updated) return notFound('Admission not found')

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

    return ok({
      ...updated,
      createdStudentId,
    })
  } catch {
    return serverError('Failed to update admission')
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
    if (!session) return unauthorized()

    const [existing] = await db
      .select()
      .from(admissions)
      .where(eq(admissions.id, id))
    if (!existing) return notFound('Admission not found')

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

    return ok({ success: true })
  } catch {
    return serverError('Failed to delete admission')
  }
}
