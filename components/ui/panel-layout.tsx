'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = useTranslations('common')

  const activeTabData = tabs.find((t) => t.id === activeTab)

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-background transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
              {siteName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {siteName}
              </p>
              <p className="text-xs text-muted-foreground">{panelTitle}</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <div className="space-y-0.5">
            {tabs.map((t) => {
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onTabChange(t.id)
                    setSidebarOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <t.icon className="size-4 shrink-0" />
                  <span className="truncate">{t.label}</span>
                  {t.badge !== undefined && t.badge > 0 && (
                    <span className="ml-auto shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold leading-none text-muted-foreground">
                      {t.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 rounded-md bg-muted px-3 py-2">
            <p className="truncate text-sm font-medium text-foreground">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground">{welcomeMessage}</p>
          </div>
          <div className="mb-2">
            <ThemeToggle className="w-full justify-center" />
          </div>
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4" />
            {t('signOut')}
          </button>
        </div>
      </aside>

      <div className="lg:ml-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {siteName}
            </p>
          </div>
          <ThemeToggle />
          <button
            onClick={onSignOut}
            className="rounded-md p-1.5 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-5" />
          </button>
        </header>

        <div className="hidden px-6 py-3 lg:block">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              {siteName}
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-foreground">
              {activeTabData?.label}
            </span>
          </div>
        </div>

        <main className="px-4 pb-8 pt-2 lg:px-6 lg:pt-0">{children}</main>
      </div>
    </div>
  )
}
