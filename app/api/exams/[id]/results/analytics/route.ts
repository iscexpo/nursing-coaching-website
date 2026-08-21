import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { examSubmissions, exams, questions } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { requirePermission } from '@/lib/core/permissions'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requirePermission('exam.manage')
  if (!authz.ok) return authz.response
  const { id } = await params
  const [exam] = await db.select().from(exams).where(eq(exams.id, id))
  if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  const [questionStats] = await db.select({ count: sql<number>`count(*)` }).from(questions).where(eq(questions.examId, id))
  const submissions = await db.select().from(examSubmissions).where(eq(examSubmissions.examId, id))
  const total = submissions.length
  const average = total ? submissions.reduce((sum, item) => sum + (item.total ? (item.score / item.total) * 100 : 0), 0) / total : 0
  const passRate = total ? submissions.filter((item) => item.total > 0 && item.score / item.total >= 0.4).length / total * 100 : 0
  const distribution = submissions.reduce<Record<string, number>>((result, item) => {
    const percentage = item.total ? Math.round((item.score / item.total) * 100) : 0
    const bucket = percentage < 40 ? '0-39' : percentage < 60 ? '40-59' : percentage < 80 ? '60-79' : '80-100'
    result[bucket] = (result[bucket] ?? 0) + 1
    return result
  }, {})
  return NextResponse.json({ exam: { id: exam.id, title: exam.title, subject: exam.subject }, questionCount: Number(questionStats?.count ?? 0), submissionCount: total, averagePercentage: Math.round(average * 100) / 100, passRate: Math.round(passRate * 100) / 100, distribution })
}
