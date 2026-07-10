import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allCourses = await db.select().from(courses).orderBy(desc(courses.createdAt))
    return NextResponse.json(allCourses)
  } catch (error) {
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
    const { id, slug, title, description, shortDescription, duration, fee, discountFee, image, features, maxStudents, schedule } = body

    const [course] = await db.insert(courses).values({
      id: id || crypto.randomUUID(),
      slug,
      title,
      description,
      shortDescription,
      duration,
      fee,
      discountFee,
      image,
      features,
      maxStudents,
      schedule,
    }).returning()

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}