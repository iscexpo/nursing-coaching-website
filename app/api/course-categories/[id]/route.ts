import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courseCategories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/permissions'
import { updateCourseCategorySchema } from '@/lib/validations'

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
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [existing] = await db
      .select()
      .from(courseCategories)
      .where(eq(courseCategories.id, id))
      .limit(1)
    if (!existing)
      return NextResponse.json(
        { error: 'Course category not found' },
        { status: 404 },
      )

    if (parsed.data.name && parsed.data.name !== existing.name) {
      const duplicate = await db
        .select()
        .from(courseCategories)
        .where(eq(courseCategories.name, parsed.data.name))
        .limit(1)
      if (duplicate.length > 0) {
        return NextResponse.json(
          { error: 'এই ক্যাটাগরি ইতিমধ্যে বিদ্যমান' },
          { status: 409 },
        )
      }
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await db
        .select()
        .from(courseCategories)
        .where(eq(courseCategories.slug, parsed.data.slug))
        .limit(1)
      if (slugExists.length > 0) {
        return NextResponse.json(
          { error: 'এই স্লাগ ইতিমধ্যে ব্যবহৃত হচ্ছে' },
          { status: 409 },
        )
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

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update course category:', error)
    return NextResponse.json(
      { error: 'Failed to update course category' },
      { status: 500 },
    )
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
    if (!existing)
      return NextResponse.json(
        { error: 'Course category not found' },
        { status: 404 },
      )

    await db.delete(courseCategories).where(eq(courseCategories.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete course category:', error)
    return NextResponse.json(
      { error: 'Failed to delete course category' },
      { status: 500 },
    )
  }
}
