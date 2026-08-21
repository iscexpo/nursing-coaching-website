import { NextRequest } from 'next/server'
import {
  unauthorized,
  ok,
  notFound,
  serverError,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { updateAttendanceSchema } from '@/lib/core/validations'

export async function PUT(
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
    const parsed = updateAttendanceSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const [updated] = await db
      .update(attendance)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(attendance.id, id))
      .returning()

    if (!updated) return notFound('Attendance record not found')
    return ok(updated)
  } catch {
    return serverError('Failed to update attendance')
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

    const [deleted] = await db
      .delete(attendance)
      .where(eq(attendance.id, id))
      .returning()
    if (!deleted) return notFound('Attendance record not found')

    return ok({ success: true })
  } catch {
    return serverError('Failed to delete attendance')
  }
}
