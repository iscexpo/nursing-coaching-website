import { NextRequest, NextResponse } from 'next/server'
import { getSession, requireAdmin } from '@/lib/permissions'
import { getSystemSettings, saveSystemSettings } from '@/lib/settings'
import { settingsSchema } from '@/lib/validations'
import { mergeCmsContent } from '@/lib/content-cms'

const SENSITIVE_KEYS = [
  'paymentGatewayApiKey',
  'paymentGatewaySecret',
  'paymentGatewayWebhookSecret',
  'smsApiKey',
  'smsPassword',
  'smsEmail',
]

function sanitizeSettings(settings: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(settings)) {
    if (SENSITIVE_KEYS.includes(key)) {
      safe[key] = ''
    } else {
      safe[key] = value
    }
  }
  return safe
}

export async function GET() {
  try {
    const settings = await getSystemSettings()
    const safe = sanitizeSettings(settings as unknown as Record<string, unknown>)
    return NextResponse.json({ cmsContent: safe.cmsContent })
  } catch {
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const settings = await getSystemSettings()
    return NextResponse.json(await saveSystemSettings({
      ...settings,
      cmsContent: mergeCmsContent(parsed.data.cmsContent || undefined),
    }))
  } catch {
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}
