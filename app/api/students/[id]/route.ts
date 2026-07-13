import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/permissions'
import { updateStudentSchema } from '@/lib/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Students may only view their own profile; admins may view anyone.
    if (!isAdmin(session.user.role) && session.user.id !== id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

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
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'student',
          resourceId: id,
          action: 'student.update',
          details: parsed.data,
        },
        session,
        request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
      )
    )

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
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (id === session.user.id) {
      return NextResponse.json({ error: 'নিজের অ্যাকাউন্ট মুছে ফেলা যাবে না' }, { status: 400 })
    }

    const [existing] = await db.select().from(user).where(eq(user.id, id))
    if (!existing) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    await db.delete(user).where(eq(user.id, id))

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'student',
          resourceId: id,
          action: 'student.delete',
          details: {},
        },
        session,
        request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete student'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
