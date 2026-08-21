import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { notices } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import {
  createNoticeSchema,
  updateNoticeSchema,
  paginationSchema,
} from '@/lib/core/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { ok, unauthorized, serverError, validationError } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20 }

    const allNotices = await db
      .select()
      .from(notices)
      .orderBy(desc(notices.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db.select({ count: count() }).from(notices)

    return ok({ data: allNotices, page, limit, total: totalRow?.count ?? 0 })
  } catch (error) {
    console.error("Error:", error)
    return serverError('Failed to fetch notices')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = createNoticeSchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const [notice] = await db
      .insert(notices)
      .values({
        id: randomUUID(),
        ...parsed.data,
      })
      .returning()

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'notice',
          resourceId: notice.id,
          action: 'create',
          details: { title: notice.title },
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return ok(notice, 201)
  } catch (error) {
    console.error("Error:", error)
    return serverError('Failed to create notice')
  }
}
