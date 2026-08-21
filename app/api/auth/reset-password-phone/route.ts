import { NextRequest } from 'next/server'
import {ok, notFound, badRequest, serverError} from '@/lib/api/response'
import { db } from '@/lib/db'
import { otp, account, user } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { rateLimit } from '@/lib/core/rate-limit'

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
      return badRequest('Phone number, OTP code, and new password are required')
    }

    if (newPassword.length < 6) {
      return badRequest('Password must be at least 6 characters')
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
      return badRequest('Invalid or expired OTP code')
    }

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.phoneNumber, phoneNumber))
      .limit(1)

    if (existingUser.length === 0) {
      return notFound('No account found with this phone number')
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

    return ok({ success: true })
  } catch {
    return serverError('Failed to reset password')
  }
}
