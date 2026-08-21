import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import {
  unauthorized,
  ok,
  serverError,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/core/permissions'
import { createInvoiceSchema, paginationSchema } from '@/lib/core/validations'

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
    if (!session) return unauthorized()

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

    return ok({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch (error) {
    console.error('Error:', error)
    return serverError('Failed to fetch invoices')
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = createInvoiceSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const { userId, enrollmentId, amount, dueDate, description } = parsed.data

    const invoiceNumber = await generateUniqueInvoiceNumber()

    const [invoice] = await db
      .insert(invoices)
      .values({
        id: randomUUID(),
        invoiceNumber,
        userId,
        enrollmentId,
        amount,
        dueAmount: amount,
        dueDate,
        description,
      })
      .returning()

    return ok(invoice, 201)
  } catch (error) {
    console.error('Error:', error)
    return serverError('Failed to create invoice')
  }
}
