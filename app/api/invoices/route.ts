import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'
import { createInvoiceSchema, paginationSchema } from '@/lib/validations'

function generateInvoiceNumber(): string {
  const now = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `INV-${now.toString(36).toUpperCase()}${random.toString(36).toUpperCase().padStart(3, '0')}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 }

    let data
    if (session.user.role === 'admin') {
      data = await db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(limit).offset((page - 1) * limit)
    } else {
      data = await db.select().from(invoices).where(eq(invoices.userId, session.user.id)).orderBy(desc(invoices.createdAt)).limit(limit).offset((page - 1) * limit)
    }

    return NextResponse.json({ data, page, limit })
  } catch {
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
    const parsed = createInvoiceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { userId, enrollmentId, amount, dueDate, description } = parsed.data

    let invoiceNumber: string
    let attempts = 0
    do {
      invoiceNumber = generateInvoiceNumber()
      attempts++
      if (attempts > 10) {
        return NextResponse.json({ error: 'Failed to generate unique invoice number' }, { status: 500 })
      }
    } while (true)

    const [invoice] = await db.insert(invoices).values({
      id: crypto.randomUUID(),
      invoiceNumber,
      userId,
      enrollmentId,
      amount,
      dueAmount: amount,
      dueDate,
      description,
    }).returning()

    return NextResponse.json(invoice, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
