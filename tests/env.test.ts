import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { __clearEnvCache, validateEnv } from '@/lib/core/env'

const NEW_SECRET = 'new-secret-0123456789abcdef0123456789abcdef'
const LEGACY_SECRET = 'legacy-secret-0123456789abcdef0123456789abcdef'
const PLACEHOLDER_SECRET =
  'build-time-placeholder-secret-32-chars-minimum-xxxxxxxxxxxx'

const ENV_KEYS = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'ISC_AUTH_SECRET',
  'ISC_AUTH_URL',
  'ISC_AUTH_TRUSTED_ORIGINS',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'BETTER_AUTH_TRUSTED_ORIGINS',
  'NEXT_PHASE',
] as const

describe('validateEnv', () => {
  const saved: Record<string, string | undefined> = {}

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      saved[key] = process.env[key]
      delete process.env[key]
    }
    __clearEnvCache()
  })

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key]
      else process.env[key] = saved[key]
    }
    __clearEnvCache()
  })

  function withEnv(values: Record<string, string>) {
    for (const [key, value] of Object.entries(values)) {
      process.env[key] = value
    }
    __clearEnvCache()
  }

  it('accepts the new ISC_AUTH_* variable names', () => {
    withEnv({
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
      ISC_AUTH_SECRET: NEW_SECRET,
      ISC_AUTH_URL: 'https://iscexpo.edu.bd',
      ISC_AUTH_TRUSTED_ORIGINS: 'https://a.example, https://b.example',
    })

    expect(validateEnv()).toMatchObject({
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
      ISC_AUTH_SECRET: NEW_SECRET,
      ISC_AUTH_URL: 'https://iscexpo.edu.bd',
      ISC_AUTH_TRUSTED_ORIGINS: 'https://a.example, https://b.example',
    })
  })

  it('falls back to legacy BETTER_AUTH_SECRET when ISC_AUTH_SECRET is unset', () => {
    withEnv({
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
      BETTER_AUTH_SECRET: LEGACY_SECRET,
    })

    expect(validateEnv().ISC_AUTH_SECRET).toBe(LEGACY_SECRET)
  })

  it('prefers ISC_AUTH_SECRET over the legacy name', () => {
    withEnv({
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
      ISC_AUTH_SECRET: NEW_SECRET,
      BETTER_AUTH_SECRET: LEGACY_SECRET,
    })

    expect(validateEnv().ISC_AUTH_SECRET).toBe(NEW_SECRET)
  })

  it('rejects a missing or short secret outside the build phase', () => {
    withEnv({ DATABASE_URL: 'postgres://u:p@localhost:5432/db' })
    expect(() => validateEnv()).toThrow(/ISC_AUTH_SECRET/)

    withEnv({
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
      ISC_AUTH_SECRET: 'too-short',
    })
    expect(() => validateEnv()).toThrow(
      /ISC_AUTH_SECRET must be at least 32 characters/,
    )
  })

  it('substitutes a placeholder secret during the build phase instead of throwing', () => {
    withEnv({
      NEXT_PHASE: 'phase-production-build',
      DATABASE_URL: 'postgres://u:p@localhost:5432/db',
    })

    expect(validateEnv().ISC_AUTH_SECRET).toBe(PLACEHOLDER_SECRET)
  })

  it('coalesces Vercel Postgres variables into DATABASE_URL', () => {
    withEnv({
      POSTGRES_URL: 'postgres://vercel:vercel@host/db',
      ISC_AUTH_SECRET: NEW_SECRET,
    })

    expect(validateEnv().DATABASE_URL).toBe('postgres://vercel:vercel@host/db')
  })
})
