import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/permissions'
import { createInvoiceSchema, paginationSchema } from '@/lib/validations'

function generateInvoiceNumber(): string {
  const now = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `INV-${now.toString(36).toUpperCase()}${random.toString(36).toUpperCase().padStart(3, '0')}`
}

async function generateUniqueInvoiceNumber(): Promise<string> {
  for (let attempts = 0; attempts < 10; attempts++) {
    const invoiceNumber = generateInvoiceNumber()
    const [existing] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.invoiceNumber, invoiceNumber))
    if (!existing) return invoiceNumber
  }
  throw new Error('Failed to generate unique invoice number after 10 attempts')
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20 }

    const where = isAdmin(session.user.role)
      ? undefined
      : eq(invoices.userId, session.user.id)

    const data = await db
      .select()
      .from(invoices)
      .where(where)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db
      .select({ count: count() })
      .from(invoices)
      .where(where)

    return NextResponse.json({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = createInvoiceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { userId, enrollmentId, amount, dueDate, description } = parsed.data

    const invoiceNumber = await generateUniqueInvoiceNumber()

    const [invoice] = await db
      .insert(invoices)
      .values({
        id: crypto.randomUUID(),
        invoiceNumber,
        userId,
        enrollmentId,
        amount,
        dueAmount: amount,
        dueDate,
        description,
      })
      .returning()

    return NextResponse.json(invoice, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 },
    )
  }
}
