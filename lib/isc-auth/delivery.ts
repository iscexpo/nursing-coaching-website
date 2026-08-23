export async function sendSupabaseSMS(
  phoneNumber: string,
  code: string,
): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      '[isc-auth] OTP delivery is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). ' +
        'Set these variables or the OTP flow will be unavailable.',
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
        '[isc-auth] Supabase Edge Function failed:',
        response.status,
        await response.text(),
      )
    }
  } catch (error) {
    console.error('[isc-auth] Failed to call Supabase Edge Function:', error)
  }
}

export async function sendResetPasswordEmail(
  email: string,
  url: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        `[isc-auth] RESEND_API_KEY is not configured — reset email for ${email} was NOT delivered.`,
      )
    } else {
      console.log(`[isc-auth] Reset link for ${email}: ${url}`)
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
        to: [email],
        subject: 'Reset your password',
        html: `<p>Click the link below to reset your password:</p><p><a href="${url}">${url}</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
      }),
    })

    if (!res.ok) {
      console.error(
        '[isc-auth] Email provider failed:',
        res.status,
        await res.text(),
      )
    }
  } catch (error) {
    console.error('[isc-auth] Failed to send reset email:', error)
  }
}
