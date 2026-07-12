import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'
import { updateStudentSchema } from '@/lib/validations'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [found] = await db.select().from(user).where(eq(user.id, id))
    if (!found) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    return NextResponse.json(found)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateStudentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [existing] = await db.select().from(user).where(eq(user.id, id))
    if (!existing) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    const [updated] = await db.update(user).set({
      ...parsed.data,
      updatedAt: new Date(),
    }).where(eq(user.id, id)).returning()

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update student'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (id === session.user.id) {
      return NextResponse.json({ error: 'নিজের অ্যাকাউন্ট মুছে ফেলা যাবে না' }, { status: 400 })
    }

    const [existing] = await db.select().from(user).where(eq(user.id, id))
    if (!existing) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    await db.delete(user).where(eq(user.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete student'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
