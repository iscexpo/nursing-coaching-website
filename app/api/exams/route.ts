import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { exams, questions } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { createExamSchema, paginationSchema } from '@/lib/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 }
    const subject = searchParams.get('subject')

    let query = db.select({
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
      .groupBy(exams.id, exams.title, exams.subject, exams.duration, exams.difficulty, exams.isActive, exams.createdAt)

    if (subject) {
      query = query.where(eq(exams.subject, subject)) as typeof query
    }

    const data = await query.orderBy(desc(exams.createdAt)).limit(limit).offset((page - 1) * limit)

    return NextResponse.json({ data, page, limit })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = createExamSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [exam] = await db.insert(exams).values({
      id: crypto.randomUUID(),
      ...parsed.data,
    }).returning()

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'exam',
          resourceId: exam.id,
          action: 'create',
          details: { title: exam.title, subject: exam.subject },
        },
        session,
        request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
      )
    )

    return NextResponse.json(exam, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
  }
}
