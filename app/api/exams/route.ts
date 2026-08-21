import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { exams, questions } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { createExamSchema, paginationSchema } from '@/lib/core/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { ok, unauthorized, serverError, validationError } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20 }
    const subject = searchParams.get('subject')

    let query = db
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
      .groupBy(
        exams.id,
        exams.title,
        exams.subject,
        exams.duration,
        exams.difficulty,
        exams.isActive,
        exams.createdAt,
      )

    if (subject) {
      query = query.where(eq(exams.subject, subject)) as typeof query
    }

    const data = await query
      .orderBy(desc(exams.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const countWhere = subject ? eq(exams.subject, subject) : undefined
    const [totalRow] = await db
      .select({ count: count() })
      .from(exams)
      .where(countWhere)

    return ok({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch (error) {
    console.error("Error:", error)
    return serverError('Failed to fetch exams')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = createExamSchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const [exam] = await db
      .insert(exams)
      .values({
        id: randomUUID(),
        ...parsed.data,
      })
      .returning()

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'exam',
          resourceId: exam.id,
          action: 'create',
          details: { title: exam.title, subject: exam.subject },
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return ok(exam, 201)
  } catch (error) {
    console.error("Error:", error)
    return serverError('Failed to create exam')
  }
}
