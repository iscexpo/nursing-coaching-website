import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subjects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/permissions'
import { updateSubjectSchema } from '@/lib/validations'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { id } = await params
    const body = await request.json()
    const parsed = updateSubjectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [existing] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1)
    if (!existing)
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })

    if (parsed.data.name && parsed.data.name !== existing.name) {
      const duplicate = await db
        .select()
        .from(subjects)
        .where(eq(subjects.name, parsed.data.name))
        .limit(1)
      if (duplicate.length > 0) {
        return NextResponse.json(
          { error: 'এই বিষয় ইতিমধ্যে বিদ্যমান' },
          { status: 409 },
        )
      }
    }

    const [updated] = await db
      .update(subjects)
      .set({
        ...parsed.data,
      })
      .where(eq(subjects.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { id } = await params
    const [existing] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1)
    if (!existing)
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })

    await db.delete(subjects).where(eq(subjects.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete subject' },
      { status: 500 },
    )
  }
}
