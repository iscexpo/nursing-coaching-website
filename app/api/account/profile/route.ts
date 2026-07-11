import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'
import { updateProfileSchema } from '@/lib/validations'

function sanitizeProfile(profile: Record<string, unknown>) {
  const { emailVerified, phoneNumberVerified, createdAt, updatedAt, ...safe } = profile
  return safe
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [profile] = await db.select().from(user).where(eq(user.id, session.user.id))
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json(sanitizeProfile(profile as Record<string, unknown>))
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const [updated] = await db.update(user).set({
      ...parsed.data,
      updatedAt: new Date(),
    }).where(eq(user.id, session.user.id)).returning()

    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(sanitizeProfile(updated as Record<string, unknown>))
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
