import { NextResponse } from 'next/server'
import { db } from '../db'
import { session, user } from '../db/schema'
import { eq, and, ne, gt } from 'drizzle-orm'
import { validateEnv } from '../core/env'
import { generateToken } from './password'

export type HeaderLike = { get(name: string): string | null }

export const SESSION_EXPIRES_IN = 60 * 60 * 24 * 7

const SESSION_COOKIE = 'isc-auth.session_token'
const SECURE_SESSION_COOKIE = '__Secure-isc-auth.session_token'

export function getSessionCookieName(): string {
  return process.env.NODE_ENV === 'production'
    ? SECURE_SESSION_COOKIE
    : SESSION_COOKIE
}

export function getTrustedOrigins(): string[] {
  const env = validateEnv()
  const configured =
    env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',')
      .map((o) => o.trim())
      .filter(Boolean) ?? []
  const defaults = [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000',
  ]
  const all = new Set<string>()
  for (const origin of [
    ...configured,
    ...defaults,
    (env.BETTER_AUTH_URL || '').trim().replace(/\/$/, ''),
  ]) {
    if (origin) all.add(origin)
  }
  return Array.from(all)
}

export function readSessionToken(headers: HeaderLike): string | null {
  const cookieHeader = headers.get('cookie')
  if (!cookieHeader) return null
  const name = getSessionCookieName()
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

export type SessionUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  phoneNumber: string | null
  phoneNumberVerified: boolean | null
  role: string
  studentId: string | null
  createdAt: Date
  updatedAt: Date
}

export type SessionData = {
  user: SessionUser
  session: {
    id: string
    token: string
    userId: string
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
  }
}

export async function createSession(
  userId: string,
  headers: HeaderLike,
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken(32)
  const expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN * 1000)
  await db.insert(session).values({
    id: generateToken(16),
    token,
    userId,
    expiresAt,
    ipAddress:
      headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    userAgent: headers.get('user-agent') || null,
    lastActiveAt: new Date(),
  })
  return { token, expiresAt }
}

export async function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date,
): Promise<NextResponse> {
  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
  return response
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(getSessionCookieName(), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function getSessionFromHeaders(
  headers: HeaderLike,
): Promise<SessionData | null> {
  const token = readSessionToken(headers)
  if (!token) return null

  const rows = await db
    .select({ user, session })
    .from(session)
    .innerJoin(user, eq(session.userId, user.id))
    .where(and(eq(session.token, token), gt(session.expiresAt, new Date())))
    .limit(1)

  if (rows.length === 0) return null
  const row = rows[0]
  return { user: row.user as SessionUser, session: row.session }
}

export async function destroyCurrentSession(
  headers: HeaderLike,
): Promise<void> {
  const token = readSessionToken(headers)
  if (!token) return
  await db.delete(session).where(eq(session.token, token))
}

export async function revokeOtherSessions(
  userId: string,
  currentToken: string,
): Promise<void> {
  await db
    .delete(session)
    .where(and(eq(session.userId, userId), ne(session.token, currentToken)))
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await db.delete(session).where(eq(session.userId, userId))
}
