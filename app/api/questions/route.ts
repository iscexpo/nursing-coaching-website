import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { questions } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/core/permissions'
import { createQuestionSchema, paginationSchema } from '@/lib/core/validations'
import { ok, unauthorized, badRequest, serverError, validationError } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20 }
    const examId = searchParams.get('examId')

    if (!examId) {
      return badRequest('examId is required')
    }

    const admin = isAdmin(session.user.role)

    const data = await db
      .select()
      .from(questions)
      .where(eq(questions.examId, examId))
      .limit(limit)
      .offset((page - 1) * limit)

    const sanitized = data.map((q) => {
      if (!admin) {
        const { correctIndex, ...rest } = q
        return rest
      }
      return q
    })

    const [totalRow] = await db
      .select({ count: count() })
      .from(questions)
      .where(eq(questions.examId, examId))

    return ok({ data: sanitized, page, limit, total: totalRow?.count ?? 0 })
  } catch (error) {
    console.error("Error:", error)
    return serverError('Failed to fetch questions')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = createQuestionSchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const [question] = await db
      .insert(questions)
      .values({
        id: randomUUID(),
        ...parsed.data,
      })
      .returning()

    return ok(question, 201)
  } catch (error) {
    console.error("Error:", error)
    return serverError('Failed to create question')
  }
}
