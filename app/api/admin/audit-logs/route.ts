import { NextRequest } from 'next/server'
import { unauthorized, ok, serverError } from '@/lib/api/response'
import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'
import { desc, eq, and, count } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { paginationSchema } from '@/lib/core/validations'

/**
 * GET /api/admin/audit-logs
 * List audit logs (admin only). Filters: actorId, action, resourceType.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20 }

    const conditions = []
    const actorId = searchParams.get('actorId')
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resourceType')

    if (actorId) conditions.push(eq(auditLogs.actorId, actorId))
    if (action) conditions.push(eq(auditLogs.action, action))
    if (resourceType) conditions.push(eq(auditLogs.resourceType, resourceType))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const data = await db
      .select()
      .from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(where)

    return ok({
      data,
      page,
      limit,
      total: totalRow?.count ?? 0,
    })
  } catch {
    return serverError('Failed to fetch audit logs')
  }
}
