import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auditLogs, exams, questions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { buildAuditEntry } from '@/lib/audit'
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

    const ipAddress = request.headers.get('x-forwarded-for') ?? undefined
    const txResult = await db.transaction(async (tx) => {
      const [source] = await tx.select().from(exams).where(eq(exams.id, id))
      if (!source) return null

      const sourceQuestions = await tx.select().from(questions).where(eq(questions.examId, id))

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

      const auditEntry = buildAuditEntry(
        {
          resourceType: 'exam',
          resourceId: cloneId,
          action: 'clone',
          details: { sourceExamId: id, questionCount: sourceQuestions.length },
        },
        session,
        ipAddress,
      )
      await tx.insert(auditLogs).values({
        id: randomUUID(),
        actorId: auditEntry.actorId ?? null,
        actorEmail: auditEntry.actorEmail ?? null,
        actorRole: auditEntry.actorRole ?? null,
        resourceType: auditEntry.resourceType,
        resourceId: auditEntry.resourceId ?? null,
        action: auditEntry.action,
        details: auditEntry.details ?? {},
        ipAddress: auditEntry.ipAddress ?? null,
      })

      return { cloned: created, questionCount: sourceQuestions.length }
    })

    if (!txResult) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    return NextResponse.json({ ...txResult.cloned, questionCount: txResult.questionCount }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to clone exam' }, { status: 500 })
  }
}
