import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/permissions'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const students = await db
      .select()
      .from(user)
      .where(eq(user.role, 'student'))
      .orderBy(desc(user.createdAt))

    const exportData = students.map((s) => ({
      'নাম': s.name,
      'ইমেইল': s.email ?? '',
      'ফোন': s.phoneNumber ?? '',
      'শিক্ষার্থী ID': s.studentId ?? '',
      'ঠিকানা': s.address ?? '',
      'জেলা': s.district ?? '',
      'তৈরি': s.createdAt.toISOString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=students.xlsx',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to export students' }, { status: 500 })
  }
}
