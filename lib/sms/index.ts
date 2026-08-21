import { db } from '@/lib/db'
import { getSystemSettings } from '@/lib/cms/settings'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendBulkSms as gpSendBulkSms, type GpSmsConfig } from '@/lib/sms/gp'
import { sendBulkSms as sasSendBulkSms, type SasSmsConfig } from '@/lib/sms/sas'
import {
  sendBulkSms as shiramSendBulkSms,
  sendMultiSms as shiramSendMultiSms,
  checkBalance as shiramCheckBalance,
  getSmsReport as shiramGetSmsReport,
  accountRecharge as shiramAccountRecharge,
  type ShiramSmsConfig,
} from '@/lib/sms/shiram'

export type SmsBroadcastPayload = {
  title: string
  content?: string | null
  tag?: string | null
  isUrgent?: boolean | null
}

export function buildBroadcastMessage(
  title: string,
  content?: string | null,
  tag?: string | null,
  isUrgent?: boolean | null,
) {
  const lines = [`📢 ${title}`]
  if (tag) lines.push(`#${tag}`)
  if (isUrgent) lines.push('জরুরি')
  if (content?.trim()) lines.push(content.trim())
  return lines.join('\n')
}

export function normalizePhoneNumbers(
  numbers: Array<string | null | undefined>,
) {
  const localNumbers = numbers.flatMap((value) => {
    if (!value) return []
    const trimmed = value.trim()
    if (!trimmed) return []
    if (/^01[3-9]\d{8}$/.test(trimmed)) return [trimmed]
    return []
  })

  const internationalNumbers = numbers.flatMap((value) => {
    if (!value) return []
    const trimmed = value.trim()
    if (!trimmed) return []
    if (/^\+880\d{10}$/.test(trimmed)) return [trimmed]
    if (/^\d{11}$/.test(trimmed)) return [trimmed]
    return []
  })

  return Array.from(new Set([...localNumbers, ...internationalNumbers]))
}

export async function getBroadcastRecipients() {
  const students = await db
    .select({ phoneNumber: user.phoneNumber })
    .from(user)
    .where(eq(user.role, 'student'))
  return normalizePhoneNumbers(students.map((student) => student.phoneNumber))
}

export async function sendSmsToRecipients(
  phoneNumbers: string[],
  message: string,
) {
  const settings = await getSystemSettings()

  const isShiram = settings.smsProvider === 'shiram'
  const isConfigured = isShiram
    ? !!settings.smsEmail && !!settings.smsPassword
    : !!settings.smsApiKey

  if (settings.smsProvider === 'none' || !isConfigured) {
    return {
      sent: 0,
      failed: 0,
      provider: settings.smsProvider,
      skipped: true,
      reason: 'SMS provider is not configured',
    }
  }

  if (settings.smsProvider === 'sasbulksms') {
    const sasConfig: SasSmsConfig = {
      apiKey: settings.smsApiKey,
      senderId: settings.smsSenderId,
    }

    const result = await sasSendBulkSms({
      config: sasConfig,
      phoneNumbers,
      message,
    })

    return {
      sent: result.totalSent,
      failed: result.totalFailed,
      provider: 'sasbulksms',
      skipped: false,
      results: result.results,
    }
  }

  if (settings.smsProvider === 'shiram') {
    const shiramConfig: ShiramSmsConfig = {
      email: settings.smsEmail,
      password: settings.smsPassword,
      senderId: settings.smsSenderId,
    }

    const result = await shiramSendBulkSms({
      config: shiramConfig,
      phoneNumbers,
      message,
    })

    return {
      sent: result.totalSent,
      failed: result.totalFailed,
      provider: 'shiram',
      skipped: false,
      results: result.results,
    }
  }

  const gpConfig: GpSmsConfig = {
    apiKey: settings.smsApiKey,
    senderId: settings.smsSenderId,
  }

  const result = await gpSendBulkSms({
    config: gpConfig,
    phoneNumbers,
    message,
  })

  return {
    sent: result.totalSent,
    failed: result.totalFailed,
    provider: 'grameenphone',
    skipped: false,
    results: result.results,
  }
}

export async function sendBroadcastSms(payload: SmsBroadcastPayload) {
  const settings = await getSystemSettings()
  const message = buildBroadcastMessage(
    payload.title,
    payload.content,
    payload.tag,
    payload.isUrgent,
  )
  const recipients = await getBroadcastRecipients()

  if (
    settings.smsProvider === 'none' ||
    (settings.smsProvider !== 'shiram' && !settings.smsApiKey) ||
    (settings.smsProvider === 'shiram' &&
      (!settings.smsEmail || !settings.smsPassword))
  ) {
    return {
      sent: 0,
      recipients,
      provider: settings.smsProvider,
      message,
      skipped: true,
      reason: 'SMS provider is not configured',
    }
  }

  if (settings.smsProvider === 'sasbulksms') {
    const sasConfig: SasSmsConfig = {
      apiKey: settings.smsApiKey,
      senderId: settings.smsSenderId,
    }

    const result = await sasSendBulkSms({
      config: sasConfig,
      phoneNumbers: recipients,
      message,
    })

    return {
      sent: result.totalSent,
      failed: result.totalFailed,
      recipients,
      provider: 'sasbulksms',
      message,
      skipped: false,
      results: result.results,
    }
  }

  if (settings.smsProvider === 'shiram') {
    const shiramConfig: ShiramSmsConfig = {
      email: settings.smsEmail,
      password: settings.smsPassword,
      senderId: settings.smsSenderId,
    }

    const result = await shiramSendBulkSms({
      config: shiramConfig,
      phoneNumbers: recipients,
      message,
    })

    return {
      sent: result.totalSent,
      failed: result.totalFailed,
      recipients,
      provider: 'shiram',
      message,
      skipped: false,
      results: result.results,
    }
  }

  const gpConfig: GpSmsConfig = {
    apiKey: settings.smsApiKey,
    senderId: settings.smsSenderId,
  }

  const result = await gpSendBulkSms({
    config: gpConfig,
    phoneNumbers: recipients,
    message,
  })

  return {
    sent: result.totalSent,
    failed: result.totalFailed,
    recipients,
    provider: 'grameenphone',
    message,
    skipped: false,
    results: result.results,
  }
}

export async function checkSmsBalance() {
  const settings = await getSystemSettings()

  // Balance is only meaningful for Shiram currently; GP/SAS have separate APIs
  if (settings.smsProvider === 'shiram') {
    if (!settings.smsEmail || !settings.smsPassword) {
      return {
        provider: 'shiram' as const,
        balance: null,
        error: 'Shiram credentials not configured',
      }
    }
    const shiramConfig: ShiramSmsConfig = {
      email: settings.smsEmail,
      password: settings.smsPassword,
      senderId: settings.smsSenderId,
    }
    const result = await shiramCheckBalance(shiramConfig)
    return { provider: 'shiram' as const, ...result }
  }

  return {
    provider: settings.smsProvider,
    balance: null,
    error: 'Balance check not supported for this provider',
  }
}

export async function getSmsDeliveryReport(ids: string[]) {
  const settings = await getSystemSettings()

  if (settings.smsProvider !== 'shiram') {
    return {
      success: false,
      errorCode: 13,
      message: 'Report is only supported for Shiram provider',
      totalFound: 0,
      details: [],
    }
  }

  if (!settings.smsEmail || !settings.smsPassword) {
    return {
      success: false,
      errorCode: 12,
      message: 'Shiram credentials not configured',
      totalFound: 0,
      details: [],
    }
  }

  const shiramConfig: ShiramSmsConfig = {
    email: settings.smsEmail,
    password: settings.smsPassword,
    senderId: settings.smsSenderId,
  }

  return shiramGetSmsReport(shiramConfig, ids)
}

export async function rechargeShiramAccount(amount: number, rechargeEmail: string) {
  const settings = await getSystemSettings()

  if (settings.smsProvider !== 'shiram') {
    return { success: false, errorCode: 13, message: 'Recharge only for Shiram' }
  }

  const shiramConfig: ShiramSmsConfig = {
    email: settings.smsEmail,
    password: settings.smsPassword,
    senderId: settings.smsSenderId,
  }

  return shiramAccountRecharge(shiramConfig, amount, rechargeEmail)
}

export async function sendMultiSmsToRecipients(
  entries: Array<{ phone: string; message: string }>,
) {
  const settings = await getSystemSettings()

  if (settings.smsProvider !== 'shiram') {
    // For non-Shiram, fall back to sending each individually via facade
    const results: Array<{ phone: string; success: boolean; error?: string }> = []
    for (const e of entries) {
      const r = await sendSmsToRecipients([e.phone], e.message)
      const detail = (r as { results?: Array<{ phone: string; success: boolean; error?: string }> })
        .results?.[0]
      results.push(
        detail ?? {
          phone: e.phone,
          success: (r.sent ?? 0) > 0,
          error: r.skipped ? (r as { reason?: string }).reason : undefined,
        },
      )
    }
    return {
      totalSent: results.filter((r) => r.success).length,
      totalFailed: results.filter((r) => !r.success).length,
      results,
      provider: settings.smsProvider,
    }
  }

  if (!settings.smsEmail || !settings.smsPassword) {
    return {
      totalSent: 0,
      totalFailed: entries.length,
      results: entries.map((e) => ({
        phone: e.phone,
        success: false,
        error: 'Shiram credentials not configured',
      })),
      provider: 'shiram' as const,
    }
  }

  const shiramConfig: ShiramSmsConfig = {
    email: settings.smsEmail,
    password: settings.smsPassword,
    senderId: settings.smsSenderId,
  }

  const shiramEntries = entries.map((e) => ({
    mobile: e.phone,
    sms: e.message,
  }))

  const result = await shiramSendMultiSms({
    config: shiramConfig,
    entries: shiramEntries,
  })

  return { ...result, provider: 'shiram' as const }
}
