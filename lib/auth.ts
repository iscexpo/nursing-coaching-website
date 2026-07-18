import { betterAuth } from 'better-auth'
import { phoneNumber } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import { validateEnv } from './env'
import * as schema from './db/schema'

const env = validateEnv()

async function sendSupabaseSMS(phoneNumber: string, code: string) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      '[OTP] OTP delivery is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). ' +
        'Set these variables or the auth OTP flow will be unavailable.',
    )
    return
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ phoneNumber, code }),
    })

    if (!response.ok) {
      console.error(
        '[OTP] Supabase Edge Function failed:',
        response.status,
        await response.text(),
      )
    }
  } catch (error) {
    console.error('[OTP] Failed to call Supabase Edge Function:', error)
  }
}

function getTrustedOrigins() {
  const configured =
    env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []

  const defaults = [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000',
    'http://0.0.0.0:3000',
    'https://0.0.0.0:3000',
    'http://[::1]:3000',
    'https://[::1]:3000',
    'https://iscexpo.edu.bd',
    'http://iscexpo.edu.bd',
    'https://www.iscexpo.edu.bd',
    'http://www.iscexpo.edu.bd',
  ]
  const normalized = new Set<string>()

  for (const origin of [
    ...configured,
    ...defaults,
    env.BETTER_AUTH_URL || '',
  ]) {
    const trimmed = origin.trim().replace(/\/$/, '')
    if (trimmed) normalized.add(trimmed)
  }

  return Array.from(normalized)
}

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: getTrustedOrigins(),
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'student',
        input: false,
      },
      studentId: {
        type: 'string',
        required: false,
        unique: true,
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    phoneNumber({
      sendOTP: ({ phoneNumber: phone, code }) => {
        sendSupabaseSMS(phone, code)
      },
      otpLength: 6,
      expiresIn: 300,
    }),
  ],
})
