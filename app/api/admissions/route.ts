import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { admissions, courses } from '@/lib/db/schema'
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
      .where(status ? eq(admissions.status, status) : undefined)
      .orderBy(desc(admissions.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    return NextResponse.json({ data, page, limit, total: data.length })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch admissions' },
      { status: 500 },
    )
  }
}
