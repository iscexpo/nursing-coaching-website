import { NextRequest } from 'next/server'
import {ok, conflict, serverError, validationError} from '@/lib/api/response'
import { randomUUID } from 'node:crypto'
import { db } from '@/lib/db'
import { courseCategories } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/core/permissions'
import { createCourseCategorySchema } from '@/lib/core/validations'

export async function GET() {
  try {
    const data = await db
      .select()
      .from(courseCategories)
      .orderBy(asc(courseCategories.sortOrder), asc(courseCategories.name))
    return ok({ data })
  } catch (error) {
    console.error('Failed to fetch course categories:', error)
    return serverError('Failed to fetch course categories')
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = createCourseCategorySchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const existing = await db
      .select()
      .from(courseCategories)
      .where(eq(courseCategories.name, parsed.data.name))
      .limit(1)
    if (existing.length > 0) {
      return conflict('এই ক্যাটাগরি ইতিমধ্যে বিদ্যমান')
    }

    const slugExists = await db
      .select()
      .from(courseCategories)
      .where(eq(courseCategories.slug, parsed.data.slug))
      .limit(1)
    if (slugExists.length > 0) {
      return conflict('এই স্লাগ ইতিমধ্যে ব্যবহৃত হচ্ছে')
    }

    const [created] = await db
      .insert(courseCategories)
      .values({
        id: randomUUID(),
        ...parsed.data,
      })
      .returning()

    return ok(created, 201)
  } catch (error) {
    console.error('Failed to create course category:', error)
    return serverError('Failed to create course category')
  }
}
