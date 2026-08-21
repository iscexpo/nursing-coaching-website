import { NextRequest, NextResponse } from 'next/server'
import { unauthorized, forbidden, notFound } from '@/lib/api/response'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/core/permissions'
import { createInvoiceSchema } from '@/lib/core/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session)
      return unauthorized()

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
    if (!invoice)
      return notFound('Invoice not found')

    if (!isAdmin(session.user.role) && invoice.userId !== session.user.id) {
      return forbidden()
    }

    return NextResponse.json(invoice)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return unauthorized()

    const body = await request.json()
    const parsed = createInvoiceSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const [updated] = await db
      .update(invoices)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning()

    if (!updated)
      return notFound('Invoice not found')
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return unauthorized()

    const [deleted] = await db
      .delete(invoices)
      .where(eq(invoices.id, id))
      .returning()
    if (!deleted)
      return notFound('Invoice not found')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 },
    )
  }
}
