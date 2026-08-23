import { getAuth } from '@/lib/auth'
import { rateLimit } from '@/lib/core/rate-limit'
import type { NextRequest } from 'next/server'

function getHandler() {
  return getAuth().handler
}

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 10,
    prefix: 'auth',
  })
  if (limiter) return limiter
  return getHandler()(request)
}

export async function GET(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 20,
    prefix: 'auth',
  })
  if (limiter) return limiter
  return getHandler()(request)
}
