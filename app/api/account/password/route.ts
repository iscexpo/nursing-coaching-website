import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/permissions'
import { auth } from '@/lib/auth'
import { z } from 'zod/v3'
import { rateLimit } from '@/lib/rate-limit'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(128),
})

export async function PUT(request: NextRequest) {
  const limiter = await rateLimit(request, { windowMs: 60_000, max: 5, prefix: 'password.change' })
  if (limiter) return limiter

  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { currentPassword, newPassword } = parsed.data

    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      },
      headers: await import('next/headers').then((m) => m.headers()),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update password'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
