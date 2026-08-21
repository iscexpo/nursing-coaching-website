import { NextRequest } from 'next/server'
import {unauthorized, ok, serverError} from '@/lib/api/response'
import { db } from '@/lib/db'
import { studentLifecycleEvents } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/core/permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session)
      return unauthorized()

    const events = await db
      .select({
        id: studentLifecycleEvents.id,
        studentId: studentLifecycleEvents.studentId,
        enrollmentId: studentLifecycleEvents.enrollmentId,
        eventType: studentLifecycleEvents.eventType,
        details: studentLifecycleEvents.details,
        createdAt: studentLifecycleEvents.createdAt,
      })
      .from(studentLifecycleEvents)
      .where(eq(studentLifecycleEvents.studentId, session.user.id))
      .orderBy(desc(studentLifecycleEvents.createdAt))
      .limit(20)

    return ok({ data: events })
  } catch {
    return serverError('Failed to fetch lifecycle events')
  }
}
