import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import {
  unauthorized,
  ok,
  serverError,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { z } from 'zod/v3'

const batchMarkSchema = z.object({
  date: z.coerce.date(),
  entries: z.array(
    z.object({
      userId: z.string().min(1),
      status: z.enum(['present', 'late', 'absent']),
      time: z.string().max(50).optional(),
    }),
  ),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = batchMarkSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const { date, entries } = parsed.data
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    let created = 0
    let updated = 0
    let skipped = 0
    const errors: Array<{ userId: string; error: string }> = []

    for (const entry of entries) {
      try {
        const existing = await db
          .select()
          .from(attendance)
          .where(
            and(
              eq(attendance.userId, entry.userId),
              gte(attendance.date, startOfDay),
              lte(attendance.date, endOfDay),
            ),
          )
          .limit(1)

        if (existing.length > 0) {
          await db
            .update(attendance)
            .set({
              status: entry.status,
              time: entry.time,
              markedBy: session.user.id,
              updatedAt: new Date(),
            })
            .where(eq(attendance.id, existing[0].id))
          updated++
        } else {
          await db.insert(attendance).values({
            id: randomUUID(),
            userId: entry.userId,
            date,
            status: entry.status,
            time: entry.time,
            markedBy: session.user.id,
          })
          created++
        }
      } catch (e) {
        errors.push({
          userId: entry.userId,
          error: e instanceof Error ? e.message : 'Unknown error',
        })
        skipped++
      }
    }

    return ok({ created, updated, skipped, errors })
  } catch {
    return serverError('Failed to batch mark attendance')
  }
}
