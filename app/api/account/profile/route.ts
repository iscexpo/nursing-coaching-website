import { NextRequest } from 'next/server'
import {
  unauthorized,
  notFound,
  ok,
  serverError,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/core/permissions'
import { updateProfileSchema } from '@/lib/core/validations'

function sanitizeProfile(profile: Record<string, unknown>) {
  const { emailVerified, phoneNumberVerified, createdAt, updatedAt, ...safe } =
    profile
  return safe
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const [profile] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
    if (!profile) return notFound('User not found')

    return ok(sanitizeProfile(profile as Record<string, unknown>))
  } catch {
    return serverError('Failed to fetch profile')
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const data = { ...parsed.data }

    for (const key of ['ssc', 'hsc', 'honors'] as const) {
      const val = data[key]
      if (val && typeof val === 'object') {
        ;(data as Record<string, unknown>)[key] = {
          result: val.result || '',
          institution: val.institution || '',
          year: val.year || '',
          roll: val.roll || '',
          registrationNo: val.registrationNo || '',
          board: val.board || '',
          photoUrl: val.photoUrl || '',
        }
      }
    }

    const setData: Record<string, unknown> = { ...data, updatedAt: new Date() }
    const [updated] = await db
      .update(user)
      .set(setData)
      .where(eq(user.id, session.user.id))
      .returning()

    if (!updated) return notFound('User not found')
    return ok(sanitizeProfile(updated as Record<string, unknown>))
  } catch {
    return serverError('Failed to update profile')
  }
}
