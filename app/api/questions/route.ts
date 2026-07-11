import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { questions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'
import { createQuestionSchema, paginationSchema } from '@/lib/validations'

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
    const examId = searchParams.get('examId')

    if (!examId) {
      return NextResponse.json({ error: 'examId is required' }, { status: 400 })
    }

    const data = await db.select().from(questions)
      .where(eq(questions.examId, examId))
      .limit(limit)
      .offset((page - 1) * limit)

    return NextResponse.json({ data, page, limit })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createQuestionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [question] = await db.insert(questions).values({
      id: crypto.randomUUID(),
      ...parsed.data,
    }).returning()

    return NextResponse.json(question, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}
