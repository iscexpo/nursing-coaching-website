import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { modelTestApplicants, exams } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { paginationSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
      .where(status ? eq(modelTestApplicants.status, status) : undefined)
      .orderBy(desc(modelTestApplicants.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    return NextResponse.json({ data, page, limit, total: data.length })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch model test applicants' },
      { status: 500 },
    )
  }
}
