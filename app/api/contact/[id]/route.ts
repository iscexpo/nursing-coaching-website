import { NextRequest } from 'next/server'
import {
  unauthorized,
  notFound,
  ok,
  serverError,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { contactInquiries } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { updateContactInquirySchema } from '@/lib/core/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const [inquiry] = await db
      .select()
      .from(contactInquiries)
      .where(eq(contactInquiries.id, id))
    if (!inquiry) return notFound('Inquiry not found')

    return ok(inquiry)
  } catch {
    return serverError('Failed to fetch inquiry')
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
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = updateContactInquirySchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
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
    if (!updated) return notFound('Inquiry not found')

    return ok(updated)
  } catch {
    return serverError('Failed to update inquiry')
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
    if (!session) return unauthorized()

    const [deleted] = await db
      .delete(contactInquiries)
      .where(eq(contactInquiries.id, id))
      .returning()
    if (!deleted) return notFound('Inquiry not found')

    return ok({ success: true })
  } catch {
    return serverError('Failed to delete inquiry')
  }
}
