import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { admissions, courses } from '@/lib/db/schema'
import { desc, eq, count } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { paginationSchema } from '@/lib/core/validations'
import { ok, unauthorized, serverError } from '@/lib/api/response'

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

    const statusParam = searchParams.get('status')
    const allowedStatuses = [
      'pending',
      'received',
      'processing',
      'approved',
      'rejected',
    ] as const
    const status = (
      statusParam &&
      allowedStatuses.includes(statusParam as (typeof allowedStatuses)[number])
        ? statusParam
        : null
    ) as (typeof allowedStatuses)[number] | null

    const where = status ? eq(admissions.status, status) : undefined

    const data = await db
      .select({
        id: admissions.id,
        reference: admissions.reference,
        name: admissions.name,
        phone: admissions.phone,
        courseId: admissions.courseId,
        courseTitle: courses.title,
        message: admissions.message,
        ssc: admissions.ssc,
        hsc: admissions.hsc,
        honors: admissions.honors,
        status: admissions.status,
        createdAt: admissions.createdAt,
        updatedAt: admissions.updatedAt,
      })
      .from(admissions)
      .leftJoin(courses, eq(admissions.courseId, courses.id))
      .where(where)
      .orderBy(desc(admissions.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db
      .select({ count: count() })
      .from(admissions)
      .where(where)

    return ok({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch {
    return serverError('Failed to fetch admissions')
  }
}
