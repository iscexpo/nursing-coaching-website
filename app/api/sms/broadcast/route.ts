import { NextRequest } from 'next/server'
import {ok, serverError, validationError} from '@/lib/api/response'
import { z } from 'zod/v3'
import { requireAdmin } from '@/lib/core/permissions'
import { sendBroadcastSms } from '@/lib/sms'
import { rateLimit } from '@/lib/core/rate-limit'

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
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const result = await sendBroadcastSms(parsed.data)
    return ok(result)
  } catch {
    return serverError('Failed to send SMS broadcast')
  }
}
