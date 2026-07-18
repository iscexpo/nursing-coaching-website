import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { questions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/permissions'
import { createQuestionSchema, paginationSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
      return NextResponse.json({ error: 'examId is required' }, { status: 400 })
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

    return NextResponse.json({ data: sanitized, page, limit })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = createQuestionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [question] = await db
      .insert(questions)
      .values({
        id: crypto.randomUUID(),
        ...parsed.data,
      })
      .returning()

    return NextResponse.json(question, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 },
    )
  }
}
