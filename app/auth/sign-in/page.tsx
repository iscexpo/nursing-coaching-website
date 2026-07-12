'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

type LoginMode = 'phone' | 'email'

export default function SignInPage() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phonePassword, setPhonePassword] = useState('')
  const [email, setEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await authClient.signIn.phoneNumber({
        phoneNumber,
        password: phonePassword,
        rememberMe: true,
      })

      if (authError) {
        setError(authError.message || 'সাইন ইন ব্যর্থ হয়েছে')
        return
      }

      if (data?.user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch {
      setError('সাইন ইন ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password: emailPassword,
        rememberMe: true,
      })

      if (authError) {
        setError(authError.message || 'সাইন ইন ব্যর্থ হয়েছে')
        return
      }

      if (data?.user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch {
      setError('সাইন ইন ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div suppressHydrationWarning className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            সাইন ইন করুন
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            কর্নিয়া নার্সিং কোচিং পোর্টালে প্রবেশ করুন
          </p>
        </div>

        <div className="flex rounded-lg border border-border bg-muted p-1">
          <button
            type="button"
            onClick={() => { setMode('phone'); setError('') }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'phone'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ফোন দিয়ে লগইন
          </button>
          <button
            type="button"
            onClick={() => { setMode('email'); setError('') }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'email'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ইমেইল দিয়ে লগইন
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {mode === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                ফোন নম্বর
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                required
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label htmlFor="phone-password" className="block text-sm font-medium text-foreground">
                পাসওয়ার্ড
              </label>
              <input
                id="phone-password"
                type="password"
                value={phonePassword}
                onChange={(e) => setPhonePassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'লোড হচ্ছে...' : 'সাইন ইন'}
            </button>
          </form>
        )}

        {mode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                ইমেইল
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label htmlFor="email-password" className="block text-sm font-medium text-foreground">
                পাসওয়ার্ড
              </label>
              <input
                id="email-password"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'লোড হচ্ছে...' : 'সাইন ইন'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          অ্যাকাউন্ট নেই?{' '}
          <Link href="/auth/sign-up" className="font-medium text-brand hover:underline">
            নিবন্ধন করুন
          </Link>
        </p>
      </div>
    </div>
  )
}
