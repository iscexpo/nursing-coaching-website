import { NextRequest } from 'next/server'
import {
  ok,
  notFound,
  conflict,
  serverError,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { courseCategories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/core/permissions'
import { updateCourseCategorySchema } from '@/lib/core/validations'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { id } = await params
    const body = await request.json()
    const parsed = updateCourseCategorySchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const [existing] = await db
      .select()
      .from(courseCategories)
      .where(eq(courseCategories.id, id))
      .limit(1)
    if (!existing) return notFound('Course category not found')

    if (parsed.data.name && parsed.data.name !== existing.name) {
      const duplicate = await db
        .select()
        .from(courseCategories)
        .where(eq(courseCategories.name, parsed.data.name))
        .limit(1)
      if (duplicate.length > 0) {
        return conflict('এই ক্যাটাগরি ইতিমধ্যে বিদ্যমান')
      }
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await db
        .select()
        .from(courseCategories)
        .where(eq(courseCategories.slug, parsed.data.slug))
        .limit(1)
      if (slugExists.length > 0) {
        return conflict('এই স্লাগ ইতিমধ্যে ব্যবহৃত হচ্ছে')
      }
    }

    const [updated] = await db
      .update(courseCategories)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(courseCategories.id, id))
      .returning()

    return ok(updated)
  } catch (error) {
    console.error('Failed to update course category:', error)
    return serverError('Failed to update course category')
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { id } = await params
    const [existing] = await db
      .select()
      .from(courseCategories)
      .where(eq(courseCategories.id, id))
      .limit(1)
    if (!existing) return notFound('Course category not found')

    await db.delete(courseCategories).where(eq(courseCategories.id, id))
    return ok({ success: true })
  } catch (error) {
    console.error('Failed to delete course category:', error)
    return serverError('Failed to delete course category')
  }
}
