'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut, Menu, X, ChevronRight } from 'lucide-react'

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

  const activeTabData = tabs.find((t) => t.id === activeTab)

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
              {siteName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{siteName}</p>
              <p className="text-xs text-brand">{panelTitle}</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav tabs */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
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
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand text-brand-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <t.icon className="size-[18px] shrink-0" />
                  <span className="truncate">{t.label}</span>
                  {t.badge !== undefined && t.badge > 0 && (
                    <span
                      className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                        isActive
                          ? 'bg-brand-foreground/20 text-brand-foreground'
                          : 'bg-gold/15 text-gold'
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-border p-3">
          <div className="mb-2 rounded-xl bg-secondary/50 px-3 py-2">
            <p className="truncate text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{welcomeMessage}</p>
          </div>
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-[18px]" />
            সাইন আউট
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{siteName}</p>
          </div>
          <button
            onClick={onSignOut}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-5" />
          </button>
        </header>

        {/* Breadcrumb */}
        <div className="hidden px-6 py-4 lg:block">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">{siteName}</Link>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-foreground">{activeTabData?.label}</span>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 pb-8 pt-2 lg:px-6 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
