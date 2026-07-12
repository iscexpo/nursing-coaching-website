import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/permissions'
import { getSystemSettings, saveSystemSettings } from '@/lib/settings'
import { settingsSchema } from '@/lib/validations'
import { mergeCmsContent } from '@/lib/content-cms'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || (session.user.role !== 'super-admin' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const settings = await getSystemSettings()
    return NextResponse.json({ cmsContent: settings.cmsContent })
  } catch {
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
