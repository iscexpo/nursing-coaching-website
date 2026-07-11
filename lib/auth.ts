import { betterAuth } from 'better-auth'
import { phoneNumber } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import * as schema from './db/schema'

async function sendSupabaseSMS(phoneNumber: string, code: string) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[OTP] Supabase credentials not configured, falling back to console log')
    console.log(`[OTP] Code for ${phoneNumber}: ${code}`)
    return
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ phoneNumber, code }),
    })

    if (!response.ok) {
      console.error('[OTP] Supabase Edge Function failed:', response.status, await response.text())
    }
  } catch (error) {
    console.error('[OTP] Failed to call Supabase Edge Function:', error)
  }
}

export const auth = betterAuth({
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
