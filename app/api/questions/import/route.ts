import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { ok, notFound, validationError } from '@/lib/api/response'
import { z } from 'zod'
import { db } from '@/lib/db'
import { exams, questions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requirePermission } from '@/lib/core/permissions'

const questionSchema = z.object({ question: z.string().min(1).max(2000), options: z.array(z.string().min(1).max(500)).length(4), correctIndex: z.number().int().min(0).max(3), difficulty: z.enum(['easy', 'medium', 'hard']).optional(), points: z.number().int().min(1).max(100).optional(), explanation: z.string().max(2000).optional() })
const importSchema = z.object({ examId: z.string().min(1), questions: z.array(questionSchema).min(1).max(500) })

export async function POST(request: NextRequest) {
  const authz = await requirePermission('question.manage')
  if (!authz.ok) return authz.response
  const parsed = importSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError('Invalid import payload', parsed.error.flatten().fieldErrors)
  const [exam] = await db.select({ id: exams.id }).from(exams).where(eq(exams.id, parsed.data.examId))
  if (!exam) return notFound('Exam not found')
  const rows = parsed.data.questions.map((item) => ({ id: randomUUID(), examId: parsed.data.examId, ...item }))
  const inserted = await db.insert(questions).values(rows).returning({ id: questions.id })
  return ok({ imported: inserted.length, ids: inserted.map((item) => item.id) }, 201)
}
