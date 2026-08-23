import { describe, it, expect, beforeEach, vi } from 'vitest'

process.env.ISC_AUTH_SECRET =
  'test_secret_key_for_isc_auth_unit_tests_0123456789'
;(process.env as { NODE_ENV?: string }).NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test'
process.env.ISC_AUTH_URL = 'https://iscexpo.edu.bd'

type Row = Record<string, unknown>

const selectQueue: Row[][] = []
const insertedUsers: Row[] = []
let lastUpdate: { table?: string } | null = null

function makeThenable<T>(value: T): Promise<T> & { returning: () => Promise<T[]> } {
  const p = Promise.resolve(value) as Promise<T> & {
    returning: () => Promise<T[]>
  }
  p.returning = async () => [value]
  return p
}

function chainFor(rows: Row[]) {
  return {
    from: () => ({
      where: () => ({
        limit: async () => rows,
        innerJoin: () => ({
          where: () => ({ limit: async () => rows }),
        }),
      }),
      innerJoin: () => ({
        where: () => ({ limit: async () => rows }),
      }),
    }),
  }
}

vi.mock('@/lib/db', () => {
  return {
    db: {
      select: () => {
        const rows = selectQueue.length ? selectQueue.shift()! : []
        return chainFor(rows as Row[])
      },
      insert: () => ({
        values: (v: Row) => makeThenable(v),
      }),
      update: () => ({
        set: () => ({
          where: async () => {
            lastUpdate = {}
          },
        }),
      }),
      delete: () => ({
        where: async () => {},
      }),
    },
  }
})

import { api, AuthError } from '@/lib/isc-auth/api'
import { hashPassword } from '@/lib/isc-auth/password'
import { handleAuthRequest } from '@/lib/isc-auth/handler'
import { NextRequest } from 'next/server'

function req(
  pathname: string,
  init?: ConstructorParameters<typeof NextRequest>[1],
): NextRequest {
  return new NextRequest(`https://iscexpo.edu.bd/api/auth${pathname}`, init)
}

function userRow(overrides: Row = {}): Row {
  return {
    id: 'usr_1',
    name: 'Test User',
    email: 'user@example.com',
    emailVerified: false,
    image: null,
    phoneNumber: null,
    phoneNumberVerified: false,
    role: 'student',
    studentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

beforeEach(() => {
  selectQueue.length = 0
  insertedUsers.length = 0
  lastUpdate = null
})

describe('api.signUpEmail', () => {
  it('throws USER_ALREADY_EXISTS when email is taken', async () => {
    selectQueue.push([userRow()])
    await expect(
      api.signUpEmail({
        body: { name: 'A', email: 'user@example.com', password: 'secret1' },
      }),
    ).rejects.toMatchObject({
      status: 422,
      code: 'USER_ALREADY_EXISTS',
    })
  })

  it('creates a student-role user with hashed credential and returns it', async () => {
    selectQueue.push([])
    const result = await api.signUpEmail({
      body: {
        name: 'New Student',
        email: 'New@Example.com ',
        password: 'secret1',
        studentId: 'ISC-0007',
        role: 'super-admin',
      },
    })
    expect(result.user.role).toBe('student')
    expect(result.user.email).toBe('new@example.com')
    expect(result.user.studentId).toBe('ISC-0007')
    expect(String(result.user.id)).toBeTruthy()
  })

  it('rejects short passwords', async () => {
    await expect(
      api.signUpEmail({
        body: { name: 'A', email: 'a@b.co', password: '123' },
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_PASSWORD' })
  })
})

describe('api.signInEmail', () => {
  it('returns 401 for unknown email', async () => {
    selectQueue.push([])
    await expect(
      api.signInEmail({
        body: { email: 'ghost@example.com', password: 'whatever1' },
        headers: new Headers(),
      }),
    ).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_EMAIL_OR_PASSWORD',
    })
  })

  it('issues a session token on correct credentials', async () => {
    const hash = await hashPassword('correct1')
    selectQueue.push(
      [userRow()],
      [
        {
          id: 'acc_1',
          accountId: 'usr_1',
          providerId: 'credential',
          userId: 'usr_1',
          password: hash,
        },
      ],
    )
    const result = await api.signInEmail({
      body: { email: 'user@example.com', password: 'correct1' },
      headers: new Headers(),
    })
    expect(result.token).toMatch(/^[0-9a-f]{64}$/)
    expect(result.expiresAt!.getTime()).toBeGreaterThan(Date.now())
  })

  it('returns 401 when the stored hash belongs to another password', async () => {
    const hash = await hashPassword('other-pass')
    selectQueue.push(
      [userRow()],
      [
        {
          id: 'acc_1',
          providerId: 'credential',
          userId: 'usr_1',
          password: hash,
        },
      ],
    )
    await expect(
      api.signInEmail({
        body: { email: 'user@example.com', password: 'wrong-pass' },
        headers: new Headers(),
      }),
    ).rejects.toMatchObject({ status: 401 })
  })
})

describe('phone OTP verification guards', () => {
  const identifier = '+8801700000000-request-password-reset'
  const futureExpiry = new Date(Date.now() + 5 * 60 * 1000)

  it('rejects wrong code and counts the attempt', async () => {
    const storedRow = {
      id: 'v1',
      identifier,
      value: '999999:0',
      expiresAt: futureExpiry,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    selectQueue.push([storedRow], [storedRow])
    await expect(
      api.resetPasswordPhone({
        body: {
          phoneNumber: '+8801700000000',
          otp: '111111',
          newPassword: 'brand-new-pw',
        },
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_OTP' })
    expect(lastUpdate).not.toBeNull()
  })

  it('rejects expired codes with OTP_EXPIRED', async () => {
    selectQueue.push([
      {
        id: 'v1',
        identifier,
        value: '999999:0',
        expiresAt: new Date(Date.now() - 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    await expect(
      api.resetPasswordPhone({
        body: {
          phoneNumber: '+8801700000000',
          otp: '999999',
          newPassword: 'brand-new-pw',
        },
      }),
    ).rejects.toMatchObject({ status: 400, code: 'OTP_EXPIRED' })
  })

  it('locks out after the allowed attempt budget', async () => {
    selectQueue.push([
      {
        id: 'v1',
        identifier,
        value: '999999:3',
        expiresAt: futureExpiry,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    await expect(
      api.resetPasswordPhone({
        body: {
          phoneNumber: '+8801700000000',
          otp: '999999',
          newPassword: 'brand-new-pw',
        },
      }),
    ).rejects.toMatchObject({ status: 403, code: 'TOO_MANY_ATTEMPTS' })
  })
})

describe('api.changePassword', () => {
  it('requires a session', async () => {
    await expect(
      api.changePassword({
        body: { currentPassword: 'a1b2c3', newPassword: 'newpass1' },
        headers: new Headers(),
      }),
    ).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
  })
})

describe('handleAuthRequest HTTP semantics', () => {
  it('returns 404 JSON for unknown paths', async () => {
    const res = await handleAuthRequest(req('/does-not-exist', { method: 'POST' }))
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.code).toBe('NOT_FOUND')
  })

  it('blocks cross-origin POSTs with INVALID_ORIGIN', async () => {
    const res = await handleAuthRequest(
      req('/sign-in/email', {
        method: 'POST',
        headers: { Origin: 'https://evil.example.net' },
      }),
    )
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('INVALID_ORIGIN')
  })

  it('allows same-origin POSTs through to validation', async () => {
    const res = await handleAuthRequest(
      req('/sign-in/email', {
        method: 'POST',
        headers: {
          Origin: 'https://iscexpo.edu.bd',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'ghost@example.com', password: 'nope123' }),
      }),
    )
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.code).toBe('INVALID_EMAIL_OR_PASSWORD')
  })

  it('get-session without a cookie yields null body with 200', async () => {
    const res = await handleAuthRequest(req('/get-session'))
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toBe('null')
  })
})

describe('AuthError', () => {
  it('carries status, message and code', () => {
    const err = new AuthError(418, 'teapot', 'IM_A_TEAPOT')
    expect(err.status).toBe(418)
    expect(err.message).toBe('teapot')
    expect(err.code).toBe('IM_A_TEAPOT')
    expect(err instanceof Error).toBe(true)
  })
})
