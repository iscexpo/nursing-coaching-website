import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { otp, account, user } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 5,
    prefix: 'auth.reset-password-phone',
  })
  if (limiter) return limiter

  try {
    const { phoneNumber, code, newPassword } = await request.json()

    if (!phoneNumber || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Phone number, OTP code, and new password are required' },
        { status: 400 },
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      )
    }

    const validOtp = await db
      .select()
      .from(otp)
      .where(
        and(
          eq(otp.phoneNumber, phoneNumber),
          eq(otp.code, code),
          gt(otp.expiresAt, new Date()),
        ),
      )
      .limit(1)

    if (validOtp.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 },
      )
    }

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.phoneNumber, phoneNumber))
      .limit(1)

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'No account found with this phone number' },
        { status: 404 },
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await db
      .update(account)
      .set({ password: hashedPassword })
      .where(
        and(
          eq(account.userId, existingUser[0].id),
          eq(account.providerId, 'credential'),
        ),
      )

    await db.delete(otp).where(eq(otp.phoneNumber, phoneNumber))

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 },
    )
  }
}
