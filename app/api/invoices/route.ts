import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let data
    if (session.user.role === 'admin') {
      data = await db.select().from(invoices).orderBy(desc(invoices.createdAt))
    } else {
      data = await db.select().from(invoices).where(eq(invoices.userId, session.user.id)).orderBy(desc(invoices.createdAt))
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, enrollmentId, amount, dueDate, description } = body

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`

    const [invoice] = await db.insert(invoices).values({
      id: crypto.randomUUID(),
      invoiceNumber,
      userId,
      enrollmentId,
      amount,
      dueAmount: amount,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      description,
    }).returning()

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}