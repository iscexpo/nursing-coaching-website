import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { modelTestApplicants, exams } from '@/lib/db/schema'
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
      'contacted',
      'registered',
      'rejected',
    ] as const
    const status = (
      statusParam &&
      allowedStatuses.includes(statusParam as (typeof allowedStatuses)[number])
        ? statusParam
        : null
    ) as (typeof allowedStatuses)[number] | null

    const where = status ? eq(modelTestApplicants.status, status) : undefined

    const data = await db
      .select({
        id: modelTestApplicants.id,
        reference: modelTestApplicants.reference,
        name: modelTestApplicants.name,
        phone: modelTestApplicants.phone,
        examId: modelTestApplicants.examId,
        examTitle: exams.title,
        preferredSubject: modelTestApplicants.preferredSubject,
        message: modelTestApplicants.message,
        status: modelTestApplicants.status,
        createdAt: modelTestApplicants.createdAt,
        updatedAt: modelTestApplicants.updatedAt,
      })
      .from(modelTestApplicants)
      .leftJoin(exams, eq(modelTestApplicants.examId, exams.id))
      .where(where)
      .orderBy(desc(modelTestApplicants.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db
      .select({ count: count() })
      .from(modelTestApplicants)
      .where(where)

    return ok({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch {
    return serverError('Failed to fetch model test applicants')
  }
}
