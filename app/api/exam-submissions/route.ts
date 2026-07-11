import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { examSubmissions, exams, questions } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'
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

    const data = await db.select().from(examSubmissions)
      .where(eq(examSubmissions.userId, session.user.id))
      .orderBy(desc(examSubmissions.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    return NextResponse.json({ data, page, limit })
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

    const examQuestions = await db.select().from(questions).where(eq(questions.examId, examId))
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
      questions: examQuestions.map((q) => ({ id: q.id, correctIndex: q.correctIndex })),
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 })
  }
}
