import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, account } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

const ADMIN_EMAIL = 'admin@cornia.co'
const ADMIN_PHONE = '+8801784176442'
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

    // Check if admin user already exists
    const existingUser = await db.select().from(user).where(eq(user.email, ADMIN_EMAIL))

    if (existingUser.length > 0) {
      const u = existingUser[0]
      if (u.role !== 'admin') {
        await db.update(user).set({ role: 'admin' }).where(eq(user.id, u.id))
      }
      // Check if account with proper password exists
      const existingAccount = await db.select().from(account).where(eq(account.userId, u.id))
      if (existingAccount.length === 0) {
        // Need to create account - use signUpEmail
        await auth.api.signUpEmail({
          body: {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
          },
        })
        // Set role to admin (signUpEmail defaults to student)
        await db.update(user).set({ role: 'admin', phoneNumber: ADMIN_PHONE, phoneNumberVerified: true }).where(eq(user.email, ADMIN_EMAIL))
      }
      return NextResponse.json({ success: true, message: 'Admin user exists, ensured properly configured', userId: u.id })
    }

    // Create new user via Better Auth (handles password hashing correctly)
    const result = await auth.api.signUpEmail({
      body: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    })

    // Set admin role and phone
    await db.update(user).set({ role: 'admin', phoneNumber: ADMIN_PHONE, phoneNumberVerified: true }).where(eq(user.email, ADMIN_EMAIL))

    return NextResponse.json({ success: true, message: 'Admin user created', userId: result.user.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to seed admin'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
