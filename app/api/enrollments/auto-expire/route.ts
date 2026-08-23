import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { ok, serverError, unauthorized } from '@/lib/api/response'
import { db } from '@/lib/db'
import { enrollments, studentLifecycleEvents } from '@/lib/db/schema'
import { and, eq, lte, isNotNull } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { shouldAutoExpire } from '@/lib/core/lms-logic'

/**
 * POST /api/enrollments/auto-expire
 * Auto-expire active enrollments past their expiresAt.
 * Intended to be invoked by a cron job (e.g., Vercel Cron) daily.
 * Also triggered manually by admin for verification.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const now = new Date()

    // Find candidates where status=active and expiresAt <= now and not null
    const candidates = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.status, 'active'),
          isNotNull(enrollments.expiresAt),
          lte(enrollments.expiresAt, now),
        ),
      )

    // Double-check with pure logic (handles edge)
    const toExpire = candidates.filter((e) =>
      shouldAutoExpire(e.status, e.expiresAt, now),
    )

    if (toExpire.length === 0) {
      return ok({ processed: 0, expired: [] })
    }

    const expiredIds: string[] = []

    for (const enrollment of toExpire) {
      const result = await db.transaction(async (tx) => {
        const [updated] = await tx
          .update(enrollments)
          .set({ status: 'expired', updatedAt: now })
          .where(
            and(
              eq(enrollments.id, enrollment.id),
              eq(enrollments.status, 'active'),
            ),
          )
          .returning()
        if (!updated) return null
        await tx.insert(studentLifecycleEvents).values({
          id: randomUUID(),
          studentId: enrollment.userId,
          enrollmentId: enrollment.id,
          eventType: 'enrollment.expired',
          details: {
            previousStatus: 'active',
            autoExpired: true,
            expiresAt: enrollment.expiresAt,
          },
        })
        return updated
      })
      if (result) expiredIds.push(enrollment.id)
    }

    // Audit once for batch
    try {
      await writeAudit(
        buildAuditEntry(
          {
            resourceType: 'enrollment',
            resourceId: expiredIds.join(','),
            action: 'auto-expire',
            details: { count: expiredIds.length, ids: expiredIds },
          },
          session,
          request.headers.get('x-forwarded-for') ?? undefined,
        ),
      )
    } catch (auditError) {
      console.error('Failed to write audit log for auto-expire', auditError)
    }

    return ok({
      processed: toExpire.length,
      expired: expiredIds,
      count: expiredIds.length,
    })
  } catch {
    return serverError('Failed to auto-expire enrollments')
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
