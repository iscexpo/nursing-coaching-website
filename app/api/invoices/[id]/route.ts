import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'
import { createInvoiceSchema } from '@/lib/validations'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id))
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    if (session.user.role !== 'admin' && invoice.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(invoice)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createInvoiceSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [updated] = await db.update(invoices).set({
      ...parsed.data,
      updatedAt: new Date(),
    }).where(eq(invoices.id, id)).returning()

    if (!updated) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [deleted] = await db.delete(invoices).where(eq(invoices.id, id)).returning()
    if (!deleted) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
