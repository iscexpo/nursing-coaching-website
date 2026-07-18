import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { updateAttendanceSchema } from '@/lib/validations'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = updateAttendanceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [updated] = await db
      .update(attendance)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(attendance.id, id))
      .returning()

    if (!updated)
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 },
      )
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [deleted] = await db
      .delete(attendance)
      .where(eq(attendance.id, id))
      .returning()
    if (!deleted)
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 },
      )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete attendance' },
      { status: 500 },
    )
  }
}
