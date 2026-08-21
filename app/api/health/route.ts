import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/db/health'
import { requireAdmin } from '@/lib/core/permissions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const authz = await requireAdmin()
  if (!authz.ok) return authz.response

  const health = await checkDatabaseHealth()
  return NextResponse.json(health, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
