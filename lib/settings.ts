import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type SystemSettings = {
  id: string
  siteName: string
  siteTagline: string
  smsProvider: string
  smsApiKey: string
  smsSenderId: string
  paymentGateway: string
  paymentGatewayApiKey: string
  paymentGatewaySecret: string
  paymentGatewayWebhookSecret: string
  updatedAt: Date | null
}

export async function getSystemSettings() {
  const [setting] = await db.select().from(settings).where(eq(settings.id, 'primary'))
  if (setting) {
    return setting as SystemSettings
  }

  const [created] = await db.insert(settings).values({
    id: 'primary',
    siteName: 'কর্ণিয়া নার্সিং কোচিং',
    siteTagline: 'সাফল্যের জন্য প্রস্তুতি',
    smsProvider: 'none',
    smsApiKey: '',
    smsSenderId: '',
    paymentGateway: 'none',
    paymentGatewayApiKey: '',
    paymentGatewaySecret: '',
    paymentGatewayWebhookSecret: '',
  }).returning()

  return created as SystemSettings
}

export async function saveSystemSettings(input: Partial<SystemSettings>) {
  const [updated] = await db.update(settings).set({
    ...input,
    updatedAt: new Date(),
  }).where(eq(settings.id, 'primary')).returning()

  return updated as SystemSettings
}
