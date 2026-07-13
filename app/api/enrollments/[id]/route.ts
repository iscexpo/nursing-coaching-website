import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enrollments, courses, studentLifecycleEvents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/permissions'
import { updateEnrollmentSchema } from '@/lib/validations'
import { buildAuditEntry, writeAudit, writeLifecycleEvent } from '@/lib/audit'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id))
    if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

    if (!isAdmin(session.user.role) && enrollment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(enrollment)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch enrollment' }, { status: 500 })
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
    const parsed = updateEnrollmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [existing] = await db.select().from(enrollments).where(eq(enrollments.id, id))
    if (!existing) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

    const [updated] = await db.update(enrollments).set({
      ...parsed.data,
      updatedAt: new Date(),
    }).where(eq(enrollments.id, id)).returning()

    const eventType = parsed.data.status ? `enrollment.${parsed.data.status}` : 'enrollment.updated'
    await writeLifecycleEvent({
      studentId: existing.userId,
      enrollmentId: existing.id,
      eventType,
      details: {
        ...parsed.data,
        previousStatus: existing.status,
      },
    })

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'enrollment',
          resourceId: id,
          action: 'update',
          details: {
            ...parsed.data,
            previousStatus: existing.status,
          },
        },
        session,
        request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
      )
    )

    if (!updated) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [existing] = await db.select().from(enrollments).where(eq(enrollments.id, id))
    if (!existing) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

    await db.transaction(async (tx) => {
      await tx.delete(enrollments).where(eq(enrollments.id, id))

      const [course] = await tx.select().from(courses).where(eq(courses.id, existing.courseId))
      if (course && course.currentStudents > 0) {
        await tx.update(courses).set({
          currentStudents: course.currentStudents - 1,
          updatedAt: new Date(),
        }).where(eq(courses.id, existing.courseId))
      }

      await tx.insert(studentLifecycleEvents).values({
        id: crypto.randomUUID(),
        studentId: existing.userId,
        enrollmentId: existing.id,
        eventType: 'enrollment.deleted',
        details: { previousStatus: existing.status },
      })
    })

    await writeAudit(
      buildAuditEntry(
        {
          resourceType: 'enrollment',
          resourceId: id,
          action: 'delete',
          details: { previousStatus: existing.status },
        },
        session,
        request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
      )
    )

    await writeLifecycleEvent({
      studentId: existing.userId,
      enrollmentId: existing.id,
      eventType: 'enrollment.deleted',
      details: { previousStatus: existing.status },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete enrollment' }, { status: 500 })
  }
}
