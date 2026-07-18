import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export interface RateLimitOptions {
  windowMs: number
  max: number
  prefix?: string
}

let redis: Redis | null = null
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
}

const MEMORY_MAX_ENTRIES = 10_000
const memoryStore = new Map<string, { count: number; expiresAt: number }>()

function getClientIp(request: Request) {
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim()
    if (firstIp) return firstIp
  }

  return 'unknown'
}

function tooManyRequests(retryAfterSeconds: number): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: 'Too many requests, please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.max(1, retryAfterSeconds)),
      },
    },
  )
}

function memoryLimit(
  key: string,
  options: RateLimitOptions,
): NextResponse | null {
  const now = Date.now()

  if (memoryStore.size > MEMORY_MAX_ENTRIES) {
    const oldestKeys: string[] = []
    for (const [k, v] of memoryStore) {
      if (v.expiresAt <= now || oldestKeys.length < 100) {
        oldestKeys.push(k)
      }
    }
    for (const k of oldestKeys) memoryStore.delete(k)
  }

  const existing = memoryStore.get(key)

  if (!existing || existing.expiresAt <= now) {
    memoryStore.set(key, { count: 1, expiresAt: now + options.windowMs })
    return null
  }

  if (existing.count >= options.max) {
    return tooManyRequests(Math.ceil((existing.expiresAt - now) / 1000))
  }

  existing.count += 1
  memoryStore.set(key, existing)
  return null
}

export async function rateLimit(
  request: Request,
  options: RateLimitOptions,
): Promise<NextResponse | null> {
  const prefix = options.prefix ?? 'rl'
  const ip = getClientIp(request)
  const route =
    'nextUrl' in request && (request as any).nextUrl
      ? (request as any).nextUrl.pathname
      : new URL(request.url).pathname
  const key = `${prefix}:${ip}:${route}`

  if (!redis) {
    return memoryLimit(key, options)
  }

  const windowSeconds = Math.max(1, Math.ceil(options.windowMs / 1000))

  try {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, windowSeconds)
    }

    if (count > options.max) {
      const ttl = await redis.ttl(key)
      return tooManyRequests(ttl > 0 ? ttl : windowSeconds)
    }

    return null
  } catch {
    return memoryLimit(key, options)
  }
}
