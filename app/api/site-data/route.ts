import { NextResponse } from 'next/server'
import { getSiteData } from '@/lib/content-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const site = await getSiteData()
    return NextResponse.json(site, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } })
  } catch {
    return NextResponse.json({ error: 'Failed to load site data' }, { status: 500 })
  }
}
