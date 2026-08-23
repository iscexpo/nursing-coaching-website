import { randomBytes, scrypt as nodeScrypt } from 'node:crypto'
import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 10

const LEGACY_SCRYPT = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
}

const BCRYPT_PREFIX = /^\$2[aby]\$/
const LEGACY_BA_SCRYPT =
  /^[0-9a-f]{32}:[0-9a-f]{128}$/i

function deriveLegacyScrypt(
  password: string,
  salt: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeScrypt(
      password.normalize('NFKC'),
      salt,
      LEGACY_SCRYPT.dkLen,
      {
        N: LEGACY_SCRYPT.N,
        r: LEGACY_SCRYPT.r,
        p: LEGACY_SCRYPT.p,
        maxmem: 128 * LEGACY_SCRYPT.N * LEGACY_SCRYPT.r * 2,
      },
      (err, key) => (err ? reject(err) : resolve(key)),
    )
  })
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hash: string | null | undefined,
): Promise<boolean> {
  if (!hash) return false

  if (BCRYPT_PREFIX.test(hash)) {
    return bcrypt.compare(password, hash)
  }

  if (LEGACY_BA_SCRYPT.test(hash)) {
    const [salt, key] = hash.split(':')
    const derived = (await deriveLegacyScrypt(password, salt)).toString('hex')
    return derived === key.toLowerCase()
  }

  return false
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex')
}

export function generateOtp(length = 6): string {
  const max = 10 ** length
  return String(randomBytes(4).readUInt32BE(0) % max).padStart(length, '0')
}
