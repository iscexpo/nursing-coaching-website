'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

type SignUpMode = 'phone' | 'email'
type PhoneStep = 'phone' | 'otp' | 'details'

export default function SignUpPage() {
  const router = useRouter()
  const [mode, setMode] = useState<SignUpMode>('phone')
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [emailName, setEmailName] = useState('')
  const [email, setEmail] = useState('')
  const [emailPhone, setEmailPhone] = useState('')
  const [emailPassword, setEmailPassword] = useState('')

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: otpError } = await authClient.phoneNumber.sendOtp({
        phoneNumber,
      })

      if (otpError) {
        setError(otpError.message || 'OTP পাঠানো যায়নি')
        return
      }

      setPhoneStep('otp')
    } catch {
      setError('OTP পাঠানো যায়নি')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: verifyError } = await authClient.phoneNumber.verify({
        phoneNumber,
        code: otpCode,
        disableSession: true,
      })

      if (verifyError) {
        setError(verifyError.message || 'OTP যাচাই ব্যর্থ')
        return
      }

      setPhoneStep('details')
    } catch {
      setError('OTP যাচাই ব্যর্থ')
    } finally {
      setLoading(false)
    }
  }

  async function handlePhoneSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signUpError } = await authClient.signUp.email({
        email: `${phoneNumber}@cornia.auth`,
        password,
        name,
        studentId: studentId || undefined,
      })

      if (signUpError) {
        setError(signUpError.message || 'নিবন্ধন ব্যর্থ হয়েছে')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('নিবন্ধন ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password: emailPassword,
        name: emailName,
        phoneNumber: emailPhone || undefined,
      })

      if (signUpError) {
        setError(signUpError.message || 'নিবন্ধন ব্যর্থ হয়েছে')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('নিবন্ধন ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            নিবন্ধন করুন
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            কর্নিয়া নার্সিং কোচিং-এ যোগ দিন
          </p>
        </div>

        <div className="flex rounded-lg border border-border bg-muted p-1">
          <button
            type="button"
            onClick={() => { setMode('phone'); setError(''); setPhoneStep('phone') }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'phone'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ফোন দিয়ে নিবন্ধন
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
            ইমেইল দিয়ে নিবন্ধন
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {mode === 'phone' && phoneStep === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'পাঠানো হচ্ছে...' : 'OTP পাঠান'}
            </button>
          </form>
        )}

        {mode === 'phone' && phoneStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{phoneNumber}</span> নম্বরে OTP পাঠানো হয়েছে
            </p>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-foreground">
                OTP কোড
              </label>
              <input
                id="otp"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="6 ডিজিটের কোড"
                maxLength={6}
                required
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'যাচাই হচ্ছে...' : 'যাচাই করুন'}
            </button>

            <button
              type="button"
              onClick={() => setPhoneStep('phone')}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              ফোন নম্বর পরিবর্তন করুন
            </button>
          </form>
        )}

        {mode === 'phone' && phoneStep === 'details' && (
          <form onSubmit={handlePhoneSignUp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                পুরো নাম
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার নাম"
                required
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-foreground">
                শিক্ষার্থী ID (ঐচ্ছিক)
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="যদি থাকে"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                পাসওয়ার্ড
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'নিবন্ধন হচ্ছে...' : 'নিবন্ধন করুন'}
            </button>
          </form>
        )}

        {mode === 'email' && (
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label htmlFor="email-name" className="block text-sm font-medium text-foreground">
                পুরো নাম
              </label>
              <input
                id="email-name"
                type="text"
                value={emailName}
                onChange={(e) => setEmailName(e.target.value)}
                placeholder="আপনার নাম"
                required
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

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
              <label htmlFor="email-phone" className="block text-sm font-medium text-foreground">
                ফোন নম্বর (ঐচ্ছিক)
              </label>
              <input
                id="email-phone"
                type="tel"
                value={emailPhone}
                onChange={(e) => setEmailPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
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
                minLength={8}
                required
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'নিবন্ধন হচ্ছে...' : 'নিবন্ধন করুন'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
          <Link href="/auth/sign-in" className="font-medium text-brand hover:underline">
            সাইন ইন করুন
          </Link>
        </p>
      </div>
    </div>
  )
}
