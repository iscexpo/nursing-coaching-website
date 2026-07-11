import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, account } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

const ADMIN_EMAIL = 'admin@cornia.co'
const ADMIN_PHONE = '01784176442'
const ADMIN_PASSWORD = '1a2s3d4f!@#$'
const ADMIN_NAME = 'Admin'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const seedKey = process.env.ADMIN_SEED_KEY

    if (!seedKey) {
      return NextResponse.json({ error: 'ADMIN_SEED_KEY env var not configured' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${seedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingUser = await db.select().from(user).where(eq(user.email, ADMIN_EMAIL))

    if (existingUser.length > 0) {
      const u = existingUser[0]
      if (u.role !== 'admin') {
        await db.update(user).set({ role: 'admin' }).where(eq(user.id, u.id))
      }
      return NextResponse.json({ success: true, message: 'Admin user already exists, role ensured', userId: u.id })
    }

    const userId = randomUUID()
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)

    await db.insert(user).values({
      id: userId,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      emailVerified: true,
      phoneNumber: ADMIN_PHONE,
      phoneNumberVerified: true,
      role: 'admin',
    })

    await db.insert(account).values({
      id: randomUUID(),
      accountId: ADMIN_EMAIL,
      providerId: 'email',
      userId: userId,
      password: hashedPassword,
    })

    return NextResponse.json({ success: true, message: 'Admin user created', userId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to seed admin'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
