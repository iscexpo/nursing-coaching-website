import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import { rateLimit } from '@/lib/rate-limit'

const handler = toNextJsHandler(auth)

export async function POST(request: Request) {
  const limiter = await rateLimit(request as any, { windowMs: 60_000, max: 10, prefix: 'auth' })
  if (limiter) return limiter
  return handler.POST(request)
}

export async function GET(request: Request) {
  const limiter = await rateLimit(request as any, { windowMs: 60_000, max: 20, prefix: 'auth' })
  if (limiter) return limiter
  return handler.GET(request)
}
