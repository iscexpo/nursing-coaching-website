import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { studentLifecycleEvents } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    return NextResponse.json({ data: events })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch lifecycle events' },
      { status: 500 },
    )
  }
}
