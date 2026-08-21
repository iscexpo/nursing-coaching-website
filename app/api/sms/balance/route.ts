import { NextRequest } from 'next/server'
import { ok, serverError } from '@/lib/api/response'
import { requireAdmin } from '@/lib/core/permissions'
import { checkSmsBalance } from '@/lib/sms'
import { rateLimit } from '@/lib/core/rate-limit'

export async function GET(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 20,
    prefix: 'sms.balance',
  })
  if (limiter) return limiter

  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const result = await checkSmsBalance()
    return ok(result)
  } catch {
    return serverError('Failed to fetch SMS balance')
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
