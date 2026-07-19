import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import {
  defaultCmsContent,
  mergeCmsContent,
  type CmsContent,
  type CmsContentInput,
} from '@/lib/content-cms'

export type SystemSettings = {
  id: string
  siteName: string
  siteTagline: string
  smsProvider: string
  smsApiKey: string
  smsSenderId: string
  smsEmail: string
  smsPassword: string
  paymentGateway: string
  paymentGatewayApiKey: string
  paymentGatewaySecret: string
  paymentGatewayWebhookSecret: string
  cmsContent: CmsContent | null
  updatedAt: Date | null
}

type SmsExtras = { smsEmail?: string; smsPassword?: string }

function extractSmsExtras(cms: CmsContent | null | undefined): SmsExtras {
  if (!cms || typeof cms !== 'object') return {}
  const raw = (cms as Record<string, unknown>).smsExtras
  if (raw && typeof raw === 'object') return raw as SmsExtras
  return {}
}

function createDefaultSystemSettings(): SystemSettings {
  return {
    id: 'primary',
    siteName: 'ISC Expo - Icon Skill & Career Expo',
    siteTagline: 'সাফল্যের জন্য প্রস্তুতি',
    smsProvider: 'none',
    smsApiKey: '',
    smsSenderId: '',
    smsEmail: '',
    smsPassword: '',
    paymentGateway: 'none',
    paymentGatewayApiKey: '',
    paymentGatewaySecret: '',
    paymentGatewayWebhookSecret: '',
    cmsContent: mergeCmsContent(),
    updatedAt: null,
  }
}

function rowToSettings(row: Record<string, unknown>): SystemSettings {
  const cms = mergeCmsContent(
    (row.cmsContent as CmsContent | null) || undefined,
  )
  const extras = extractSmsExtras(cms)
  const { smsExtras: _removed, ...cmsWithoutSmsExtras } = (cms || {}) as Record<
    string,
    unknown
  >
  return {
    id: row.id as string,
    siteName: row.siteName as string,
    siteTagline: row.siteTagline as string,
    smsProvider: row.smsProvider as string,
    smsApiKey: row.smsApiKey as string,
    smsSenderId: row.smsSenderId as string,
    smsEmail: extras.smsEmail || '',
    smsPassword: extras.smsPassword || '',
    paymentGateway: row.paymentGateway as string,
    paymentGatewayApiKey: row.paymentGatewayApiKey as string,
    paymentGatewaySecret: row.paymentGatewaySecret as string,
    paymentGatewayWebhookSecret: row.paymentGatewayWebhookSecret as string,
    cmsContent: cmsWithoutSmsExtras as unknown as CmsContent,
    updatedAt: row.updatedAt as Date | null,
  }
}

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.id, 'primary'))
    if (setting) {
      return rowToSettings(setting as unknown as Record<string, unknown>)
    }

    const [created] = await db
      .insert(settings)
      .values({
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
      })
      .returning()

    if (created) {
      return rowToSettings(created as unknown as Record<string, unknown>)
    }
  } catch (error) {
    console.warn('Unable to load system settings, using defaults:', error)
  }

  return createDefaultSystemSettings()
}

export type SystemSettingsUpdate = Partial<
  Omit<SystemSettings, 'cmsContent'>
> & {
  cmsContent?: CmsContentInput
}

export async function saveSystemSettings(input: SystemSettingsUpdate) {
  const { smsEmail, smsPassword, ...rest } = input
  const nextCmsContent = mergeCmsContent(rest.cmsContent || undefined)

  const cmsWithExtras = {
    ...nextCmsContent,
    smsExtras: { smsEmail: smsEmail || '', smsPassword: smsPassword || '' },
  }

  const [updated] = await db
    .update(settings)
    .set({
      ...rest,
      cmsContent: cmsWithExtras,
      updatedAt: new Date(),
    })
    .where(eq(settings.id, 'primary'))
    .returning()

  return rowToSettings(updated as unknown as Record<string, unknown>)
}
