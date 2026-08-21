import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/core/permissions'
import { createCourseSchema, paginationSchema } from '@/lib/core/validations'
import { ok, conflict, serverError, validationError } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    // Public endpoint: the marketing site lists courses without a session.
    // Admins see every course; everyone else only sees active courses.
    const session = await getSession()
    const showAll = isAdmin(session?.user?.role)

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20 }

    const where = showAll ? undefined : eq(courses.isActive, true)

    const allCourses = await db
      .select()
      .from(courses)
      .where(where)
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db
      .select({ count: count() })
      .from(courses)
      .where(where)

    return ok({
      data: allCourses,
      page,
      limit,
      total: totalRow?.count ?? 0,
    })
  } catch (error) {
    console.error('Failed to fetch courses:', error)
    return serverError('Failed to fetch courses')
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = createCourseSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const [course] = await db
      .insert(courses)
      .values({
        id: randomUUID(),
        ...parsed.data,
      })
      .returning()

    return ok(course, 201)
  } catch (error) {
    console.error('Failed to create course:', error)
    const code = (error as { code?: string })?.code
    if (code === '23505') {
      return conflict('এই স্লাগ ইতিমধ্যে ব্যবহৃত হয়েছে')
    }
    return serverError('Failed to create course')
  }
}
