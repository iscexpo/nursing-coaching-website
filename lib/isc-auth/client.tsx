'use client'

import { useEffect, useState } from 'react'

export type AuthUser = {
  id: string
  name: string
  email: string
  role?: string | null
  studentId?: string | null
  phoneNumber?: string | null
  phoneNumberVerified?: boolean | null
  image?: string | null
  emailVerified?: boolean
  createdAt?: string
  updatedAt?: string
}

export type SessionPayload = {
  user: AuthUser
  session: {
    id: string
    token: string
    userId: string
    expiresAt: string
    createdAt: string
    updatedAt: string
  }
} | null

export type AuthErrorShape = {
  status: number
  message: string
  code: string
} | null

type AuthResult<T> = { data: T | null; error: AuthErrorShape }

let cache: SessionPayload = null
let loaded = false
let pendingFetch: Promise<void> | null = null
const listeners = new Set<() => void>()

async function fetchSession(): Promise<SessionPayload> {
  try {
    const res = await fetch('/api/auth/get-session', {
      credentials: 'same-origin',
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data && typeof data === 'object' && 'user' in data ? data : null
  } catch {
    return null
  }
}

export async function refreshSession(): Promise<void> {
  if (!pendingFetch) {
    pendingFetch = fetchSession().then((data) => {
      cache = data
      loaded = true
    }).finally(() => {
      pendingFetch = null
    })
  }
  await pendingFetch
  for (const fn of listeners) fn()
}

function ensureLoaded(): Promise<void> {
  if (!loaded && !pendingFetch) {
    void refreshSession()
  }
  return pendingFetch ?? Promise.resolve()
}

export function useSession(): {
  data: SessionPayload
  error: AuthErrorShape
  isPending: boolean
  refetch: () => Promise<void>
} {
  const [, setTick] = useState(0)

  useEffect(() => {
    const notify = () => setTick((t) => t + 1)
    listeners.add(notify)
    void ensureLoaded().then(notify)
    return () => {
      listeners.delete(notify)
    }
  }, [])

  return {
    data: cache,
    error: null,
    isPending: !loaded,
    refetch: refreshSession,
  }
}

async function request<T = unknown>(
  path: string,
  body: unknown,
): Promise<AuthResult<T>> {
  try {
    const res = await fetch(`/api/auth${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
      credentials: 'same-origin',
    })

    let data: unknown = null
    try {
      data = await res.json()
    } catch {
      data = null
    }

    if (!res.ok) {
      const errData = data as { message?: string; code?: string } | null
      return {
        data: null,
        error: {
          status: res.status,
          message: errData?.message || `Request failed (${res.status})`,
          code: errData?.code || 'REQUEST_FAILED',
        },
      }
    }

    void refreshSession()
    return { data: data as T, error: null }
  } catch {
    return {
      data: null,
      error: { status: 0, message: 'Network error', code: 'NETWORK_ERROR' },
    }
  }
}

export type SignUpEmailInput = {
  email: string
  password: string
  name: string
  studentId?: string
  phoneNumber?: string
  callbackURL?: string
}

export const authClient = {
  useSession,
  signIn: {
    email: (body: { email: string; password: string; rememberMe?: boolean }) =>
      request<{ user: AuthUser }>('/sign-in/email', body),
    phoneNumber: (body: {
      phoneNumber: string
      password: string
      rememberMe?: boolean
    }) => request<{ user: AuthUser }>('/sign-in/phone-number', body),
  },
  signUp: {
    email: (body: SignUpEmailInput) =>
      request<{ user: AuthUser }>('/sign-up/email', body),
  },
  signOut: () => request('/sign-out', {}),
  phoneNumber: {
    sendOtp: (body: { phoneNumber: string }) =>
      request('/phone-number/send-otp', body),
    verify: (body: {
      phoneNumber: string
      code: string
      disableSession?: boolean
    }) => request('/phone-number/verify', body),
    requestPasswordReset: (body: { phoneNumber: string }) =>
      request('/phone-number/request-password-reset', body),
    resetPassword: (body: {
      phoneNumber: string
      otp: string
      newPassword: string
    }) => request('/phone-number/reset-password', body),
  },
  requestPasswordReset: (body: { email: string; redirectTo?: string }) =>
    request('/request-password-reset', body),
  resetPassword: (body: { newPassword: string; token?: string }) =>
    request('/reset-password', body),
  changePassword: (body: {
    currentPassword: string
    newPassword: string
    revokeOtherSessions?: boolean
  }) => request('/change-password', body),
}
