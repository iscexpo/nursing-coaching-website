import { NextRequest } from 'next/server'
import {unauthorized, forbidden, notFound, serverError, ok, badRequest, validationError} from '@/lib/api/response'
import { db } from '@/lib/db'
import { user, account } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import {
  getSession,
  requireAdmin,
  isAdmin,
  isSuperAdmin,
} from '@/lib/core/permissions'
import { updateStudentSchema } from '@/lib/core/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { hashPassword } from 'better-auth/crypto'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session)
      return unauthorized()

    if (
      session.user.role !== 'admin' &&
      session.user.role !== 'super-admin' &&
      session.user.id !== id
    ) {
      return forbidden('Access denied')
    }

    const [found] = await db.select().from(user).where(eq(user.id, id))
    if (!found)
      return notFound('Student not found')

    return ok(found)
  } catch {
    return serverError('Failed to fetch student')
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
    const parsed = updateStudentSchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const [existing] = await db.select().from(user).where(eq(user.id, id))
    if (!existing)
      return notFound('Student not found')

    const { role, password, ...safeData } = parsed.data

    if (role && !isSuperAdmin(session.user.role)) {
      return forbidden('শুধুমাত্র সুপার-অ্যাডমিন ভূমিকা পরিবর্তন করতে পারেন')
    }

    if (password) {
      const hashed = await hashPassword(password)
      await db
        .update(account)
        .set({ password: hashed, updatedAt: new Date() })
        .where(eq(account.userId, id))
    }

    const updatePayload: Record<string, unknown> = {
      ...safeData,
      updatedAt: new Date(),
    }
    if (role) updatePayload.role = role

    const [updated] = await db
      .update(user)
      .set(updatePayload)
      .where(eq(user.id, id))
      .returning()

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'student',
          resourceId: id,
          action: 'student.update',
          details: parsed.data,
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return ok(updated)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update student'
    return serverError(message)
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

    if (id === session.user.id) {
      return badRequest('নিজের অ্যাকাউন্ট মুছে ফেলা যাবে না')
    }

    const [existing] = await db.select().from(user).where(eq(user.id, id))
    if (!existing)
      return notFound('Student not found')

    await db.delete(user).where(eq(user.id, id))

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'student',
          resourceId: id,
          action: 'student.delete',
          details: {},
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return ok({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete student'
    return serverError(message)
  }
}
