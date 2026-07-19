const SHIRAM_SMS_API_BASE =
  process.env.SHIRAM_SMS_API_BASE_URL ||
  'https://smsapi.shiramsystem.com/user_api/'

export type ShiramSmsConfig = {
  email: string
  password: string
  senderId: string
}

export type ShiramSmsSingleResult = {
  phone: string
  success: boolean
  messageId?: string
  error?: string
}

export type ShiramSmsBulkResult = {
  totalSent: number
  totalFailed: number
  results: ShiramSmsSingleResult[]
}

export type ShiramSmsSendOptions = {
  config: ShiramSmsConfig
  phoneNumbers: string[]
  message: string
}

function toShiramPhone(phone: string): string {
  const trimmed = phone.trim()
  if (/^8801\d{9}$/.test(trimmed)) return trimmed
  if (/^01[3-9]\d{8}$/.test(trimmed)) return `88${trimmed}`
  if (/^\+880\d{10}$/.test(trimmed)) return trimmed.slice(1)
  if (/^880\d{10}$/.test(trimmed)) return trimmed
  return trimmed
}

async function postForm(data: Record<string, string>): Promise<unknown> {
  const body = new URLSearchParams(data)
  const response = await fetch(SHIRAM_SMS_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}

async function sendSingleSms(
  config: ShiramSmsConfig,
  phone: string,
  message: string,
): Promise<ShiramSmsSingleResult> {
  const mobile = toShiramPhone(phone)

  try {
    const data = await postForm({
      email: config.email,
      password: config.password,
      method: 'send_sms',
      mask: config.senderId,
      'mobile[]': mobile,
      message,
    })

    const parsed = data as Record<string, unknown>
    const success = parsed.status === true || parsed.error_code === 0
    const ids = parsed.ids as Record<string, string> | undefined
    const messageId = ids ? Object.values(ids)[0] : undefined

    return {
      phone,
      success,
      messageId,
      error: success
        ? undefined
        : String(parsed.message || 'Send failed') +
          ` (code: ${parsed.error_code})`,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { phone, success: false, error: msg }
  }
}

export async function sendBulkSms(
  options: ShiramSmsSendOptions,
): Promise<ShiramSmsBulkResult> {
  const { config, phoneNumbers, message } = options
  const results: ShiramSmsSingleResult[] = []
  const BATCH_SIZE = 100

  for (let i = 0; i < phoneNumbers.length; i += BATCH_SIZE) {
    const batch = phoneNumbers.slice(i, i + BATCH_SIZE)

    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    if (batch.length === 1) {
      const result = await sendSingleSms(config, batch[0], message)
      results.push(result)
      continue
    }

    const mobiles = batch.map(toShiramPhone)

    try {
      const multiData = mobiles.map((mobile) => ({ mobile, sms: message }))
      const data = await postForm({
        email: config.email,
        password: config.password,
        method: 'send_multi_sms',
        mask: config.senderId,
        data: JSON.stringify(multiData),
      })

      const parsed = data as Record<string, unknown>
      const success = parsed.status === true || parsed.error_code === 0
      const ids = parsed.ids as Record<string, string> | undefined

      if (success) {
        for (const phone of batch) {
          const normalized = toShiramPhone(phone)
          results.push({
            phone,
            success: true,
            messageId: ids?.[normalized],
          })
        }
      } else {
        const errorMsg =
          String(parsed.message || 'Batch send failed') +
          ` (code: ${parsed.error_code})`
        for (const phone of batch) {
          results.push({ phone, success: false, error: errorMsg })
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      for (const phone of batch) {
        results.push({ phone, success: false, error: msg })
      }
    }
  }

  const totalSent = results.filter((r) => r.success).length
  const totalFailed = results.filter((r) => !r.success).length

  return { totalSent, totalFailed, results }
}

export async function checkBalance(
  config: ShiramSmsConfig,
): Promise<{ balance: number | null; error?: string }> {
  try {
    const data = await postForm({
      email: config.email,
      password: config.password,
      method: 'get_balance',
    })

    const parsed = data as Record<string, unknown>
    if (parsed.status === true || parsed.error_code === 0) {
      return {
        balance: typeof parsed.balance === 'number' ? parsed.balance : null,
      }
    }

    return {
      balance: null,
      error: String(parsed.message || 'Balance check failed'),
    }
  } catch (error) {
    return {
      balance: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
