import { NextRequest } from 'next/server'
import {unauthorized, forbidden, ok, notFound, serverError, validationError} from '@/lib/api/response'
import { db } from '@/lib/db'
import { admitCards } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession, requireAdmin, isAdmin } from '@/lib/core/permissions'
import { updateAdmitCardSchema } from '@/lib/core/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session)
      return unauthorized()

    const [card] = await db
      .select()
      .from(admitCards)
      .where(eq(admitCards.id, id))
    if (!card)
      return notFound('Admit card not found')

    if (!isAdmin(session.user.role) && card.userId !== session.user.id) {
      return forbidden()
    }

    return ok(card)
  } catch {
    return serverError('Failed to fetch admit card')
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
    const parsed = updateAdmitCardSchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const [updated] = await db
      .update(admitCards)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(admitCards.id, id))
      .returning()

    if (!updated)
      return notFound('Admit card not found')
    return ok(updated)
  } catch {
    return serverError('Failed to update admit card')
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
      .delete(admitCards)
      .where(eq(admitCards.id, id))
      .returning()
    if (!deleted)
      return notFound('Admit card not found')

    return ok({ success: true })
  } catch {
    return serverError('Failed to delete admit card')
  }
}
