import { NextRequest, NextResponse } from 'next/server'

/**
 * CSRF protection for state-changing API requests.
 *
 * Strategy: double-submit cookie pattern.
 * 1. On first GET, set a random CSRF token in a cookie.
 * 2. On POST/PUT/DELETE, the client must send the same token
 *    in the `X-CSRF-Token` header.
 * 3. We compare cookie value → header value.
 *
 * Why this works without server-side state:
 *   An attacker on a different origin cannot read cookies or set
 *   custom headers, so they can't satisfy both constraints.
 */

const CSRF_COOKIE = 'csrf-token'
const CSRF_HEADER = 'x-csrf-token'
const CSRF_TOKEN_LENGTH = 32

const SKIP_ROUTES = [
  '/api/auth/', // Better Auth handles its own CSRF
  '/api/admissions', // Public submission endpoint
  '/api/contact-inquiries', // Public submission endpoint
  '/api/model-test-applicants', // Public submission endpoint
]

function shouldSkip(pathname: string): boolean {
  return SKIP_ROUTES.some((r) => pathname.startsWith(r))
}

function generateToken(): string {
  const bytes = new Uint8Array(CSRF_TOKEN_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function csrfMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const method = request.method.toUpperCase()

  // Only protect state-changing methods
  if (method === 'GET' || method === 'OPTIONS' || method === 'HEAD') {
    return null
  }

  if (shouldSkip(pathname)) {
    return null
  }

  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value
  const headerToken = request.headers.get(CSRF_HEADER)

  // No cookie yet — reject (client should get token from a GET first)
  if (!cookieToken) {
    return NextResponse.json(
      { error: 'CSRF token missing. Refresh the page and try again.' },
      { status: 403 },
    )
  }

  // Header missing or mismatch
  if (!headerToken || headerToken !== cookieToken) {
    return NextResponse.json(
      { error: 'CSRF token mismatch. Refresh the page and try again.' },
      { status: 403 },
    )
  }

  return null
}

/**
 * Ensure a CSRF cookie exists on GET requests.
 * Call this after the CSRF middleware check.
 */
export function ensureCsrfCookie(response: NextResponse, request: NextRequest): NextResponse {
  if (request.method === 'GET' && !request.cookies.get(CSRF_COOKIE)) {
    response.cookies.set(CSRF_COOKIE, generateToken(), {
      httpOnly: false, // JS needs to read it to set the header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })
  }
  return response
}
