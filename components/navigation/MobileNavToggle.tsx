'use client'

import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

interface MobileNavToggleProps {
  onClick: () => void
  'aria-label': string
  isOpen: boolean
}

export function MobileNavToggle({ onClick, 'aria-label': ariaLabel, isOpen }: MobileNavToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="lg:hidden touch-target p-2"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
    </Button>
  )
}