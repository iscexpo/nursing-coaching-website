import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { exams, questions } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { updateExamSchema } from '@/lib/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const [exam] = await db
      .select({
        id: exams.id,
        title: exams.title,
        subject: exams.subject,
        duration: exams.duration,
        difficulty: exams.difficulty,
        isActive: exams.isActive,
        createdAt: exams.createdAt,
        questionCount: count(questions.id),
      })
      .from(exams)
      .leftJoin(questions, eq(exams.id, questions.examId))
      .where(eq(exams.id, id))
      .groupBy(
        exams.id,
        exams.title,
        exams.subject,
        exams.duration,
        exams.difficulty,
        exams.isActive,
        exams.createdAt,
      )

    if (!exam)
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    return NextResponse.json(exam)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 })
  }
}

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
    const parsed = updateExamSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [updated] = await db
      .update(exams)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(exams.id, id))
      .returning()

    if (!updated)
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'exam',
          resourceId: id,
          action: 'update',
          details: parsed.data,
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update exam' },
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

    const [deleted] = await db.delete(exams).where(eq(exams.id, id)).returning()
    if (!deleted)
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'exam',
          resourceId: id,
          action: 'delete',
          details: {},
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete exam' },
      { status: 500 },
    )
  }
}
