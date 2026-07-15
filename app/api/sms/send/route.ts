import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod/v3'
import { requireAdmin } from '@/lib/permissions'
import { sendSmsToRecipients, normalizePhoneNumbers } from '@/lib/sms'
import { rateLimit } from '@/lib/rate-limit'

const sendSchema = z.object({
  phone: z.string().min(1).max(20),
  message: z.string().min(1).max(1600),
})

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, { windowMs: 60_000, max: 10, prefix: 'sms.send' })
  if (limiter) return limiter

  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const parsed = sendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const phones = normalizePhoneNumbers([parsed.data.phone])
    if (phones.length === 0) {
      return NextResponse.json({ error: 'অবৈধ ফোন নম্বর' }, { status: 400 })
    }

    const result = await sendSmsToRecipients(phones, parsed.data.message)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'SMS পাঠানো যায়নি' }, { status: 500 })
  }
}
