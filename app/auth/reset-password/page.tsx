'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPasswordRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const path = token
      ? `/bn/auth/reset-password?token=${encodeURIComponent(token)}`
      : '/bn/auth/reset-password'
    router.replace(path)
  }, [router, token])

  return null
}
