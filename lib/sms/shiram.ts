/**
 * Shiram System SMS API V1.70
 * Docs: docs/Shiram-SMS-API-V1.70.md
 * Endpoint: https://smsapi.shiramsystem.com/user_api/  (POST, x-www-form-urlencoded, JSON response)
 *
 * Methods: get_balance, send_sms, send_multi_sms, report, account_recharge
 */

const SHIRAM_SMS_API_BASE =
  process.env.SHIRAM_SMS_API_BASE_URL ||
  'https://smsapi.shiramsystem.com/user_api/'

// ---------------------------------------------------------------------------
// Error codes (from docs page 2)
// ---------------------------------------------------------------------------
export const SHIRAM_ERROR_CODES: Record<number, string> = {
  0: 'Success',
  11: 'Only POST is allowed.',
  12: 'All parameter not given.',
  13: 'Invalid method parameter given.',
  14: 'Maximum number of data exceeded for one request.',
  15: 'Invalid Mask name given.',
  16: 'Invalid mobile number given. Only 13 digits starting with 88 allowed.',
  17: 'Message length exceeds the maximum allowed length.',
  21: 'No user found with that email address.',
  22: 'Invalid password given.',
  23: 'Not sufficient balance is available to send sms. Please recharge.',
  24: 'User status is not active.',
  25: 'Not sufficient balance is available to send sms. Please contact admin.',
  26: 'System error while calculating cost. Please contact admin.',
  31: 'Invalid parameter exists in the request.',
  32: 'Parameter data type did not match.',
  33: 'Invalid JSON data format in data parameter.',
  41: 'The given credential is not a parent company credential.',
  42: 'Invalid recharge amount given.',
  43: 'Minimum recharge amount is 1,000 and maximum is 20,000.',
  44: 'No account found with given recharge email address.',
  45: 'Given recharge account is not active.',
  46: 'Given recharge account is not a rechargeable company account through api.',
  47: 'Given recharge email account does not belong to a company under your company.',
  100: 'Database error. Please try later.',
  101: 'No data found for rate.',
  102: 'System error. Contact admin.',
  103: 'Data inserted but cannot provide associated ids. Please check portal for this campaign.',
  111: 'SMS must be unicode (Bangla).',
}

export const SHIRAM_MAX_MOBILES_PER_REQUEST = 100
export const SHIRAM_MAX_IDS_PER_REQUEST = 100
export const SHIRAM_MIN_RECHARGE = 1000
export const SHIRAM_MAX_RECHARGE = 20000

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ShiramSmsConfig = {
  email: string
  password: string
  senderId: string // mask name, dedicated number or 'Non-Masking'
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

export type ShiramMultiSmsEntry = {
  mobile: string // 13 digits with 88 prefix
  sms: string
}

export type ShiramMultiSmsOptions = {
  config: ShiramSmsConfig
  entries: ShiramMultiSmsEntry[] // max 100
}

export type ShiramBalanceResult = {
  balance: number | null
  error?: string
  errorCode?: number
}

export type ShiramReportDetail = {
  id: string
  mobile: string
  status: string
  time: string
}

export type ShiramReportResult = {
  success: boolean
  errorCode: number
  message: string
  totalFound: number
  details: ShiramReportDetail[]
}

export type ShiramRechargeResult = {
  success: boolean
  errorCode: number
  message: string
}

// Internal API response shapes
type ShiramBaseResponse = {
  status: boolean
  error_code: number
  message: string
}

type ShiramBalanceResponse = ShiramBaseResponse & {
  balance?: number
}

type ShiramSendResponse = ShiramBaseResponse & {
  ids?: Record<string, string>
  cost?: number
  sms_count?: number
}

type ShiramReportResponse = ShiramBaseResponse & {
  no_of_result_found?: number
  details?: ShiramReportDetail[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize any BD phone format to Shiram required format: 8801XXXXXXXXX (13 digits, starts with 88)
 * Accepts: 01XXXXXXXXX, 8801XXXXXXXXX, +8801XXXXXXXXX, +880- etc trimmed.
 */
export function toShiramPhone(phone: string): string {
  const trimmed = phone.trim().replace(/[\s-]/g, '')
  if (/^8801\d{9}$/.test(trimmed)) return trimmed
  if (/^01[3-9]\d{8}$/.test(trimmed)) return `88${trimmed}`
  if (/^\+8801\d{9}$/.test(trimmed)) return trimmed.slice(1)
  // fallback: if already 880 with 13 digits, return as is
  if (/^880\d{10}$/.test(trimmed)) return trimmed
  return trimmed
}

export function isValidShiramMobile(phone: string): boolean {
  return /^8801\d{9}$/.test(toShiramPhone(phone))
}

export function normalizeShiramMobiles(phones: string[]): string[] {
  return phones.map(toShiramPhone).filter((p) => isValidShiramMobile(p))
}

/**
 * Build x-www-form-urlencoded body correctly handling array params.
 * Shiram expects PHP-style arrays: mobile[] and ids[] with repeated keys.
 * Example: mobile[]=8801710000000&mobile[]=8801810000000
 */
function buildFormBody(
  params: Record<string, string | string[] | number | undefined>,
): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    if (Array.isArray(value)) {
      for (const v of value) {
        search.append(key, String(v))
      }
    } else {
      search.append(key, String(value))
    }
  }
  return search.toString()
}

async function postForm(
  params: Record<string, string | string[] | number | undefined>,
): Promise<unknown> {
  const body = buildFormBody(params)
  const response = await fetch(SHIRAM_SMS_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`)
  }
}

function resolveErrorMessage(
  parsed: ShiramBaseResponse,
  fallback: string,
): string {
  const codeMsg = SHIRAM_ERROR_CODES[parsed.error_code]
  const msg = String(parsed.message || fallback)
  // Prefer server message, but append code for debugging
  return codeMsg && parsed.error_code !== 0
    ? `${msg} (code: ${parsed.error_code} - ${codeMsg})`
    : parsed.error_code
      ? `${msg} (code: ${parsed.error_code})`
      : msg
}

// ---------------------------------------------------------------------------
// API: get_balance
// ---------------------------------------------------------------------------
export async function checkBalance(
  config: ShiramSmsConfig,
): Promise<ShiramBalanceResult> {
  if (!config.email || !config.password) {
    return {
      balance: null,
      error: 'Missing Shiram credentials (email/password)',
    }
  }
  try {
    const data = (await postForm({
      email: config.email,
      password: config.password,
      method: 'get_balance',
    })) as ShiramBalanceResponse

    if (data.status === true || data.error_code === 0) {
      return {
        balance: typeof data.balance === 'number' ? data.balance : null,
      }
    }

    return {
      balance: null,
      error: resolveErrorMessage(data, 'Balance check failed'),
      errorCode: data.error_code,
    }
  } catch (error) {
    return {
      balance: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ---------------------------------------------------------------------------
// API: send_sms (single message to 1..100 numbers, same text)
// ---------------------------------------------------------------------------
async function sendSingleSms(
  config: ShiramSmsConfig,
  phone: string,
  message: string,
): Promise<ShiramSmsSingleResult> {
  const mobile = toShiramPhone(phone)

  if (!isValidShiramMobile(mobile)) {
    return {
      phone,
      success: false,
      error: `Invalid mobile number: ${phone} (expected 8801XXXXXXXXX)`,
    }
  }

  try {
    const data = (await postForm({
      email: config.email,
      password: config.password,
      method: 'send_sms',
      mask: config.senderId,
      'mobile[]': [mobile],
      message,
    })) as ShiramSendResponse

    const success = data.status === true || data.error_code === 0
    const ids = data.ids as Record<string, string> | undefined
    const messageId = ids ? Object.values(ids)[0] : undefined

    return {
      phone,
      success,
      messageId,
      error: success ? undefined : resolveErrorMessage(data, 'Send failed'),
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return { phone, success: false, error: msg }
  }
}

/**
 * Send same message to multiple numbers via send_sms (up to 100 at a time).
 * Used internally when all recipients share the same text.
 */
async function sendSmsBatch(
  config: ShiramSmsConfig,
  batch: string[],
  message: string,
): Promise<ShiramSmsSingleResult[]> {
  const mobiles = batch.map(toShiramPhone)
  const invalid: ShiramSmsSingleResult[] = []
  const validPairs: { original: string; normalized: string }[] = []

  for (let i = 0; i < batch.length; i++) {
    if (!isValidShiramMobile(mobiles[i])) {
      invalid.push({
        phone: batch[i],
        success: false,
        error: `Invalid mobile number: ${batch[i]}`,
      })
    } else {
      validPairs.push({ original: batch[i], normalized: mobiles[i] })
    }
  }

  if (validPairs.length === 0) return invalid

  try {
    const data = (await postForm({
      email: config.email,
      password: config.password,
      method: 'send_sms',
      mask: config.senderId,
      'mobile[]': validPairs.map((p) => p.normalized),
      message,
    })) as ShiramSendResponse

    const success = data.status === true || data.error_code === 0
    const ids = data.ids as Record<string, string> | undefined

    if (success) {
      const results: ShiramSmsSingleResult[] = validPairs.map((p) => ({
        phone: p.original,
        success: true,
        messageId: ids?.[p.normalized],
      }))
      return [...results, ...invalid]
    }

    const errorMsg = resolveErrorMessage(data, 'Batch send failed')
    return [
      ...validPairs.map((p) => ({
        phone: p.original,
        success: false,
        error: errorMsg,
      })),
      ...invalid,
    ]
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return [
      ...validPairs.map((p) => ({
        phone: p.original,
        success: false,
        error: msg,
      })),
      ...invalid,
    ]
  }
}

// ---------------------------------------------------------------------------
// API: send_multi_sms (different message per number, up to 100)
// ---------------------------------------------------------------------------
export async function sendMultiSms(
  options: ShiramMultiSmsOptions,
): Promise<ShiramSmsBulkResult> {
  const { config, entries } = options
  const results: ShiramSmsSingleResult[] = []
  const BATCH_SIZE = SHIRAM_MAX_MOBILES_PER_REQUEST

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE)

    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    // Validate mobiles in batch
    const validEntries = batch.filter((e) => isValidShiramMobile(e.mobile))
    const invalidEntries = batch.filter((e) => !isValidShiramMobile(e.mobile))

    for (const inv of invalidEntries) {
      results.push({
        phone: inv.mobile,
        success: false,
        error: `Invalid mobile number: ${inv.mobile}`,
      })
    }

    if (validEntries.length === 0) continue

    // If all messages are identical, use send_sms for efficiency
    const allSameMessage = validEntries.every(
      (e) => e.sms === validEntries[0].sms,
    )
    if (allSameMessage) {
      const phones = validEntries.map((e) => e.mobile)
      const batchResults = await sendSmsBatch(
        config,
        phones,
        validEntries[0].sms,
      )
      results.push(...batchResults)
      continue
    }

    try {
      const multiData = validEntries.map((e) => ({
        mobile: toShiramPhone(e.mobile),
        sms: e.sms,
      }))

      const data = (await postForm({
        email: config.email,
        password: config.password,
        method: 'send_multi_sms',
        mask: config.senderId,
        data: JSON.stringify(multiData),
      })) as ShiramSendResponse

      const success = data.status === true || data.error_code === 0
      const ids = data.ids as Record<string, string> | undefined

      if (success) {
        for (const entry of validEntries) {
          const normalized = toShiramPhone(entry.mobile)
          results.push({
            phone: entry.mobile,
            success: true,
            messageId: ids?.[normalized],
          })
        }
      } else {
        const errorMsg = resolveErrorMessage(data, 'Batch send failed')
        for (const entry of validEntries) {
          results.push({ phone: entry.mobile, success: false, error: errorMsg })
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      for (const entry of validEntries) {
        results.push({ phone: entry.mobile, success: false, error: msg })
      }
    }
  }

  const totalSent = results.filter((r) => r.success).length
  const totalFailed = results.filter((r) => !r.success).length

  return { totalSent, totalFailed, results }
}

// ---------------------------------------------------------------------------
// Public: sendBulkSms (same message to many numbers)
// Uses send_sms for batches; falls back to send_multi_sms for heterogeneous handling.
// Preserves original API: { config, phoneNumbers, message }
// ---------------------------------------------------------------------------
export async function sendBulkSms(
  options: ShiramSmsSendOptions,
): Promise<ShiramSmsBulkResult> {
  const { config, phoneNumbers, message } = options

  if (phoneNumbers.length === 0) {
    return { totalSent: 0, totalFailed: 0, results: [] }
  }

  if (!config.email || !config.password) {
    return {
      totalSent: 0,
      totalFailed: phoneNumbers.length,
      results: phoneNumbers.map((phone) => ({
        phone,
        success: false,
        error: 'Missing Shiram credentials (email/password)',
      })),
    }
  }

  if (!config.senderId) {
    return {
      totalSent: 0,
      totalFailed: phoneNumbers.length,
      results: phoneNumbers.map((phone) => ({
        phone,
        success: false,
        error: 'Missing sender ID / mask (e.g. Non-Masking)',
      })),
    }
  }

  // Fast path for single recipient: use send_sms directly (avoids batch overhead)
  if (phoneNumbers.length === 1) {
    const result = await sendSingleSms(config, phoneNumbers[0], message)
    return {
      totalSent: result.success ? 1 : 0,
      totalFailed: result.success ? 0 : 1,
      results: [result],
    }
  }

  const results: ShiramSmsSingleResult[] = []
  const BATCH_SIZE = SHIRAM_MAX_MOBILES_PER_REQUEST

  for (let i = 0; i < phoneNumbers.length; i += BATCH_SIZE) {
    const batch = phoneNumbers.slice(i, i + BATCH_SIZE)

    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    // Use send_sms with multiple mobiles when message is same for all
    const batchResults = await sendSmsBatch(config, batch, message)
    results.push(...batchResults)
  }

  const totalSent = results.filter((r) => r.success).length
  const totalFailed = results.filter((r) => !r.success).length

  return { totalSent, totalFailed, results }
}

// ---------------------------------------------------------------------------
// API: report - get delivery status for sent SMS ids (max 100 per request)
// ---------------------------------------------------------------------------
export async function getSmsReport(
  config: ShiramSmsConfig,
  ids: string[],
): Promise<ShiramReportResult> {
  if (!config.email || !config.password) {
    return {
      success: false,
      errorCode: 12,
      message: 'Missing Shiram credentials (email/password)',
      totalFound: 0,
      details: [],
    }
  }

  if (ids.length === 0) {
    return {
      success: false,
      errorCode: 12,
      message: 'No ids provided',
      totalFound: 0,
      details: [],
    }
  }

  if (ids.length > SHIRAM_MAX_IDS_PER_REQUEST) {
    return {
      success: false,
      errorCode: 14,
      message: `Maximum ${SHIRAM_MAX_IDS_PER_REQUEST} ids per request`,
      totalFound: 0,
      details: [],
    }
  }

  try {
    const data = (await postForm({
      email: config.email,
      password: config.password,
      method: 'report',
      'ids[]': ids,
    })) as ShiramReportResponse

    const success = data.status === true || data.error_code === 0

    if (success) {
      return {
        success: true,
        errorCode: 0,
        message: data.message || 'Success',
        totalFound: data.no_of_result_found ?? data.details?.length ?? 0,
        details: data.details ?? [],
      }
    }

    return {
      success: false,
      errorCode: data.error_code,
      message: resolveErrorMessage(data, 'Report failed'),
      totalFound: 0,
      details: [],
    }
  } catch (error) {
    return {
      success: false,
      errorCode: 102,
      message: error instanceof Error ? error.message : 'Unknown error',
      totalFound: 0,
      details: [],
    }
  }
}

// ---------------------------------------------------------------------------
// API: account_recharge - recharge sub-account (parent credentials only)
// ---------------------------------------------------------------------------
export async function accountRecharge(
  config: ShiramSmsConfig,
  amount: number,
  rechargeEmail: string,
): Promise<ShiramRechargeResult> {
  if (!config.email || !config.password) {
    return {
      success: false,
      errorCode: 12,
      message: 'Missing Shiram credentials',
    }
  }

  if (!Number.isFinite(amount)) {
    return { success: false, errorCode: 42, message: SHIRAM_ERROR_CODES[42] }
  }

  if (amount < SHIRAM_MIN_RECHARGE || amount > SHIRAM_MAX_RECHARGE) {
    return { success: false, errorCode: 43, message: SHIRAM_ERROR_CODES[43] }
  }

  if (!rechargeEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rechargeEmail)) {
    return { success: false, errorCode: 44, message: 'Invalid recharge email' }
  }

  try {
    const data = (await postForm({
      email: config.email,
      password: config.password,
      method: 'account_recharge',
      amount: String(amount),
      recharge_email: rechargeEmail,
    })) as ShiramBaseResponse

    const success = data.status === true || data.error_code === 0

    return {
      success,
      errorCode: data.error_code,
      message: success
        ? data.message || 'Success'
        : resolveErrorMessage(data, 'Recharge failed'),
    }
  } catch (error) {
    return {
      success: false,
      errorCode: 102,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Aliases for backward compatibility
export const getBalance = checkBalance
export const getReport = getSmsReport
