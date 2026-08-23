import { db } from '../db'
import { user, account, verification } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import {
  generateToken,
  generateOtp,
  hashPassword,
  verifyPassword,
} from './password'
import {
  createSession,
  deleteUserSessions,
  getSessionFromHeaders,
  destroyCurrentSession,
  revokeOtherSessions,
  type SessionData,
  type SessionUser,
} from './session'
import { sendSupabaseSMS, sendResetPasswordEmail } from './delivery'
import { validateEnv } from '../core/env'
import type { HeaderLike } from './session'

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

const MIN_PASSWORD_LENGTH = 6
const OTP_EXPIRES_IN = 300
const OTP_MAX_ATTEMPTS = 3
const RESET_TOKEN_EXPIRES_IN = 60 * 60

function baseUrl(): string {
  const env = validateEnv()
  return (env.ISC_AUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
}

function toSessionUser(row: typeof user.$inferSelect): SessionUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? '',
    emailVerified: row.emailVerified,
    image: row.image ?? null,
    phoneNumber: row.phoneNumber ?? null,
    phoneNumberVerified: row.phoneNumberVerified,
    role: row.role ?? 'student',
    studentId: row.studentId ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function normalizeEmail(email: unknown): string {
  if (typeof email !== 'string' || !email.includes('@')) {
    throw new AuthError(400, 'Invalid email', 'INVALID_EMAIL')
  }
  return email.trim().toLowerCase()
}

function requirePassword(pw: unknown): string {
  if (
    typeof pw !== 'string' ||
    pw.length < MIN_PASSWORD_LENGTH ||
    pw.length > 128
  ) {
    throw new AuthError(
      400,
      `Password must be between ${MIN_PASSWORD_LENGTH} and 128 characters`,
      'INVALID_PASSWORD',
    )
  }
  return pw
}

async function findUserByEmail(email: string) {
  const rows = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1)
  return rows[0] ?? null
}

async function findUserByPhone(phoneNumber: string) {
  const rows = await db
    .select()
    .from(user)
    .where(eq(user.phoneNumber, phoneNumber))
    .limit(1)
  return rows[0] ?? null
}

async function getCredentialAccount(userId: string) {
  const rows = await db
    .select()
    .from(account)
    .where(
      and(eq(account.userId, userId), eq(account.providerId, 'credential')),
    )
    .limit(1)
  return rows[0] ?? null
}

async function setPassword(userId: string, hashed: string): Promise<void> {
  const existing = await getCredentialAccount(userId)
  if (existing) {
    await db
      .update(account)
      .set({ password: hashed, updatedAt: new Date() })
      .where(eq(account.id, existing.id))
  } else {
    await db.insert(account).values({
      id: generateToken(16),
      accountId: userId,
      providerId: 'credential',
      userId,
      password: hashed,
    })
  }
}

async function issueSession(
  userId: string,
  headers: HeaderLike,
): Promise<{ token: string; expiresAt: Date }> {
  return createSession(userId, headers)
}

type OtpRow = typeof verification.$inferSelect

async function readVerification(identifier: string): Promise<OtpRow | null> {
  const rows = await db
    .select()
    .from(verification)
    .where(eq(verification.identifier, identifier))
    .limit(1)
  return rows[0] ?? null
}

async function writeVerification(
  identifier: string,
  value: string,
  ttlSeconds: number,
): Promise<void> {
  const existing = await readVerification(identifier)
  if (existing) {
    await db
      .update(verification)
      .set({
        value,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        updatedAt: new Date(),
      })
      .where(eq(verification.id, existing.id))
  } else {
    await db.insert(verification).values({
      id: generateToken(16),
      identifier,
      value,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    })
  }
}

async function consumeVerification(identifier: string): Promise<void> {
  await db.delete(verification).where(eq(verification.identifier, identifier))
}

async function verifyStoredCode(
  identifier: string,
  code: string,
): Promise<void> {
  const row = await readVerification(identifier)
  if (!row) {
    throw new AuthError(400, 'OTP not found', 'OTP_NOT_FOUND')
  }
  if (row.expiresAt < new Date()) {
    await consumeVerification(identifier)
    throw new AuthError(400, 'OTP expired', 'OTP_EXPIRED')
  }
  const [storedCode, attemptsRaw] = row.value.split(':')
  const attempts = parseInt(attemptsRaw || '0', 10)
  if (attempts >= OTP_MAX_ATTEMPTS) {
    await consumeVerification(identifier)
    throw new AuthError(403, 'Too many attempts', 'TOO_MANY_ATTEMPTS')
  }
  if (storedCode !== code.trim()) {
    await writeVerification(
      identifier,
      `${storedCode}:${attempts + 1}`,
      Math.max(1, Math.floor((row.expiresAt.getTime() - Date.now()) / 1000)),
    )
    throw new AuthError(400, 'Invalid OTP', 'INVALID_OTP')
  }
  await consumeVerification(identifier)
}

async function authenticateWithPassword(
  lookupUser: Awaited<ReturnType<typeof findUserByEmail>>,
  password: string,
  headers: HeaderLike,
): Promise<{ user: SessionUser; token: string; expiresAt: Date }> {
  if (!lookupUser) {
    throw new AuthError(
      401,
      'Invalid email or password',
      'INVALID_EMAIL_OR_PASSWORD',
    )
  }
  const cred = await getCredentialAccount(lookupUser.id)
  const ok = !!cred && (await verifyPassword(password, cred.password))
  if (!ok) {
    throw new AuthError(
      401,
      'Invalid email or password',
      'INVALID_EMAIL_OR_PASSWORD',
    )
  }
  const { token, expiresAt } = await issueSession(lookupUser.id, headers)
  return { user: toSessionUser(lookupUser), token, expiresAt }
}

export type ApiResult<T> = T & { token?: string; expiresAt?: Date }

export const api = {
  async getSession({
    headers,
  }: {
    headers: HeaderLike
  }): Promise<SessionData | null> {
    return getSessionFromHeaders(headers)
  },

  async signUpEmail({
    body,
    headers,
  }: {
    body: Record<string, unknown>
    headers?: HeaderLike
  }): Promise<ApiResult<{ user: SessionUser }>> {
    const email = normalizeEmail(body.email)
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const password = requirePassword(body.password)

    if (!name) {
      throw new AuthError(400, 'Name is required', 'NAME_REQUIRED')
    }

    const existing = await findUserByEmail(email)
    if (existing) {
      throw new AuthError(422, 'User already exists', 'USER_ALREADY_EXISTS')
    }

    const studentId =
      typeof body.studentId === 'string' && body.studentId.trim()
        ? body.studentId.trim()
        : null
    const phoneNumber =
      typeof body.phoneNumber === 'string' && body.phoneNumber.trim()
        ? body.phoneNumber.trim()
        : null

    const hashed = await hashPassword(password)
    const userId = generateToken(16)

    let created
    try {
      const inserted = await db
        .insert(user)
        .values({
          id: userId,
          name,
          email,
          role: 'student',
          ...(studentId ? { studentId } : {}),
          ...(phoneNumber ? { phoneNumber } : {}),
        })
        .returning()
      created = inserted[0]
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code?: string }).code === '23505'
      ) {
        throw new AuthError(
          422,
          'A field value is already in use',
          'UNIQUE_CONSTRAINT_VIOLATION',
        )
      }
      throw err
    }

    await db.insert(account).values({
      id: generateToken(16),
      accountId: userId,
      providerId: 'credential',
      userId,
      password: hashed,
    })

    if (headers) {
      const { token, expiresAt } = await issueSession(created.id, headers)
      return { user: toSessionUser(created), token, expiresAt }
    }
    return { user: toSessionUser(created) }
  },

  async signInEmail({
    body,
    headers,
  }: {
    body: Record<string, unknown>
    headers: HeaderLike
  }): Promise<ApiResult<{ user: SessionUser }>> {
    const email = normalizeEmail(body.email)
    const password = typeof body.password === 'string' ? body.password : ''
    const found = await findUserByEmail(email)
    return authenticateWithPassword(found, password, headers)
  },

  async signInPhoneNumber({
    body,
    headers,
  }: {
    body: Record<string, unknown>
    headers: HeaderLike
  }): Promise<ApiResult<{ user: SessionUser }>> {
    const phoneNumber =
      typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    if (!phoneNumber) {
      throw new AuthError(400, 'Phone number is required', 'PHONE_REQUIRED')
    }
    const found = await findUserByPhone(phoneNumber)
    return authenticateWithPassword(found, password, headers)
  },

  async sendPhoneNumberOtp({
    body,
  }: {
    body: Record<string, unknown>
  }): Promise<{ status: true }> {
    const phoneNumber =
      typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : ''
    if (!phoneNumber) {
      throw new AuthError(400, 'Phone number is required', 'PHONE_REQUIRED')
    }
    const code = generateOtp(6)
    await writeVerification(
      `${phoneNumber}-verify`,
      `${code}:0`,
      OTP_EXPIRES_IN,
    )
    await sendSupabaseSMS(phoneNumber, code)
    return { status: true }
  },

  async verifyPhoneNumber({
    body,
    headers,
  }: {
    body: Record<string, unknown>
    headers: HeaderLike
  }): Promise<ApiResult<{ status: true; user?: SessionUser }>> {
    const phoneNumber =
      typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : ''
    const code = typeof body.code === 'string' ? body.code : ''
    const disableSession = body.disableSession === true
    if (!phoneNumber || !code) {
      throw new AuthError(
        400,
        'Phone number and code are required',
        'INVALID_BODY',
      )
    }
    await verifyStoredCode(`${phoneNumber}-verify`, code)

    const found = await findUserByPhone(phoneNumber)
    if (found) {
      await db
        .update(user)
        .set({ phoneNumberVerified: true, updatedAt: new Date() })
        .where(eq(user.id, found.id))
    }

    if (!disableSession) {
      if (!found) {
        throw new AuthError(400, 'No account found', 'USER_NOT_FOUND')
      }
      const { token, expiresAt } = await issueSession(found.id, headers)
      return { status: true, user: toSessionUser(found), token, expiresAt }
    }
    return found
      ? { status: true, user: toSessionUser(found) }
      : { status: true }
  },

  async requestPasswordResetPhone({
    body,
  }: {
    body: Record<string, unknown>
  }): Promise<{ status: true }> {
    const phoneNumber =
      typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : ''
    if (!phoneNumber) {
      throw new AuthError(400, 'Phone number is required', 'PHONE_REQUIRED')
    }
    const found = await findUserByPhone(phoneNumber)
    const code = generateOtp(6)
    await writeVerification(
      `${phoneNumber}-request-password-reset`,
      `${code}:0`,
      OTP_EXPIRES_IN,
    )
    if (found) {
      await sendSupabaseSMS(phoneNumber, code)
    }
    return { status: true }
  },

  async resetPasswordPhone({
    body,
  }: {
    body: Record<string, unknown>
  }): Promise<{ status: true }> {
    const phoneNumber =
      typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : ''
    const otp = typeof body.otp === 'string' ? body.otp : ''
    const newPassword = requirePassword(body.newPassword)
    if (!phoneNumber) {
      throw new AuthError(400, 'Phone number is required', 'PHONE_REQUIRED')
    }
    await verifyStoredCode(`${phoneNumber}-request-password-reset`, otp)

    const found = await findUserByPhone(phoneNumber)
    if (!found) {
      throw new AuthError(400, 'Unexpected error', 'UNEXPECTED_ERROR')
    }
    await setPassword(found.id, await hashPassword(newPassword))
    await deleteUserSessions(found.id)
    return { status: true }
  },

  async requestPasswordReset({
    body,
  }: {
    body: Record<string, unknown>
  }): Promise<{ status: true }> {
    const email = normalizeEmail(body.email)
    const found = await findUserByEmail(email)
    if (found) {
      const token = generateToken(32)
      await writeVerification(
        `reset-password-${token}`,
        found.id,
        RESET_TOKEN_EXPIRES_IN,
      )
      const url = `${baseUrl()}/auth/reset-password?token=${token}`
      if (found.email) await sendResetPasswordEmail(found.email, url)
    }
    return { status: true }
  },

  async resetPassword({
    body,
  }: {
    body: Record<string, unknown>
  }): Promise<{ status: true }> {
    const token = typeof body.token === 'string' ? body.token : ''
    const newPassword = requirePassword(body.newPassword)
    if (!token) {
      throw new AuthError(400, 'Reset token is missing', 'INVALID_TOKEN')
    }
    const row = await readVerification(`reset-password-${token}`)
    if (!row || row.expiresAt < new Date()) {
      if (row) await consumeVerification(`reset-password-${token}`)
      throw new AuthError(
        400,
        'Invalid or expired reset token',
        'INVALID_TOKEN',
      )
    }
    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, row.value))
      .limit(1)
    const found = users[0]
    if (!found) {
      throw new AuthError(400, 'Unexpected error', 'UNEXPECTED_ERROR')
    }
    await setPassword(found.id, await hashPassword(newPassword))
    await deleteUserSessions(found.id)
    await consumeVerification(`reset-password-${token}`)
    return { status: true }
  },

  async changePassword({
    body,
    headers,
  }: {
    body: Record<string, unknown>
    headers: HeaderLike
  }): Promise<{ status: true }> {
    const current =
      typeof body.currentPassword === 'string' ? body.currentPassword : ''
    const next = requirePassword(body.newPassword)
    const data = await getSessionFromHeaders(headers)
    if (!data) {
      throw new AuthError(401, 'Unauthorized', 'UNAUTHORIZED')
    }
    const cred = await getCredentialAccount(data.user.id)
    if (!cred || !(await verifyPassword(current, cred.password))) {
      throw new AuthError(400, 'Invalid current password', 'INVALID_PASSWORD')
    }
    await setPassword(data.user.id, await hashPassword(next))
    if (body.revokeOtherSessions === true) {
      await revokeOtherSessions(data.user.id, data.session.token)
    }
    return { status: true }
  },

  async signOut({
    headers,
  }: {
    headers: HeaderLike
  }): Promise<{ status: true }> {
    await destroyCurrentSession(headers)
    return { status: true }
  },
}
