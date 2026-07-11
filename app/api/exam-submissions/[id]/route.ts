import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { examSubmissions, questions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [submission] = await db.select().from(examSubmissions).where(eq(examSubmissions.id, id))
    if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

    if (session.user.role !== 'admin' && submission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const isAdmin = session.user.role === 'admin'

    const examQuestions = await db.select().from(questions).where(eq(questions.examId, submission.examId))

    const questionsForResponse = examQuestions.map((q) => {
      const base: Record<string, unknown> = { id: q.id, question: q.question, options: q.options }
      if (isAdmin) {
        base.correctIndex = q.correctIndex
      }
      base.userAnswer = submission.answers[q.id as unknown as number]
      return base
    })

    return NextResponse.json({
      ...submission,
      questions: questionsForResponse,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 })
  }
}
