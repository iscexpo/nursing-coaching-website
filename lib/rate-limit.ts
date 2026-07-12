import { NextResponse } from 'next/server'

const rateLimitStore = new Map<string, { count: number; expiresAt: number }>()

export interface RateLimitOptions {
  windowMs: number
  max: number
  prefix?: string
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}

export function rateLimit(request: Request, options: RateLimitOptions): NextResponse | null {
  const prefix = options.prefix ?? 'rl'
  const ip = getClientIp(request)
  const route = 'nextUrl' in request && (request as any).nextUrl ? (request as any).nextUrl.pathname : new URL(request.url).pathname
  const key = `${prefix}:${ip}:${route}`
  const now = Date.now()
  const existing = rateLimitStore.get(key)

  if (!existing || existing.expiresAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      expiresAt: now + options.windowMs,
    })
    return null
  }

  if (existing.count >= options.max) {
    const retryAfter = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000))
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests, please try again again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
        },
      }
    )
  }

  existing.count += 1
  rateLimitStore.set(key, existing)
  return null
}
