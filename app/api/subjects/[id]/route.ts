import { NextRequest } from 'next/server'
import {
  notFound,
  ok,
  conflict,
  serverError,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { subjects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/core/permissions'
import { updateSubjectSchema } from '@/lib/core/validations'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { id } = await params
    const body = await request.json()
    const parsed = updateSubjectSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const [existing] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1)
    if (!existing) return notFound('Subject not found')

    if (parsed.data.name && parsed.data.name !== existing.name) {
      const duplicate = await db
        .select()
        .from(subjects)
        .where(eq(subjects.name, parsed.data.name))
        .limit(1)
      if (duplicate.length > 0) {
        return conflict('এই বিষয় ইতিমধ্যে বিদ্যমান')
      }
    }

    const [updated] = await db
      .update(subjects)
      .set({
        ...parsed.data,
      })
      .where(eq(subjects.id, id))
      .returning()

    return ok(updated)
  } catch {
    return serverError('Failed to update subject')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { id } = await params
    const [existing] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1)
    if (!existing) return notFound('Subject not found')

    await db.delete(subjects).where(eq(subjects.id, id))
    return ok({ success: true })
  } catch {
    return serverError('Failed to delete subject')
  }
}
