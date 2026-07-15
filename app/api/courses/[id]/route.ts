import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { updateCourseSchema } from '@/lib/validations'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [course] = await db.select().from(courses).where(eq(courses.id, id))
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    return NextResponse.json(course)
  } catch (error) {
    console.error('Failed to fetch course:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = updateCourseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [updated] = await db.update(courses).set({
      ...parsed.data,
      updatedAt: new Date(),
    }).where(eq(courses.id, id)).returning()

    if (!updated) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update course:', error)
    const code = (error as { code?: string })?.code
    if (code === '23505') {
      return NextResponse.json({ error: 'এই স্লাগ ইতিমধ্যে ব্যবহৃত হয়েছে', details: { slug: ['Slug already exists'] } }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const [deleted] = await db.delete(courses).where(eq(courses.id, id)).returning()
    if (!deleted) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete course:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}
