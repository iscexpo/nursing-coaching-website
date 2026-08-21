'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth/client'
import { useSiteData } from '@/hooks/use-site-data'
import {
  Phone,
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

type Step =
  'select-method' | 'verify-phone' | 'new-password' | 'email-sent' | 'done'
type Method = 'phone' | 'email'

export default function ForgotPasswordPage() {
  const site = useSiteData()
  const t = useTranslations('auth.forgotPassword')
  const tc = useTranslations('common')

  const [step, setStep] = useState<Step>('select-method')
  const [method, setMethod] = useState<Method>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendOtp() {
    setError('')
    setLoading(true)
    try {
      const { error: otpError } = await authClient.phoneNumber.sendOtp({
        phoneNumber,
      })
      if (otpError) {
        setError(otpError.message || t('otpSendFailed'))
        return
      }
      setStep('verify-phone')
    } catch {
      setError(t('otpSendFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code: otpCode, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t('resetFailed'))
        return
      }
      setStep('done')
    } catch {
      setError(t('resetFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailReset() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t('emailSendFailed'))
        return
      }
      setStep('email-sent')
    } catch {
      setError(t('emailSendFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleNewPasswordSubmit() {
    setError('')
    if (newPassword.length < 6) {
      setError(t('passwordTooShort'))
      return
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }
    await handleVerifyOtp()
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 items-center justify-center bg-brand lg:flex">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/classroom.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand/90 to-brand/70" />
        <div className="relative z-10 max-w-md px-8 text-brand-foreground animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <Image
              src="/logo.png"
              alt={site.nameEn}
              width={48}
              height={30}
              className="object-contain"
            />
            <span className="font-heading text-2xl font-bold">
              {site.nameBn}
            </span>
          </div>
          <h2 className="font-heading text-3xl font-extrabold leading-tight">
            {t('tagline')}
          </h2>
          <p className="mt-4 text-brand-foreground/80 leading-relaxed">
            {t('taglineDescription')}
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-background px-4 sm:px-8 lg:w-1/2">
        <div
          className="w-full max-w-md space-y-8 animate-fade-in-up"
          style={{ animationDuration: '600ms' }}
        >
          <div>
            <Link
              href="/auth/sign-in"
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              {tc('back')}
            </Link>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {t('title')}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive animate-fade-in">
              {error}
            </div>
          )}

          {step === 'select-method' && (
            <>
              <div className="flex rounded-xl border border-border bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setMethod('phone')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    method === 'phone'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Phone className="size-4" />
                  {t('phoneTab')}
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    method === 'email'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Mail className="size-4" />
                  {t('emailTab')}
                </button>
              </div>

              {method === 'phone' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendOtp()
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      {t('phoneLabel')}
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      required
                      className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        {t('sendOtp')} <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {method === 'email' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleEmailReset()
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      {t('emailLabel')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        {t('sendResetLink')} <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {step === 'verify-phone' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('otpSent', { phone: phoneNumber })}
              </p>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('otpLabel')}
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="XXXXXX"
                  maxLength={6}
                  required
                  className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground text-center text-lg tracking-widest placeholder:text-muted-foreground transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('new-password')
                }}
                disabled={!otpCode}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('verifyOtp')} <ArrowRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep('select-method')}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                {t('changePhone')}
              </button>
            </div>
          )}

          {step === 'new-password' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleNewPasswordSubmit()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('newPasswordLabel')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('confirmPasswordLabel')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    {t('resetPassword')} <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'email-sent' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand/10">
                <Mail className="size-8 text-brand" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {t('emailSentTitle')}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('emailSentDesc')}
                </p>
              </div>
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
              >
                <ArrowLeft className="size-4" />
                {t('backToSignIn')}
              </Link>
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {t('successTitle')}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('successDesc')}
                </p>
              </div>
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand/90"
              >
                {t('backToSignIn')} <ArrowRight className="size-4" />
              </Link>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {t('rememberPassword')}{' '}
            <Link
              href="/auth/sign-in"
              className="font-medium text-brand hover:underline"
            >
              {t('signInLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
