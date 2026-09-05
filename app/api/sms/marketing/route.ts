import { NextRequest } from 'next/server'
import {
  ok,
  badRequest,
  serverError,
  validationError,
} from '@/lib/api/response'
import { z } from 'zod/v3'
import { requireAdmin } from '@/lib/core/permissions'
import { extractPhoneNumbersFromSheet } from '@/lib/sms/sheet'
import { buildBroadcastMessage, sendSmsToRecipients } from '@/lib/sms'
import { rateLimit } from '@/lib/core/rate-limit'

const marketingSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
})

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 3,
    prefix: 'sms.marketing',
  })
  if (limiter) return limiter

  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const formData = await request.formData()
    const title = formData.get('title')?.toString() || ''
    const content = formData.get('content')?.toString() || ''
    const file = formData.get('file')

    const parsed = marketingSchema.safeParse({ title, content })
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    if (!(file instanceof File)) {
      return badRequest('CSV/Excel file is required')
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return badRequest('File size must be less than 5MB')
    }

    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/tab-separated-values',
    ]
    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(csv|xlsx|xls|tsv)$/i)
    ) {
      return badRequest('Only CSV, XLSX, XLS, and TSV files are allowed')
    }

    const recipients = await extractPhoneNumbersFromSheet(file)
    const message = buildBroadcastMessage(
      parsed.data.title,
      parsed.data.content,
    )

    if (recipients.length === 0) {
      return ok({
        sent: 0,
        recipients: [],
        message,
        provider: 'sheet-upload',
        skipped: true,
        reason: 'No valid phone numbers found in the uploaded sheet',
      })
    }

    const result = await sendSmsToRecipients(recipients, message)

    return ok({
      ...result,
      recipients,
      message,
    })
  } catch {
    return serverError('Failed to process sheet-based SMS marketing')
  }
}
