import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enrollments, courses, user } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/permissions'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const data = await db
      .select({
        id: enrollments.id,
        status: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
        totalFee: enrollments.totalFee,
        paidAmount: enrollments.paidAmount,
        dueAmount: enrollments.dueAmount,
        userName: user.name,
        userPhone: user.phoneNumber,
        courseTitle: courses.title,
      })
      .from(enrollments)
      .leftJoin(user, eq(enrollments.userId, user.id))
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .orderBy(desc(enrollments.createdAt))

    const exportData = data.map((e) => ({
      শিক্ষার্থী: e.userName ?? '',
      ফোন: e.userPhone ?? '',
      কোর্স: e.courseTitle ?? '',
      স্ট্যাটাস: e.status,
      'মোট ফি': e.totalFee,
      পরিশোধিত: e.paidAmount,
      বকেয়: e.dueAmount,
      তারিখ: e.enrolledAt.toISOString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Enrollments')
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new Response(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=enrollments.xlsx',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to export enrollments' },
      { status: 500 },
    )
  }
}
