import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactInquiries } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { updateContactInquirySchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [inquiry] = await db
      .select()
      .from(contactInquiries)
      .where(eq(contactInquiries.id, id))
    if (!inquiry)
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })

    return NextResponse.json(inquiry)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch inquiry' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = updateContactInquirySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const updateData: Record<string, unknown> = { ...parsed.data }
    if (parsed.data.isResolved === true) {
      updateData.resolvedAt = new Date()
      updateData.resolvedBy = session.user.id
    }

    const [updated] = await db
      .update(contactInquiries)
      .set(updateData)
      .where(eq(contactInquiries.id, id))
      .returning()
    if (!updated)
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [deleted] = await db
      .delete(contactInquiries)
      .where(eq(contactInquiries.id, id))
      .returning()
    if (!deleted)
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 },
    )
  }
}
