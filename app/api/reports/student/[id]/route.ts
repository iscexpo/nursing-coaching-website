import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, enrollments, courses, payments, attendance, examSubmissions, exams } from '@/lib/db/schema'
import { eq, desc, and, count } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/core/permissions'
import { calculateGrade } from '@/lib/core/lms-logic'

/**
 * GET /api/reports/student/[id]
 * Student report card: enrollments + attendance + exam scores + payments.
 * Admin can view any student; students can only view their own report.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!isAdmin(session.user.role) && session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [student] = await db.select().from(user).where(eq(user.id, id))
    if (!student)
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    const studentEnrollments = await db
      .select({
        id: enrollments.id,
        status: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
        startDate: enrollments.startDate,
        endDate: enrollments.endDate,
        totalFee: enrollments.totalFee,
        paidAmount: enrollments.paidAmount,
        dueAmount: enrollments.dueAmount,
        completionPercentage: enrollments.completionPercentage,
        courseId: courses.id,
        courseTitle: courses.title,
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, id))

    const studentPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, id))
      .orderBy(desc(payments.createdAt))

    const studentAttendance = await db
      .select()
      .from(attendance)
      .where(eq(attendance.userId, id))
      .orderBy(desc(attendance.date))

    const attendanceSummary = studentAttendance.reduce(
      (acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1
        acc.total++
        return acc
      },
      { present: 0, late: 0, absent: 0, total: 0 } as Record<string, number>,
    )
    const presentCount = (attendanceSummary.present || 0) + (attendanceSummary.late || 0)
    const attendancePercentage =
      attendanceSummary.total > 0
        ? Math.round((presentCount / attendanceSummary.total) * 100)
        : 0

    const submissionRows = await db
      .select({
        id: examSubmissions.id,
        score: examSubmissions.score,
        total: examSubmissions.total,
        timeTaken: examSubmissions.timeTaken,
        createdAt: examSubmissions.createdAt,
        examTitle: exams.title,
      })
      .from(examSubmissions)
      .innerJoin(exams, eq(examSubmissions.examId, exams.id))
      .where(eq(examSubmissions.userId, id))
      .orderBy(desc(examSubmissions.createdAt))

    const examPerformance = submissionRows.map((s) => ({
      id: s.id,
      examTitle: s.examTitle,
      score: s.score,
      total: s.total,
      percentage: s.total > 0 ? Math.round((s.score / s.total) * 100) : 0,
      grade: s.total > 0 ? calculateGrade(s.score, s.total).grade : 'F',
      timeTaken: s.timeTaken,
      createdAt: s.createdAt,
    }))

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        studentId: student.studentId,
        institution: student.institution,
        image: student.image,
      },
      summary: {
        enrollmentCount: studentEnrollments.length,
        activeEnrollments: studentEnrollments.filter(
          (e) => e.status === 'active' || e.status === 'approved',
        ).length,
        totalPaid: studentPayments
          .filter((p) => p.status === 'verified')
          .reduce((sum, p) => sum + p.amount, 0),
        totalDue: studentEnrollments.reduce((sum, e) => sum + e.dueAmount, 0),
        attendancePercentage,
        examsAttempted: examPerformance.length,
        averageScore:
          examPerformance.length > 0
            ? Math.round(
                examPerformance.reduce((sum, e) => sum + e.percentage, 0) /
                  examPerformance.length,
              )
            : 0,
      },
      enrollments: studentEnrollments,
      payments: studentPayments,
      attendance: {
        records: studentAttendance,
        summary: { ...attendanceSummary, percentage: attendancePercentage },
      },
      examPerformance,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate student report' },
      { status: 500 },
    )
  }
}