import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { session } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

/**
 * POST /api/admin/logout-all
 * Force logout: delete all sessions for a specific user or all users.
 * Body: { userId?: string } — if omitted, logs out ALL users (super-admin only).
 */
export async function POST(request: NextRequest) {
  try {
    const session_ = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session_)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const { userId } = body as { userId?: string }

    // If targeting a specific user, non-super-admins can only target themselves
    if (userId && session_.user.role !== 'super-admin') {
      if (userId !== session_.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // If no userId and not super-admin, reject
    if (!userId && session_.user.role !== 'super-admin') {
      return NextResponse.json(
        { error: 'Only super-admins can logout all users' },
        { status: 403 },
      )
    }

    let deletedCount: number

    if (userId) {
      const deleted = await db
        .delete(session)
        .where(eq(session.userId, userId))
        .returning()
      deletedCount = deleted.length
    } else {
      const deleted = await db.delete(session).returning()
      deletedCount = deleted.length
    }

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'session',
          action: 'session.logout_all',
          details: {
            targetUserId: userId || 'ALL',
            deletedCount,
          },
        },
        session_,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return NextResponse.json({
      success: true,
      deletedCount,
      message: userId
        ? `${deletedCount}টি সেশন মুছে ফেলা হয়েছে`
        : `${deletedCount}টি সকল সেশন মুছে ফেলা হয়েছে`,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to force logout' },
      { status: 500 },
    )
  }
}
