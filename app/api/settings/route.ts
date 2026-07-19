import { NextRequest, NextResponse } from 'next/server'
import {
  getSession,
  requireAdmin,
  requireSuperAdmin,
  isSuperAdmin,
} from '@/lib/permissions'
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
      smsPassword: settings.smsPassword ? MASK : '',
      paymentGatewayApiKey: settings.paymentGatewayApiKey ? MASK : '',
      paymentGatewaySecret: settings.paymentGatewaySecret ? MASK : '',
      paymentGatewayWebhookSecret: settings.paymentGatewayWebhookSecret
        ? MASK
        : '',
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 },
    )
  }
}

function maskSensitiveFields(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const sensitiveKeys = [
    'smsApiKey',
    'smsPassword',
    'smsEmail',
    'paymentGatewayApiKey',
    'paymentGatewaySecret',
    'paymentGatewayWebhookSecret',
  ]
  const masked: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.includes(key) && typeof value === 'string' && value) {
      masked[key] = '***'
    } else {
      masked[key] = value
    }
  }
  return masked
}

export async function PUT(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 10,
    prefix: 'settings.update',
  })
  if (limiter) return limiter

  try {
    const session = await getSession()
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    // Check if user is trying to update sensitive fields (require super-admin)
    const sensitiveFields = [
      'smsApiKey',
      'smsPassword',
      'paymentGatewayApiKey',
      'paymentGatewaySecret',
      'paymentGatewayWebhookSecret',
    ]
    
    const hasSensitiveUpdate = sensitiveFields.some(
      field => field in parsed.data && parsed.data[field] !== undefined && parsed.data[field] !== ''
    )
    
    if (hasSensitiveUpdate && !isSuperAdmin(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Sensitive settings require super-admin access' },
        { status: 403 },
      )
    }

    const updated = await saveSystemSettings(parsed.data)
    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'settings',
          resourceId: 'primary',
          action: 'settings.update',
          details: maskSensitiveFields(parsed.data as Record<string, unknown>),
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 },
    )
  }
}
