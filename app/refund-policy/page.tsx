'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RefundPolicyRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/bn/refund-policy')
  }, [router])
  return null
}
