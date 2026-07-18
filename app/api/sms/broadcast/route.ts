import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v3'
import { requireAdmin } from '@/lib/permissions'
import { sendBroadcastSms } from '@/lib/sms'
import { rateLimit } from '@/lib/rate-limit'

const broadcastSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(5000).optional().nullable(),
  tag: z.string().max(50).optional().nullable(),
  isUrgent: z.boolean().optional().nullable(),
})

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 3,
    prefix: 'sms.broadcast',
  })
  if (limiter) return limiter

  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = broadcastSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const result = await sendBroadcastSms(parsed.data)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to send SMS broadcast' },
      { status: 500 },
    )
  }
}
