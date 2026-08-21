import { NextRequest } from 'next/server'
import {
  unauthorized,
  notFound,
  serverError,
  ok,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { exams, questions } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { updateExamSchema } from '@/lib/core/validations'
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

    if (!exam) return notFound('Exam not found')

    return ok(exam)
  } catch {
    return serverError('Failed to fetch exam')
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
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = updateExamSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
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

    if (!updated) return notFound('Exam not found')

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

    return ok(updated)
  } catch {
    return serverError('Failed to update exam')
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
    if (!session) return unauthorized()

    const [deleted] = await db.delete(exams).where(eq(exams.id, id)).returning()
    if (!deleted) return notFound('Exam not found')

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

    return ok({ success: true })
  } catch {
    return serverError('Failed to delete exam')
  }
}
