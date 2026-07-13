import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payments, user } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/permissions'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const data = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        method: payments.method,
        transactionId: payments.transactionId,
        senderNumber: payments.senderNumber,
        status: payments.status,
        paidAt: payments.paidAt,
        userName: user.name,
        userPhone: user.phoneNumber,
      })
      .from(payments)
      .leftJoin(user, eq(payments.userId, user.id))
      .orderBy(desc(payments.createdAt))

    const exportData = data.map((p) => ({
      'শিক্ষার্থী': p.userName ?? '',
      'ফোন': p.userPhone ?? '',
      'পরিমাণ': p.amount,
      'পদ্ধতি': p.method,
      'ট্রানজেকশন ID': p.transactionId ?? '',
      'পাঠানো নম্বর': p.senderNumber ?? '',
      'স্ট্যাটাস': p.status,
      'তারিখ': p.paidAt.toISOString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments')
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=payments.xlsx',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to export payments' }, { status: 500 })
  }
}
