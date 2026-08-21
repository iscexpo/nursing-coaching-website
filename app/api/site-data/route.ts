import { NextResponse } from 'next/server'
import { getSiteData } from '@/lib/cms/server'
import { serverError } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const site = await getSiteData()
    return NextResponse.json(site, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch {
    return serverError('Failed to load site data')
  }
}
