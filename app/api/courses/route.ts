import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'
import { createCourseSchema, paginationSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 }

    const allCourses = await db.select().from(courses)
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    return NextResponse.json({ data: allCourses, page, limit })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
