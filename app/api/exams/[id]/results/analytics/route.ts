import { NextRequest } from 'next/server'
import { notFound, ok } from '@/lib/api/response'
import { db } from '@/lib/db'
import { examSubmissions, exams, questions } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { requirePermission } from '@/lib/core/permissions'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authz = await requirePermission('exam.manage')
  if (!authz.ok) return authz.response
  const { id } = await params
  const [exam] = await db.select().from(exams).where(eq(exams.id, id))
  if (!exam) return notFound('Exam not found')
  const [questionStats] = await db
    .select({ count: sql<number>`count(*)` })
    .from(questions)
    .where(eq(questions.examId, id))
  const [metrics] = await db
    .select({
      total: sql<number>`count(*)::int`,
      avgPct: sql<number>`coalesce(avg(case when ${examSubmissions.total} > 0 then (${examSubmissions.score}::float / ${examSubmissions.total} * 100) else 0 end), 0)`,
      passCount: sql<number>`count(*) filter (where ${examSubmissions.total} > 0 and ${examSubmissions.score}::float / ${examSubmissions.total} >= 0.4)::int`,
      bucket0_39: sql<number>`count(*) filter (where (case when ${examSubmissions.total} > 0 then round(${examSubmissions.score}::float / ${examSubmissions.total} * 100) else 0 end) < 40)::int`,
      bucket40_59: sql<number>`count(*) filter (where (case when ${examSubmissions.total} > 0 then round(${examSubmissions.score}::float / ${examSubmissions.total} * 100) else 0 end) >= 40 and (case when ${examSubmissions.total} > 0 then round(${examSubmissions.score}::float / ${examSubmissions.total} * 100) else 0 end) < 60)::int`,
      bucket60_79: sql<number>`count(*) filter (where (case when ${examSubmissions.total} > 0 then round(${examSubmissions.score}::float / ${examSubmissions.total} * 100) else 0 end) >= 60 and (case when ${examSubmissions.total} > 0 then round(${examSubmissions.score}::float / ${examSubmissions.total} * 100) else 0 end) < 80)::int`,
      bucket80_100: sql<number>`count(*) filter (where (case when ${examSubmissions.total} > 0 then round(${examSubmissions.score}::float / ${examSubmissions.total} * 100) else 0 end) >= 80)::int`,
    })
    .from(examSubmissions)
    .where(eq(examSubmissions.examId, id))
  const total = Number(metrics?.total ?? 0)
  const average = Number(metrics?.avgPct ?? 0)
  const passRate = total ? (Number(metrics?.passCount ?? 0) / total) * 100 : 0
  const distribution: Record<string, number> = {}
  if (Number(metrics?.bucket0_39 ?? 0) > 0)
    distribution['0-39'] = Number(metrics.bucket0_39)
  if (Number(metrics?.bucket40_59 ?? 0) > 0)
    distribution['40-59'] = Number(metrics.bucket40_59)
  if (Number(metrics?.bucket60_79 ?? 0) > 0)
    distribution['60-79'] = Number(metrics.bucket60_79)
  if (Number(metrics?.bucket80_100 ?? 0) > 0)
    distribution['80-100'] = Number(metrics.bucket80_100)
  return ok({
    exam: { id: exam.id, title: exam.title, subject: exam.subject },
    questionCount: Number(questionStats?.count ?? 0),
    submissionCount: total,
    averagePercentage: Math.round(average * 100) / 100,
    passRate: Math.round(passRate * 100) / 100,
    distribution,
  })
}
