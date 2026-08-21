import { getAuth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import { rateLimit } from '@/lib/core/rate-limit'

function getHandler() {
  return toNextJsHandler(getAuth())
}

export async function POST(request: Request) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 10,
    prefix: 'auth',
  })
  if (limiter) return limiter
  return getHandler().POST(request)
}

export async function GET(request: Request) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 20,
    prefix: 'auth',
  })
  if (limiter) return limiter
  return getHandler().GET(request)
}
