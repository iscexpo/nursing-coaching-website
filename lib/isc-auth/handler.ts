import { NextResponse, type NextRequest } from 'next/server'
import { api, AuthError } from './api'
import {
  clearSessionCookie,
  getTrustedOrigins,
  setSessionCookie,
} from './session'

function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body as Record<string, unknown>, { status })
}

function errorResponse(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return json({ message: error.message, code: error.code }, error.status)
  }
  console.error('[isc-auth] Unexpected error:', error)
  return json(
    { message: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' },
    500,
  )
}

function assertOrigin(request: NextRequest): void {
  const origin = request.headers.get('origin')
  if (!origin) return
  const trusted = getTrustedOrigins()
  const host = request.headers.get('host')
  let originHost: string | null = null
  try {
    originHost = new URL(origin).host
  } catch {
    originHost = null
  }
  const sameHost = !!host && originHost === host
  const trustedListOk =
    trusted.includes(origin) ||
    trusted.some((t) => {
      try {
        return new URL(t).host === originHost
      } catch {
        return false
      }
    })
  if (!sameHost && !trustedListOk) {
    throw new AuthError(403, 'Invalid origin', 'INVALID_ORIGIN')
  }
}

async function readBody(
  request: NextRequest,
): Promise<Record<string, unknown>> {
  try {
    const data = await request.json()
    return typeof data === 'object' && data !== null
      ? (data as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

type RouteResult = {
  body: unknown
  session?: { token: string; expiresAt: Date }
  clearsSession?: boolean
}

async function route(
  method: string,
  path: string,
  request: NextRequest,
): Promise<RouteResult> {
  const headers = request.headers

  if (method === 'GET') {
    if (path === '/get-session') {
      const data = await api.getSession({ headers })
      return { body: data }
    }
    throw new AuthError(404, 'Not found', 'NOT_FOUND')
  }

  if (method !== 'POST') {
    throw new AuthError(404, 'Not found', 'NOT_FOUND')
  }

  switch (path) {
    case '/sign-in/email': {
      const result = await api.signInEmail({
        body: await readBody(request),
        headers,
      })
      return {
        body: { user: result.user },
        session: { token: result.token!, expiresAt: result.expiresAt! },
      }
    }
    case '/sign-up/email': {
      const result = await api.signUpEmail({
        body: await readBody(request),
        headers,
      })
      if (result.token) {
        return {
          body: { user: result.user },
          session: { token: result.token, expiresAt: result.expiresAt! },
        }
      }
      return { body: { user: result.user } }
    }
    case '/sign-in/phone-number': {
      const result = await api.signInPhoneNumber({
        body: await readBody(request),
        headers,
      })
      return {
        body: { user: result.user },
        session: { token: result.token!, expiresAt: result.expiresAt! },
      }
    }
    case '/phone-number/send-otp':
      return {
        body: await api.sendPhoneNumberOtp({ body: await readBody(request) }),
      }
    case '/phone-number/verify': {
      const result = await api.verifyPhoneNumber({
        body: await readBody(request),
        headers,
      })
      if (result.token) {
        return {
          body: { status: true, user: result.user },
          session: { token: result.token, expiresAt: result.expiresAt! },
        }
      }
      return { body: { status: true, user: result.user } }
    }
    case '/phone-number/request-password-reset':
      return {
        body: await api.requestPasswordResetPhone({
          body: await readBody(request),
        }),
      }
    case '/phone-number/reset-password':
      return {
        body: await api.resetPasswordPhone({ body: await readBody(request) }),
      }
    case '/request-password-reset':
      return {
        body: await api.requestPasswordReset({ body: await readBody(request) }),
      }
    case '/reset-password':
      return {
        body: await api.resetPassword({ body: await readBody(request) }),
      }
    case '/change-password':
      return {
        body: await api.changePassword({
          body: await readBody(request),
          headers,
        }),
      }
    case '/sign-out':
      await api.signOut({ headers })
      return { body: { status: true }, clearsSession: true }
    default:
      throw new AuthError(404, 'Not found', 'NOT_FOUND')
  }
}

export async function handleAuthRequest(
  request: NextRequest,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const basePath = pathname.replace(/^\/api\/auth/, '') || '/'
  const method = request.method.toUpperCase()

  try {
    if (method === 'POST') {
      assertOrigin(request)
    }
    const result = await route(method, basePath, request)
    const response = json(result.body)
    if (result.session) {
      await setSessionCookie(
        response,
        result.session.token,
        result.session.expiresAt,
      )
    }
    if (result.clearsSession) {
      clearSessionCookie(response)
    }
    return response
  } catch (error) {
    return errorResponse(error)
  }
}
