import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  enrollments,
  courses,
  payments,
  attendance,
  examSubmissions,
  user,
} from '@/lib/db/schema'
import { sql, and, gte, lte, count, eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/core/permissions'
import { jsPDF } from 'jspdf'

type ReportType =
  | 'enrollment-trends'
  | 'revenue'
  | 'attendance'
  | 'course-analytics'
  | 'fee-collection'
  | 'student-performance'

const REPORT_TYPES: ReportType[] = [
  'enrollment-trends',
  'revenue',
  'attendance',
  'course-analytics',
  'fee-collection',
  'student-performance',
]

function renderTable(doc: jsPDF, headers: string[], rows: string[][]) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  const tableWidth = pageWidth - margin * 2
  const colWidth = tableWidth / headers.length
  const rowHeight = 8
  let y = 40

  doc.setFontSize(8)
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, y, tableWidth, rowHeight, 'F')
  doc.setFont('helvetica', 'bold')
  headers.forEach((h, i) => {
    doc.text(String(h), margin + i * colWidth + 1, y + 5.5)
  })
  y += rowHeight

  doc.setFont('helvetica', 'normal')
  for (const row of rows) {
    if (y > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage()
      y = 20
    }
    if (row.length === headers.length) {
      row.forEach((cell, i) => {
        doc.text(String(cell), margin + i * colWidth + 1, y + 5.5)
      })
    }
    y += rowHeight
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response

    const { type } = await params
    if (!REPORT_TYPES.includes(type as ReportType)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateConditions = []
    if (startDate) dateConditions.push(gte(enrollments.enrolledAt, new Date(startDate)))
    if (endDate) dateConditions.push(lte(enrollments.enrolledAt, new Date(endDate)))
    const dateWhere = dateConditions.length > 0 ? and(...dateConditions) : undefined

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`ISC Expo LMS - ${type} report`, 14, 18)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 25)

    let headers: string[] = []
    let rows: string[][] = []

    switch (type as ReportType) {
      case 'enrollment-trends': {
        headers = ['Month', 'Enrollments']
        const monthly = await db
          .select({
            month: sql<string>`to_char(${enrollments.enrolledAt}, 'YYYY-MM')`,
            count: count(),
          })
          .from(enrollments)
          .where(dateWhere)
          .groupBy(sql`to_char(${enrollments.enrolledAt}, 'YYYY-MM')`)
          .orderBy(sql`to_char(${enrollments.enrolledAt}, 'YYYY-MM')`)
        rows = monthly.map((m) => [m.month, String(m.count)])
        break
      }
      case 'revenue': {
        headers = ['Month', 'Verified', 'Pending', 'Total']
        const paymentConditions = []
        if (startDate) paymentConditions.push(gte(payments.paidAt, new Date(startDate)))
        if (endDate) paymentConditions.push(lte(payments.paidAt, new Date(endDate)))
        const paymentWhere =
          paymentConditions.length > 0 ? and(...paymentConditions) : undefined
        const monthly = await db
          .select({
            month: sql<string>`to_char(${payments.paidAt}, 'YYYY-MM')`,
            status: payments.status,
            amount: payments.amount,
          })
          .from(payments)
          .where(paymentWhere)
          .orderBy(sql`to_char(${payments.paidAt}, 'YYYY-MM')`)
        const agg: Record<string, { verified: number; pending: number }> = {}
        for (const p of monthly) {
          if (!agg[p.month]) agg[p.month] = { verified: 0, pending: 0 }
          if (p.status === 'verified') agg[p.month].verified += p.amount
          else if (p.status === 'pending') agg[p.month].pending += p.amount
        }
        rows = Object.entries(agg)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([m, v]) => [
            m,
            String(v.verified),
            String(v.pending),
            String(v.verified + v.pending),
          ])
        break
      }
      case 'attendance': {
        headers = ['Student', 'Present', 'Late', 'Absent', 'Total', 'Rate %']
        const records = await db
          .select({
            userId: attendance.userId,
            name: user.name,
            status: attendance.status,
          })
          .from(attendance)
          .leftJoin(user, eq(attendance.userId, user.id))
        const agg: Record<string, { name: string; p: number; l: number; a: number }> = {}
        for (const r of records) {
          if (!agg[r.userId]) agg[r.userId] = { name: r.name ?? r.userId, p: 0, l: 0, a: 0 }
          if (r.status === 'present') agg[r.userId].p++
          else if (r.status === 'late') agg[r.userId].l++
          else agg[r.userId].a++
        }
        rows = Object.values(agg).map((s) => {
          const total = s.p + s.l + s.a
          const rate = total > 0 ? Math.round(((s.p + s.l) / total) * 100) : 0
          return [s.name, String(s.p), String(s.l), String(s.a), String(total), `${rate}%`]
        })
        break
      }
      case 'course-analytics': {
        headers = ['Course', 'Enrollments', 'Active', 'Completed', 'Revenue', 'Attendance %']
        const courseRows = await db
          .select({
            id: courses.id,
            title: courses.title,
          })
          .from(courses)
        const enrollmentRows = await db
          .select({
            id: enrollments.id,
            courseId: enrollments.courseId,
            status: enrollments.status,
            userId: enrollments.userId,
          })
          .from(enrollments)
        const paymentRows = await db
          .select({
            enrollmentId: payments.enrollmentId,
            amount: payments.amount,
            status: payments.status,
          })
          .from(payments)
        const attendanceRows = await db
          .select({ userId: attendance.userId, status: attendance.status })
          .from(attendance)

        for (const c of courseRows) {
          const ce = enrollmentRows.filter((e) => e.courseId === c.id)
          const active = ce.filter((e) => e.status === 'active' || e.status === 'approved')
          const completed = ce.filter((e) => e.status === 'completed')
          const revenue = paymentRows
            .filter((p) => ce.some((e) => e.id === p.enrollmentId) && p.status === 'verified')
            .reduce((s, p) => s + p.amount, 0)
          const activeUserIds = new Set(active.map((e) => e.userId))
          const ca = attendanceRows.filter((a) => activeUserIds.has(a.userId))
          const present = ca.filter((a) => a.status === 'present' || a.status === 'late').length
          const attendanceRate = ca.length > 0 ? Math.round((present / ca.length) * 100) : 0
          rows.push([
            c.title,
            String(ce.length),
            String(active.length),
            String(completed.length),
            String(revenue),
            `${attendanceRate}%`,
          ])
        }
        break
      }
      case 'fee-collection': {
        headers = ['Student', 'Course', 'Total Fee', 'Paid', 'Due', 'Status']
        const feeRows = await db
          .select({
            enrollmentId: enrollments.id,
            userName: user.name,
            courseTitle: courses.title,
            totalFee: enrollments.totalFee,
            dueAmount: enrollments.dueAmount,
          })
          .from(enrollments)
          .leftJoin(user, eq(enrollments.userId, user.id))
          .leftJoin(courses, eq(enrollments.courseId, courses.id))
          .where(
            and(
              sql`${enrollments.status} in ('active', 'approved', 'pending')`,
              ...dateConditions,
            ),
          )
        const paymentRows = await db
          .select({
            enrollmentId: payments.enrollmentId,
            amount: payments.amount,
            status: payments.status,
          })
          .from(payments)

        for (const e of feeRows) {
          const paid = paymentRows
            .filter((p) => p.enrollmentId === e.enrollmentId && p.status === 'verified')
            .reduce((s, p) => s + p.amount, 0)
          const status = e.dueAmount <= 0 ? 'Paid' : e.dueAmount < e.totalFee ? 'Partial' : 'Unpaid'
          rows.push([
            e.userName ?? '—',
            e.courseTitle ?? '—',
            String(e.totalFee),
            String(paid),
            String(e.dueAmount),
            status,
          ])
        }
        break
      }
      case 'student-performance': {
        headers = ['Student', 'Exams', 'Avg %', 'Highest %', 'Lowest %']
        const submissions = await db
          .select({
            userId: examSubmissions.userId,
            name: user.name,
            score: examSubmissions.score,
            total: examSubmissions.total,
          })
          .from(examSubmissions)
          .leftJoin(user, eq(examSubmissions.userId, user.id))
        const agg: Record<
          string,
          { name: string; n: number; avg: number; high: number; low: number }
        > = {}
        for (const s of submissions) {
          const pct = s.total > 0 ? (s.score / s.total) * 100 : 0
          if (!agg[s.userId]) agg[s.userId] = { name: s.name ?? s.userId, n: 0, avg: 0, high: 0, low: 100 }
          const a = agg[s.userId]
          a.n++
          a.avg = (a.avg * (a.n - 1) + pct) / a.n
          a.high = Math.max(a.high, pct)
          a.low = Math.min(a.low, pct)
        }
        rows = Object.values(agg).map((a) => [
          a.name,
          String(a.n),
          `${Math.round(a.avg)}%`,
          `${Math.round(a.high)}%`,
          `${Math.round(a.low)}%`,
        ])
        break
      }
    }

    renderTable(doc, headers, rows)

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${type}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF export failed:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 },
    )
  }
}