import { NextRequest, NextResponse } from 'next/server'
import { badRequest, serverError } from '@/lib/api/response'
import { z } from 'zod/v3'
import { requireAdmin } from '@/lib/core/permissions'
import { sendSmsToRecipients, normalizePhoneNumbers } from '@/lib/sms'
import { rateLimit } from '@/lib/core/rate-limit'

const sendSchema = z.object({
  phone: z.string().min(1).max(20),
  message: z.string().min(1).max(1600),
})

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 10,
    prefix: 'sms.send',
  })
  if (limiter) return limiter

  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = sendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const phones = normalizePhoneNumbers([parsed.data.phone])
    if (phones.length === 0) {
      return badRequest('অবৈধ ফোন নম্বর')
    }

    const result = await sendSmsToRecipients(phones, parsed.data.message)
    return NextResponse.json(result)
  } catch {
    return serverError('SMS পাঠানো যায়নি')
  }
}
