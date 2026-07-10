import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [profile] = await db.select().from(user).where(eq(user.id, session.user.id))
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { ...safeProfile } = profile
    return NextResponse.json(safeProfile)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, email, address, dateOfBirth, guardianName, guardianPhone, institution } = body

    const [updated] = await db.update(user).set({
      name,
      email,
      address,
      dateOfBirth,
      guardianName,
      guardianPhone,
      institution,
      updatedAt: new Date(),
    }).where(eq(user.id, session.user.id)).returning()

    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}