import { NextRequest } from 'next/server'
import {unauthorized, notFound, ok, serverError, validationError} from '@/lib/api/response'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { updateCourseSchema } from '@/lib/core/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session)
      return unauthorized()

    const [course] = await db.select().from(courses).where(eq(courses.id, id))
    if (!course)
      return notFound('Course not found')

    return ok(course)
  } catch (error) {
    console.error('Failed to fetch course:', error)
    return serverError('Failed to fetch course')
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = updateCourseSchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const [updated] = await db
      .update(courses)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning()

    if (!updated)
      return notFound('Course not found')
    return ok(updated)
  } catch (error) {
    console.error('Failed to update course:', error)
    const code = (error as { code?: string })?.code
    if (code === '23505') {
      return ok(
        {
          error: 'এই স্লাগ ইতিমধ্যে ব্যবহৃত হয়েছে',
          details: { slug: ['Slug already exists'] },
        }, 409)
    }
    return serverError('Failed to update course')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const [deleted] = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning()
    if (!deleted)
      return notFound('Course not found')

    return ok({ success: true })
  } catch (error) {
    console.error('Failed to delete course:', error)
    return serverError('Failed to delete course')
  }
}
