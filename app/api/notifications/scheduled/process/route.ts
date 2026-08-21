import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { unauthorized, ok, serverError } from '@/lib/api/response'
import { db } from '@/lib/db'
import {
  user,
  enrollments,
  notifications,
  scheduledNotifications,
  notificationTemplates,
} from '@/lib/db/schema'
import { eq, and, lte, inArray } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { sendSmsToRecipients } from '@/lib/sms'

/**
 * POST /api/notifications/scheduled/process
 * Deliver due scheduled notifications. Intended to be invoked by a cron job.
 * Creates in-app notifications for the target audience; sends SMS when the
 * linked template's channel is 'sms'.
 */
export async function POST() {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const now = new Date()

    const due = await db
      .select()
      .from(scheduledNotifications)
      .where(
        and(
          eq(scheduledNotifications.status, 'pending'),
          lte(scheduledNotifications.scheduledAt, now),
        ),
      )

    const results: { id: string; delivered: number; sms: boolean }[] = []

    for (const scheduled of due) {
      const [template] = scheduled.templateId
        ? await db
            .select()
            .from(notificationTemplates)
            .where(eq(notificationTemplates.id, scheduled.templateId))
        : []

      let userIds: string[] = []
      if (scheduled.targetCourseId) {
        const rows = await db
          .select({ userId: enrollments.userId })
          .from(enrollments)
          .where(eq(enrollments.courseId, scheduled.targetCourseId))
        userIds = rows
          .map((r) => r.userId)
          .filter((id): id is string => Boolean(id))
      } else if (scheduled.targetRole) {
        const rows = await db
          .select({ id: user.id })
          .from(user)
          .where(
            eq(
              user.role,
              scheduled.targetRole as
                'super-admin' | 'admin' | 'teacher' | 'student',
            ),
          )
        userIds = rows.map((r) => r.id)
      } else {
        const rows = await db.select({ id: user.id }).from(user)
        userIds = rows.map((r) => r.id)
      }

      let delivered = 0
      if (userIds.length > 0) {
        const values = userIds.map((userId) => ({
          id: randomUUID(),
          userId,
          title: scheduled.title,
          message: scheduled.message,
          type: scheduled.type,
        }))
        const inserted = await db
          .insert(notifications)
          .values(values)
          .returning()
        delivered = inserted.length
      }

      let sms = false
      if (template?.channel === 'sms') {
        try {
          const recipients = await db
            .select({ id: user.id, phoneNumber: user.phoneNumber })
            .from(user)
            .where(inArray(user.id, userIds))
          const phones = recipients
            .map((r) => r.phoneNumber)
            .filter((p): p is string => Boolean(p))
          if (phones.length > 0) {
            await sendSmsToRecipients(phones, template.body)
            sms = true
          }
        } catch {
          // SMS is best-effort — the in-app notification was already delivered
        }
      }

      await db
        .update(scheduledNotifications)
        .set({ status: 'sent', sentAt: new Date(), updatedAt: new Date() })
        .where(eq(scheduledNotifications.id, scheduled.id))

      results.push({ id: scheduled.id, delivered, sms })
    }

    return ok({ processed: results.length, results })
  } catch {
    return serverError('Failed to process scheduled notifications')
  }
}
