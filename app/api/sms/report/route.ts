import { NextRequest } from 'next/server'
import { ok, serverError, validationError } from '@/lib/api/response'
import { z } from 'zod/v3'
import { requireAdmin } from '@/lib/core/permissions'
import { getSmsDeliveryReport } from '@/lib/sms'
import { rateLimit } from '@/lib/core/rate-limit'

const reportSchema = z.object({
  ids: z.array(z.string().min(1).max(50)).min(1).max(100),
})

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 20,
    prefix: 'sms.report',
  })
  if (limiter) return limiter

  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = reportSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const result = await getSmsDeliveryReport(parsed.data.ids)
    return ok(result)
  } catch {
    return serverError('Failed to fetch SMS report')
  }
}

// Allow GET with ?ids=1,2,3 for convenience
export async function GET(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 20,
    prefix: 'sms.report',
  })
  if (limiter) return limiter

  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')
    if (!idsParam) {
      return validationError('Missing ids query param')
    }
    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 100)

    const parsed = reportSchema.safeParse({ ids })
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const result = await getSmsDeliveryReport(parsed.data.ids)
    return ok(result)
  } catch {
    return serverError('Failed to fetch SMS report')
  }
}
