import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { examSubmissions, questions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, isAdmin } from '@/lib/permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [submission] = await db
      .select()
      .from(examSubmissions)
      .where(eq(examSubmissions.id, id))
    if (!submission)
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 },
      )

    const admin = isAdmin(session.user.role)

    if (!admin && submission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const examQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.examId, submission.examId))

    const questionsForResponse = examQuestions.map((q) => {
      const base: Record<string, unknown> = {
        id: q.id,
        question: q.question,
        options: q.options,
      }
      if (admin) {
        base.correctIndex = q.correctIndex
      }
      base.userAnswer = submission.answers[q.id]
      return base
    })

    return NextResponse.json({
      ...submission,
      questions: questionsForResponse,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 },
    )
  }
}
