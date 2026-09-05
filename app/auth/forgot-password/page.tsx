'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/bn/auth/forgot-password')
  }, [router])
  return null
}
