import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, account } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 3,
    prefix: 'admin.seed',
  })
  if (limiter) return limiter

  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const authHeader = request.headers.get('authorization')
    const seedKey = process.env.ADMIN_SEED_KEY

    if (!seedKey) {
      return NextResponse.json(
        { error: 'ADMIN_SEED_KEY env var not configured' },
        { status: 500 },
      )
    }

    if (authHeader !== `Bearer ${seedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminPhone = process.env.ADMIN_PHONE
    const adminName = process.env.ADMIN_NAME || 'Admin'

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'ADMIN_EMAIL and ADMIN_PASSWORD env vars must be configured' },
        { status: 500 },
      )
    }

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, adminEmail))

    if (existingUser.length > 0) {
      const u = existingUser[0]
      if (u.role !== 'admin') {
        await db.update(user).set({ role: 'admin' }).where(eq(user.id, u.id))
      }
      const existingAccount = await db
        .select()
        .from(account)
        .where(eq(account.userId, u.id))
      if (existingAccount.length === 0) {
        await auth.api.signUpEmail({
          body: {
            name: adminName,
            email: adminEmail,
            password: adminPassword,
          },
        })
        await db
          .update(user)
          .set({
            role: 'admin',
            phoneNumber: adminPhone,
            phoneNumberVerified: true,
          })
          .where(eq(user.email, adminEmail))
      }
      return NextResponse.json({
        success: true,
        message: 'Admin user exists, ensured properly configured',
        userId: u.id,
      })
    }

    const result = await auth.api.signUpEmail({
      body: {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      },
    })

    await db
      .update(user)
      .set({
        role: 'admin',
        phoneNumber: adminPhone,
        phoneNumberVerified: true,
      })
      .where(eq(user.email, adminEmail))

    return NextResponse.json({
      success: true,
      message: 'Admin user created',
      userId: result.user.id,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to seed admin'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
