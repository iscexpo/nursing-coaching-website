import { NextRequest } from 'next/server'
import {
  unauthorized,
  forbidden,
  ok,
  notFound,
  serverError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { examSubmissions, questions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, isAdmin } from '@/lib/core/permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return unauthorized()

    const [submission] = await db
      .select()
      .from(examSubmissions)
      .where(eq(examSubmissions.id, id))
    if (!submission) return notFound('Submission not found')

    const admin = isAdmin(session.user.role)

    if (!admin && submission.userId !== session.user.id) {
      return forbidden()
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

    return ok({
      ...submission,
      questions: questionsForResponse,
    })
  } catch {
    return serverError('Failed to fetch submission')
  }
}
