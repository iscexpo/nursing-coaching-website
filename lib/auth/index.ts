import { betterAuth } from 'better-auth'
import { phoneNumber } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getDb } from '../db'
import { validateEnv } from '../core/env'
import * as schema from '../db/schema'

type AuthInstance = ReturnType<typeof createAuth>

let _auth: AuthInstance | null = null

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

function getTrustedOrigins(env: ReturnType<typeof validateEnv>) {
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

function createAuth() {
  const env = validateEnv()
  const db = getDb()

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL || 'http://localhost:3000',
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: getTrustedOrigins(env),
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
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // refresh every 24h
      // Limit concurrent sessions per user
      // Better Auth doesn't natively enforce this, but we can
      // use a hook. For now, store the limit as a config value
      // and enforce it in the logout-all endpoint.
      freshAge: 60 * 60, // 1 hour — sessions younger than this are "fresh"
    },
    emailAndPassword: {
      enabled: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        const apiKey = process.env.RESEND_API_KEY

        if (!apiKey) {
          if (process.env.NODE_ENV === 'production') {
            console.error(
              `[Reset Password] RESEND_API_KEY is not configured — reset email for ${user.email} was NOT delivered.`,
            )
          } else {
            console.log(`[Reset Password] Reset link for ${user.email}: ${url}`)
          }
          return
        }

        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || 'ISC Expo <onboarding@resend.dev>',
              to: [user.email],
              subject: 'Reset your password',
              html: `<p>Click the link below to reset your password:</p><p><a href="${url}">${url}</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
            }),
          })

          if (!res.ok) {
            console.error(
              '[Reset Password] Email provider failed:',
              res.status,
              await res.text(),
            )
          }
        } catch (error) {
          console.error('[Reset Password] Failed to send reset email:', error)
        }
      },
    },
    plugins: [
      phoneNumber({
        sendOTP: ({ phoneNumber: phone, code }) => {
          sendSupabaseSMS(phone, code)
        },
        sendPasswordResetOTP: ({ phoneNumber: phone, code }) => {
          sendSupabaseSMS(phone, code)
        },
        otpLength: 6,
        expiresIn: 300,
      }),
    ],
  })
}

export function getAuth(): AuthInstance {
  if (!_auth) {
    _auth = createAuth()
  }
  return _auth
}

export const auth = new Proxy({} as AuthInstance, {
  get(_, prop) {
    return (getAuth() as AuthInstance)[prop as keyof AuthInstance]
  },
})
