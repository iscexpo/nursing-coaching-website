const SAS_SMS_API_BASE =
  process.env.SAS_SMS_API_BASE_URL || 'https://api.sasbulksms.com/api/v1'

export type SasSmsConfig = {
  apiKey: string
  senderId: string
}

export type SasSmsSingleResult = {
  phone: string
  success: boolean
  messageId?: string
  error?: string
}

export type SasSmsBulkResult = {
  totalSent: number
  totalFailed: number
  results: SasSmsSingleResult[]
}

export type SasSmsSendOptions = {
  config: SasSmsConfig
  phoneNumbers: string[]
  message: string
}

function toLocalBd(phone: string): string {
  const trimmed = phone.trim()
  if (/^01[3-9]\d{8}$/.test(trimmed)) return trimmed
  if (trimmed.startsWith('+880')) return '0' + trimmed.slice(4)
  if (trimmed.startsWith('880')) return '0' + trimmed.slice(3)
  return trimmed
}

async function sendSingleSms(
  config: SasSmsConfig,
  phone: string,
  message: string,
): Promise<SasSmsSingleResult> {
  const localPhone = toLocalBd(phone)

  const payload = {
    api_key: config.apiKey,
    sender_id: config.senderId,
    phone: localPhone,
    message,
    type: 'text',
  }

  const url = `${SAS_SMS_API_BASE}/send-sms`
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
  options: SasSmsSendOptions,
): Promise<SasSmsBulkResult> {
  const { config, phoneNumbers, message } = options
  const results: SasSmsSingleResult[] = []

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
  config: SasSmsConfig,
): Promise<{ balance: number | null; error?: string }> {
  const url = `${SAS_SMS_API_BASE}/balance`
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
