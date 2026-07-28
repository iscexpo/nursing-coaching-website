import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { examSubmissions, exams, questions } from '@/lib/db/schema'
import { sql, desc, and, gte, lte, count, eq, avg } from 'drizzle-orm'
import { requireAdmin } from '@/lib/permissions'
import { calculateGrade } from '@/lib/lms-logic'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('examId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate query params are required' },
        { status: 400 },
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const dateFilter = and(
      gte(examSubmissions.createdAt, start),
      lte(examSubmissions.createdAt, end),
      examId ? eq(examSubmissions.examId, examId) : undefined,
    )

    const [summaryRow] = await db
      .select({
        totalSubmissions: count(),
        avgScore: sql<number>`COALESCE(${avg(examSubmissions.score)}, 0)`,
        avgTotal: sql<number>`COALESCE(${avg(examSubmissions.total)}, 0)`,
        highestScore: sql<number>`COALESCE(MAX(${examSubmissions.score}), 0)`,
        lowestScore: sql<number>`COALESCE(MIN(${examSubmissions.score}), 0)`,
      })
      .from(examSubmissions)
      .where(dateFilter)

    const avgPercentage =
      summaryRow.avgTotal > 0
        ? Math.round((summaryRow.avgScore / summaryRow.avgTotal) * 100)
        : 0

    const [medianRow] = await db
      .select({
        medianPercentage: sql<string>`COALESCE(
          ROUND(
            (PERCENTILE_CONT(0.5) WITHIN GROUP (
              ORDER BY (${examSubmissions.score}::numeric / NULLIF(${examSubmissions.total}, 0))
            ) * 100)::numeric, 1
          ), 0
        )::float`,
      })
      .from(examSubmissions)
      .where(dateFilter)

    const byExamRows = await db
      .select({
        examId: examSubmissions.examId,
        examTitle: exams.title,
        submissions: count(),
        avgScore: sql<number>`COALESCE(${avg(examSubmissions.score)}, 0)`,
        avgTotal: sql<number>`COALESCE(${avg(examSubmissions.total)}, 0)`,
      })
      .from(examSubmissions)
      .innerJoin(exams, eq(examSubmissions.examId, exams.id))
      .where(dateFilter)
      .groupBy(examSubmissions.examId, exams.title)
      .orderBy(desc(count()))

    const byExam = byExamRows.map((row) => ({
      examId: row.examId,
      examTitle: row.examTitle,
      submissions: row.submissions,
      avgScore: row.avgScore,
      avgPercentage:
        row.avgTotal > 0 ? Math.round((row.avgScore / row.avgTotal) * 100) : 0,
    }))

    const ranges = [
      { min: 0, max: 20, label: '0-20' },
      { min: 20, max: 40, label: '20-40' },
      { min: 40, max: 60, label: '40-60' },
      { min: 60, max: 80, label: '60-80' },
      { min: 80, max: 100, label: '80-100' },
    ]

    const allSubmissions = await db
      .select({
        score: examSubmissions.score,
        total: examSubmissions.total,
      })
      .from(examSubmissions)
      .where(dateFilter)

    const scoreDistribution = ranges.map((range) => ({
      range: range.label,
      count: allSubmissions.filter((s) => {
        const pct = s.total > 0 ? (s.score / s.total) * 100 : 0
        return pct >= range.min && pct < range.max
      }).length,
    }))

    const gradeCounts: Record<string, number> = {}
    for (const s of allSubmissions) {
      const grade = calculateGrade(s.score, s.total)
      gradeCounts[grade.grade] = (gradeCounts[grade.grade] || 0) + 1
    }
    const gradeDistribution = Object.entries(gradeCounts)
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => a.grade.localeCompare(b.grade))

    return NextResponse.json({
      summary: {
        totalSubmissions: summaryRow.totalSubmissions,
        avgScore: summaryRow.avgScore,
        avgPercentage,
        highestScore: summaryRow.highestScore,
        lowestScore: summaryRow.lowestScore,
        medianPercentage: Number(medianRow.medianPercentage),
      },
      byExam,
      scoreDistribution,
      gradeDistribution,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate exam performance report' },
      { status: 500 },
    )
  }
}
