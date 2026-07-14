import { db } from '@/lib/db'
import { getSystemSettings } from '@/lib/settings'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendBulkSms, type GpSmsConfig } from '@/lib/gp-sms'

export type SmsBroadcastPayload = {
  title: string
  content?: string | null
  tag?: string | null
  isUrgent?: boolean | null
}

export function buildBroadcastMessage(title: string, content?: string | null, tag?: string | null, isUrgent?: boolean | null) {
  const lines = [`📢 ${title}`]
  if (tag) lines.push(`#${tag}`)
  if (isUrgent) lines.push('জরুরি')
  if (content?.trim()) lines.push(content.trim())
  return lines.join('\n')
}

export function normalizePhoneNumbers(numbers: Array<string | null | undefined>) {
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
  const students = await db.select({ phoneNumber: user.phoneNumber }).from(user).where(eq(user.role, 'student'))
  return normalizePhoneNumbers(students.map((student) => student.phoneNumber))
}

export async function sendSmsToRecipients(phoneNumbers: string[], message: string) {
  const settings = await getSystemSettings()

  if (settings.smsProvider === 'none' || !settings.smsApiKey) {
    return {
      sent: 0,
      failed: 0,
      provider: settings.smsProvider,
      skipped: true,
      reason: 'SMS provider is not configured',
    }
  }

  const gpConfig: GpSmsConfig = {
    apiKey: settings.smsApiKey,
    senderId: settings.smsSenderId,
  }

  const result = await sendBulkSms({
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
  const message = buildBroadcastMessage(payload.title, payload.content, payload.tag, payload.isUrgent)
  const recipients = await getBroadcastRecipients()

  if (settings.smsProvider === 'none' || !settings.smsApiKey) {
    return {
      sent: 0,
      recipients,
      provider: settings.smsProvider,
      message,
      skipped: true,
      reason: 'SMS provider is not configured',
    }
  }

  const gpConfig: GpSmsConfig = {
    apiKey: settings.smsApiKey,
    senderId: settings.smsSenderId,
  }

  const result = await sendBulkSms({
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
