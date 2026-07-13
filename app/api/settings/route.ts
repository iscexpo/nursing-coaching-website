import { NextRequest, NextResponse } from 'next/server'
import { getSession, requireAdmin, requireSuperAdmin, isSuperAdmin } from '@/lib/permissions'
import { getSystemSettings, saveSystemSettings } from '@/lib/settings'
import { settingsSchema } from '@/lib/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { rateLimit } from '@/lib/rate-limit'

const MASK = '********'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const settings = await getSystemSettings()

    // Only super-admins can view raw secrets; mask them for regular admins.
    if (isSuperAdmin(auth.session.user.role)) {
      return NextResponse.json(settings)
    }

    return NextResponse.json({
      ...settings,
      smsApiKey: settings.smsApiKey ? MASK : '',
      paymentGatewayApiKey: settings.paymentGatewayApiKey ? MASK : '',
      paymentGatewaySecret: settings.paymentGatewaySecret ? MASK : '',
      paymentGatewayWebhookSecret: settings.paymentGatewayWebhookSecret ? MASK : '',
    })
  } catch {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const limiter = await rateLimit(request, { windowMs: 60_000, max: 10, prefix: 'settings.update' })
  if (limiter) return limiter

  try {
    const session = await getSession()
    const auth = await requireSuperAdmin()
    if (!auth.ok) return auth.response
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const updated = await saveSystemSettings(parsed.data)
    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'settings',
          resourceId: 'primary',
          action: 'settings.update',
          details: parsed.data,
        },
        session,
        request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
      )
    )

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
