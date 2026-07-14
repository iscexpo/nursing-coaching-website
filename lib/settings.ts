import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { defaultCmsContent, mergeCmsContent, type CmsContent, type CmsContentInput } from '@/lib/content-cms'

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
  cmsContent: CmsContent | null
  updatedAt: Date | null
}

function createDefaultSystemSettings(): SystemSettings {
  return {
    id: 'primary',
    siteName: 'ISC Expo - Icon Skill & Career Expo',
    siteTagline: 'সাফল্যের জন্য প্রস্তুতি',
    smsProvider: 'none',
    smsApiKey: '',
    smsSenderId: '',
    paymentGateway: 'none',
    paymentGatewayApiKey: '',
    paymentGatewaySecret: '',
    paymentGatewayWebhookSecret: '',
    cmsContent: mergeCmsContent(),
    updatedAt: null,
  }
}

export async function getSystemSettings() {
  try {
    const [setting] = await db.select().from(settings).where(eq(settings.id, 'primary'))
    if (setting) {
      return {
        ...(setting as SystemSettings),
        cmsContent: mergeCmsContent((setting as SystemSettings).cmsContent || undefined),
      } as SystemSettings
    }

    const [created] = await db.insert(settings).values({
      id: 'primary',
      siteName: 'ISC Expo - Icon Skill & Career Expo',
      siteTagline: 'সাফল্যের জন্য প্রস্তুতি',
      smsProvider: 'none',
      smsApiKey: '',
      smsSenderId: '',
      paymentGateway: 'none',
      paymentGatewayApiKey: '',
      paymentGatewaySecret: '',
      paymentGatewayWebhookSecret: '',
      cmsContent: defaultCmsContent,
    }).returning()

    if (created) {
      return {
        ...(created as SystemSettings),
        cmsContent: mergeCmsContent((created as SystemSettings).cmsContent || undefined),
      } as SystemSettings
    }
  } catch (error) {
    console.warn('Unable to load system settings, using defaults:', error)
  }

  return createDefaultSystemSettings()
}

export type SystemSettingsUpdate = Partial<Omit<SystemSettings, 'cmsContent'>> & {
  cmsContent?: CmsContentInput
}

export async function saveSystemSettings(input: SystemSettingsUpdate) {
  const nextCmsContent = mergeCmsContent(input.cmsContent || undefined)

  const [updated] = await db.update(settings).set({
    ...input,
    cmsContent: nextCmsContent,
    updatedAt: new Date(),
  }).where(eq(settings.id, 'primary')).returning()

  return {
    ...(updated as SystemSettings),
    cmsContent: mergeCmsContent((updated as SystemSettings).cmsContent || undefined),
  } as SystemSettings
}
