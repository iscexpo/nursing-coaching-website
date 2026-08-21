import { NextRequest } from 'next/server'
import { ok, conflict, serverError, validationError } from '@/lib/api/response'
import { randomUUID } from 'node:crypto'
import { db } from '@/lib/db'
import { subjects } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/core/permissions'
import { createSubjectSchema } from '@/lib/core/validations'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const data = await db
      .select()
      .from(subjects)
      .orderBy(asc(subjects.sortOrder), asc(subjects.name))
    return ok({ data })
  } catch (error) {
    console.error('Failed to fetch subjects:', error)
    return serverError('Failed to fetch subjects')
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = createSubjectSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const existing = await db
      .select()
      .from(subjects)
      .where(eq(subjects.name, parsed.data.name))
      .limit(1)
    if (existing.length > 0) {
      return conflict('এই বিষয় ইতিমধ্যে বিদ্যমান')
    }

    const [created] = await db
      .insert(subjects)
      .values({
        id: randomUUID(),
        ...parsed.data,
      })
      .returning()

    return ok(created, 201)
  } catch (error) {
    console.error('Failed to create subject:', error)
    return serverError('Failed to create subject')
  }
}
