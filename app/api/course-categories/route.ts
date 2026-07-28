import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courseCategories } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/permissions'
import { createCourseCategorySchema } from '@/lib/validations'

export async function GET() {
  try {
    const data = await db
      .select()
      .from(courseCategories)
      .orderBy(asc(courseCategories.sortOrder), asc(courseCategories.name))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch course categories' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = createCourseCategorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const existing = await db
      .select()
      .from(courseCategories)
      .where(eq(courseCategories.name, parsed.data.name))
      .limit(1)
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'এই ক্যাটাগরি ইতিমধ্যে বিদ্যমান' },
        { status: 409 },
      )
    }

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

    const [created] = await db
      .insert(courseCategories)
      .values({
        id: crypto.randomUUID(),
        ...parsed.data,
      })
      .returning()

    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create course category' },
      { status: 500 },
    )
  }
}
