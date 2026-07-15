import { NextResponse } from 'next/server'
import { getSession, getSessionPermissions } from '@/lib/permissions'

export async function GET() {
  const session = await getSession()
  const permissions = getSessionPermissions(session)
  return NextResponse.json({
    hasSession: !!session,
    role: session?.user?.role ?? null,
    permissionCount: permissions.length,
    hasSettingsManage: permissions.includes('settings.manage' as never),
    hasAdminAccess: permissions.includes('admin.access' as never),
    permissionsSample: permissions.slice(0, 8),
  })
}
