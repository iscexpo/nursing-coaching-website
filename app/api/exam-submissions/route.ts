import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { examSubmissions, exams, questions } from '@/lib/db/schema'
import { eq, desc, and, count } from 'drizzle-orm'
import { getSession, isAdmin } from '@/lib/permissions'
import { submitExamSchema, paginationSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 }

    const where = isAdmin(session.user.role) ? undefined : eq(examSubmissions.userId, session.user.id)

    const data = await db.select().from(examSubmissions)
      .where(where)
      .orderBy(desc(examSubmissions.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db.select({ count: count() }).from(examSubmissions).where(where)

    return NextResponse.json({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = submitExamSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { examId, answers, timeTaken } = parsed.data

    const [exam] = await db.select().from(exams).where(eq(exams.id, examId))
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    if (!exam.isActive) return NextResponse.json({ error: 'Exam is not active' }, { status: 400 })

    // Prevent multiple attempts for the same exam by the same user.
    const existing = await db.select({ id: examSubmissions.id }).from(examSubmissions)
      .where(and(eq(examSubmissions.userId, session.user.id), eq(examSubmissions.examId, examId)))
      .limit(1)
    if (existing.length > 0) {
      return NextResponse.json({ error: 'এই পরীক্ষাটি ইতিমধ্যে জমা দেওয়া হয়েছে' }, { status: 409 })
    }

    // Only fetch the fields required for scoring; never expose correct answers.
    const examQuestions = await db.select({
      id: questions.id,
      correctIndex: questions.correctIndex,
    }).from(questions).where(eq(questions.examId, examId))
    if (examQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this exam' }, { status: 400 })
    }

    let score = 0
    for (const q of examQuestions) {
      const userAnswer = answers[q.id]
      if (userAnswer !== undefined && userAnswer === q.correctIndex) {
        score++
      }
    }

    const [submission] = await db.insert(examSubmissions).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      examId,
      score,
      total: examQuestions.length,
      answers,
      timeTaken,
    }).returning()

    return NextResponse.json({
      ...submission,
      total: examQuestions.length,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 })
  }
}
