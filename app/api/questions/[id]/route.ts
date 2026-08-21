import { NextRequest } from 'next/server'
import {unauthorized, notFound, ok, serverError, validationError} from '@/lib/api/response'
import { db } from '@/lib/db'
import { questions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/core/permissions'
import { createQuestionSchema } from '@/lib/core/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session)
      return unauthorized()

    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
    if (!question)
      return notFound('Question not found')

    if (!isAdmin(session.user.role)) {
      const { correctIndex, ...rest } = question
      return ok(rest)
    }

    return ok(question)
  } catch {
    return serverError('Failed to fetch question')
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
      return unauthorized()

    const body = await request.json()
    const parsed = createQuestionSchema.partial().safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const [updated] = await db
      .update(questions)
      .set(parsed.data)
      .where(eq(questions.id, id))
      .returning()
    if (!updated)
      return notFound('Question not found')

    return ok(updated)
  } catch {
    return serverError('Failed to update question')
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
      return unauthorized()

    const [deleted] = await db
      .delete(questions)
      .where(eq(questions.id, id))
      .returning()
    if (!deleted)
      return notFound('Question not found')

    return ok({ success: true })
  } catch {
    return serverError('Failed to delete question')
  }
}
