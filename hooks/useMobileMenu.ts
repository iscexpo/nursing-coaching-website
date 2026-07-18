'use client'

import { useState, useEffect } from 'react'

export interface UseMobileMenuReturn {
  open: boolean
  setOpen: (value: boolean) => void
  panelRef: React.RefObject<HTMLDivElement>
  triggerRef: React.RefObject<HTMLButtonElement>
}

export function useMobileMenu(): UseMobileMenuReturn {
  const [open, setOpen] = useState(false)
  const panelRef = { current: null } as React.RefObject<HTMLDivElement>
  const triggerRef = { current: null } as React.RefObject<HTMLButtonElement>

  useEffect(() => {
    const originalStyle = document.body.style.overflow
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
        return
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return { open, setOpen, panelRef, triggerRef }
}