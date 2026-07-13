import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/permissions'
import { createCourseSchema, paginationSchema } from '@/lib/validations'

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
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 }

    const where = showAll ? undefined : eq(courses.isActive, true)

    const allCourses = await db.select().from(courses)
      .where(where)
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db.select({ count: count() }).from(courses).where(where)

    return NextResponse.json({ data: allCourses, page, limit, total: totalRow?.count ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = createCourseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [course] = await db.insert(courses).values({
      id: crypto.randomUUID(),
      ...parsed.data,
    }).returning()

    return NextResponse.json(course, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}
