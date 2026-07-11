import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { questions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'
import { createQuestionSchema } from '@/lib/validations'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [question] = await db.select().from(questions).where(eq(questions.id, id))
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

    if (session.user.role !== 'admin') {
      const { correctIndex, ...rest } = question
      return NextResponse.json(rest)
    }

    return NextResponse.json(question)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createQuestionSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [updated] = await db.update(questions).set(parsed.data).where(eq(questions.id, id)).returning()
    if (!updated) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [deleted] = await db.delete(questions).where(eq(questions.id, id)).returning()
    if (!deleted) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
