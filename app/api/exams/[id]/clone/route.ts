import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { exams, questions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { z } from 'zod/v3'

const cloneExamSchema = z.object({
  title: z.string().min(1).max(200).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authz = await requireAdmin()
  if (!authz.ok) return authz.response

  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const parsed = cloneExamSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [source] = await db.select().from(exams).where(eq(exams.id, id))
    if (!source) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    const sourceQuestions = await db.select().from(questions).where(eq(questions.examId, id))
    const cloned = await db.transaction(async (tx) => {
      const cloneId = randomUUID()
      const [created] = await tx
        .insert(exams)
        .values({
          ...source,
          id: cloneId,
          title: parsed.data.title ?? `${source.title} (Copy)`,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      if (sourceQuestions.length > 0) {
        await tx.insert(questions).values(
          sourceQuestions.map((question) => ({
            ...question,
            id: randomUUID(),
            examId: cloneId,
            createdAt: new Date(),
          })),
        )
      }
      return created
    })

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'exam',
          resourceId: cloned.id,
          action: 'clone',
          details: { sourceExamId: id, questionCount: sourceQuestions.length },
        },
        session,
        request.headers.get('x-forwarded-for') ?? undefined,
      ),
    )

    return NextResponse.json({ ...cloned, questionCount: sourceQuestions.length }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to clone exam' }, { status: 500 })
  }
}
