const GP_SMS_API_BASE =
  process.env.GP_SMS_API_BASE_URL || 'https://api.gp-sms.com.bd/bulk-sms/api'

export type GpSmsConfig = {
  apiKey: string
  senderId: string
}

export type GpSmsRecipient = {
  phone: string
}

export type GpSmsSingleResult = {
  phone: string
  success: boolean
  messageId?: string
  error?: string
}

export type GpSmsBulkResult = {
  totalSent: number
  totalFailed: number
  results: GpSmsSingleResult[]
}

export type GpSmsSendOptions = {
  config: GpSmsConfig
  phoneNumbers: string[]
  message: string
}

function toE164Bd(phone: string): string {
  const trimmed = phone.trim()
  if (trimmed.startsWith('+880')) return trimmed
  if (trimmed.startsWith('880')) return `+${trimmed}`
  if (trimmed.startsWith('0')) return `+880${trimmed.slice(1)}`
  return trimmed
}

function normalizeForGp(phone: string): string {
  const e164 = toE164Bd(phone)
  if (e164.startsWith('+880')) return e164.slice(4)
  return e164
}

async function sendSingleSms(
  config: GpSmsConfig,
  phone: string,
  message: string,
): Promise<GpSmsSingleResult> {
  const normalizedPhone = normalizeForGp(phone)

  const payload = {
    type: 'text',
    phone: normalizedPhone,
    message,
    mask: config.senderId,
  }

  const url = `${GP_SMS_API_BASE}/sms/send`
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    })

    const body = await response.text()

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const parsed = JSON.parse(body)
        errorMessage =
          parsed.message || parsed.error || parsed.msg || errorMessage
      } catch {
        errorMessage = body || errorMessage
      }
      return { phone, success: false, error: errorMessage }
    }

    try {
      const parsed = JSON.parse(body)
      const success =
        parsed.status === 'success' ||
        parsed.code === 200 ||
        parsed.success === true
      return {
        phone,
        success,
        messageId: parsed.message_id || parsed.messageId || parsed.id,
        error: success
          ? undefined
          : parsed.message || parsed.error || 'Send failed',
      }
    } catch {
      return { phone, success: true, messageId: body }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { phone, success: false, error: msg }
  }
}

export async function sendBulkSms(
  options: GpSmsSendOptions,
): Promise<GpSmsBulkResult> {
  const { config, phoneNumbers, message } = options
  const results: GpSmsSingleResult[] = []

  for (let i = 0; i < phoneNumbers.length; i++) {
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
    const result = await sendSingleSms(config, phoneNumbers[i], message)
    results.push(result)
  }

  const totalSent = results.filter((r) => r.success).length
  const totalFailed = results.filter((r) => !r.success).length

  return { totalSent, totalFailed, results }
}

export async function checkBalance(
  config: GpSmsConfig,
): Promise<{ balance: number | null; error?: string }> {
  const url = `${GP_SMS_API_BASE}/sms/balance`
  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      return { balance: null, error: `HTTP ${response.status}` }
    }

    const body = await response.json()
    return {
      balance:
        typeof body.balance === 'number'
          ? body.balance
          : typeof body.credits === 'number'
            ? body.credits
            : null,
      error: body.error || body.message,
    }
  } catch (error) {
    return {
      balance: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
