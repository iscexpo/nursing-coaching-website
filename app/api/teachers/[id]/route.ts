import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { teachers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requirePermission } from '@/lib/permissions'
import { updateTeacherSchema } from '@/lib/validations'
import type { InferInsertModel } from 'drizzle-orm'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authz = await requirePermission('teacher.manage')
    if (!authz.ok) return authz.response

    const { id } = await params
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id))
    if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    return NextResponse.json(teacher)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch teacher' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authz = await requirePermission('teacher.manage')
    if (!authz.ok) return authz.response

    const { id } = await params
    const body = await request.json()
    const parsed = updateTeacherSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const d = parsed.data
    const set: Partial<InferInsertModel<typeof teachers>> = {}
    if (d.name !== undefined) set.name = d.name
    if (d.email !== undefined) set.email = d.email || null
    if (d.phone !== undefined) set.phone = d.phone || null
    if (d.designation !== undefined) set.designation = d.designation || null
    if (d.subject !== undefined) set.subject = d.subject || null
    if (d.bio !== undefined) set.bio = d.bio || null
    if (d.image !== undefined) set.image = d.image || null
    if (d.isActive !== undefined) set.isActive = d.isActive
    set.updatedAt = new Date()

    if (Object.keys(set).length <= 1) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const [updated] = await db
      .update(teachers)
      .set(set)
      .where(eq(teachers.id, id))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authz = await requirePermission('teacher.manage')
    if (!authz.ok) return authz.response

    const { id } = await params
    const [deleted] = await db.delete(teachers).where(eq(teachers.id, id)).returning()
    if (!deleted) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 })
  }
}
