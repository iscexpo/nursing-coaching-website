import { NextRequest, NextResponse } from 'next/server'
import { getSession, requireAdmin, requireSuperAdmin } from '@/lib/permissions'
import { getSystemSettings, saveSystemSettings } from '@/lib/settings'
import { settingsSchema } from '@/lib/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    return NextResponse.json(await getSystemSettings())
  } catch {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
