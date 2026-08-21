import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db } from '@/lib/db'
import { subjects } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/core/permissions'
import { createSubjectSchema } from '@/lib/core/validations'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const data = await db
      .select()
      .from(subjects)
      .orderBy(asc(subjects.sortOrder), asc(subjects.name))
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Failed to fetch subjects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = createSubjectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const existing = await db
      .select()
      .from(subjects)
      .where(eq(subjects.name, parsed.data.name))
      .limit(1)
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'এই বিষয় ইতিমধ্যে বিদ্যমান' },
        { status: 409 },
      )
    }

    const [created] = await db
      .insert(subjects)
      .values({
        id: randomUUID(),
        ...parsed.data,
      })
      .returning()

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Failed to create subject:', error)
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 },
    )
  }
}
