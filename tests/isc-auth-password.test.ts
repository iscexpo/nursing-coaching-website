import { describe, it, expect } from 'vitest'
import { scrypt as nodeScrypt, randomBytes } from 'node:crypto'
import { promisify } from 'node:util'
import {
  hashPassword,
  verifyPassword,
  generateOtp,
  generateToken,
} from '@/lib/isc-auth/password'

const scryptAsync = promisify(nodeScrypt)

async function legacyBetterAuthHash(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const key = (await scryptAsync(
    password.normalize('NFKC'),
    salt,
    64,
    { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
  )) as Buffer
  return `${salt}:${key.toString('hex')}`
}

describe('hashPassword', () => {
  it('produces a bcrypt hash', async () => {
    const hash = await hashPassword('secret123')
    expect(hash).toMatch(/^\$2[aby]\$/)
  })
})

describe('verifyPassword', () => {
  it('verifies a freshly hashed bcrypt password', async () => {
    const hash = await hashPassword('correct-horse')
    expect(await verifyPassword('correct-horse', hash)).toBe(true)
    expect(await verifyPassword('wrong-password', hash)).toBe(false)
  })

  it('verifies legacy Better Auth scrypt hashes', async () => {
    const legacy = await legacyBetterAuthHash('legacy-pass-1')
    expect(legacy).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/)
    expect(await verifyPassword('legacy-pass-1', legacy)).toBe(true)
    expect(await verifyPassword('not-the-pass', legacy)).toBe(false)
  })

  it('rejects empty or malformed hashes', async () => {
    expect(await verifyPassword('x', null)).toBe(false)
    expect(await verifyPassword('x', undefined)).toBe(false)
    expect(await verifyPassword('x', '')).toBe(false)
    expect(await verifyPassword('x', 'garbage-format')).toBe(false)
  })
})

describe('generateToken / generateOtp', () => {
  it('generates hex tokens of the requested byte size', () => {
    const token = generateToken(16)
    expect(token).toMatch(/^[0-9a-f]{32}$/)
  })

  it('generates zero-padded numeric OTPs of requested length', () => {
    for (let i = 0; i < 50; i++) {
      const otp = generateOtp(6)
      expect(otp).toMatch(/^\d{6}$/)
    }
  })
})
