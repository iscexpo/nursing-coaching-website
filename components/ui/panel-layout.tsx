'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon: React.ElementType
  badge?: number
}

export function PanelLayout({
  siteName,
  panelTitle,
  userName,
  welcomeMessage,
  tabs,
  activeTab,
  onTabChange,
  onSignOut,
  children,
}: {
  siteName: string
  panelTitle: string
  userName: string
  welcomeMessage?: string
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  onSignOut: () => void
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-heading text-lg font-bold text-foreground">
              {siteName}
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">|</span>
            <span className="hidden text-sm font-medium text-brand sm:inline">{panelTitle}</span>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">সাইন আউট</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-foreground">
            স্বাগতম, {userName}!
          </h2>
          {welcomeMessage && (
            <p className="mt-1 text-sm text-muted-foreground">{welcomeMessage}</p>
          )}
        </div>

        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-sm">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-brand text-brand-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <t.icon className="size-4" />
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-xs font-bold text-gold">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {children}
      </div>
    </div>
  )
}
