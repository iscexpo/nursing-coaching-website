'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  PanelLeft,
  Search,
  Bell,
  Command,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon: React.ElementType
  badge?: number
  group?: string
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
  const [collapsed, setCollapsed] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [cmdOpen, setCmdOpen] = useState(false)
  const [query, setQuery] = useState('')
  const t = useTranslations('common')
  const tGroups = useTranslations('admin.groups')

  const activeTabData = tabs.find((t) => t.id === activeTab)
  const totalBadges = useMemo(
    () => tabs.reduce((s, tab) => s + (tab.badge ?? 0), 0),
    [tabs],
  )

  useEffect(() => {
    const v = localStorage.getItem('admin-sidebar-collapsed')
    if (v === '1') setCollapsed(true)
  }, [])
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', collapsed ? '1' : '0')
  }, [collapsed])

  // cmd+k
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen((o) => !o)
      }
      if (e.key === 'Escape') setCmdOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const filteredCmd = useMemo(() => {
    if (!query.trim()) return tabs
    const q = query.toLowerCase()
    return tabs.filter((x) => x.label.toLowerCase().includes(q) || x.id.includes(q) || (x.group ?? '').includes(q))
  }, [tabs, query])

  const groupedTabs = tabs.filter((t) => t.group)
  const ungroupedTabs = tabs.filter((t) => !t.group)
  const groups = [...new Set(groupedTabs.map((t) => t.group!))]

  const badgeTone = (badge?: number) =>
    badge && badge > 0
      ? 'bg-brand text-brand-foreground'
      : 'bg-muted text-muted-foreground'

  return (
    <div className="min-h-screen bg-muted/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Command palette */}
      {cmdOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh] p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCmdOpen(false)} />
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages… (courses, payments, students)"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <span className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Command className="size-3" />K
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCmd.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id)
                    setCmdOpen(false)
                    setQuery('')
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    activeTab === tab.id ? 'bg-brand text-brand-foreground' : 'hover:bg-muted text-foreground',
                  )}
                >
                  <tab.icon className="size-4 shrink-0" />
                  <span className="flex-1 truncate">{tab.label}</span>
                  {tab.group && <span className="text-xs opacity-60">{tab.group}</span>}
                  {tab.badge ? (
                    <span className={cn('rounded-full px-1.5 py-0.5 text-[11px] font-bold', activeTab === tab.id ? 'bg-white/20 text-white' : badgeTone(tab.badge))}>
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              ))}
              {filteredCmd.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No results for “{query}”</p>
              )}
            </div>
          </div>
        </div>
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-200 ease-out',
          collapsed ? 'w-14' : 'w-60',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={cn('flex h-14 items-center border-b border-border', collapsed ? 'justify-center px-2' : 'justify-between px-3')}>
          {!collapsed ? (
            <>
              <Link href="/" className="flex min-w-0 items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background">
                  {siteName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-none text-foreground">{siteName}</p>
                  <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{panelTitle}</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background">
              {siteName.charAt(0)}
            </div>
          )}
        </div>

        <nav className={cn('flex-1 overflow-y-auto py-3', collapsed ? 'px-1.5' : 'px-2')}>
          <div className="space-y-3">
            {/* Ungrouped - overview as featured */}
            <div className="space-y-1">
              {ungroupedTabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id)
                      setSidebarOpen(false)
                    }}
                    title={collapsed ? tab.label : undefined}
                    className={cn(
                      'flex w-full items-center rounded-lg text-sm font-medium transition-colors',
                      collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2',
                      isActive
                        ? 'bg-foreground text-background shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <tab.icon className="size-4 shrink-0" />
                    {!collapsed && <span className="flex-1 truncate text-left">{tab.label}</span>}
                    {!collapsed && tab.badge !== undefined && tab.badge > 0 && (
                      <span className={cn('ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none', isActive ? 'bg-white/20 text-white' : 'bg-brand text-brand-foreground')}>
                        {tab.badge}
                      </span>
                    )}
                    {collapsed && tab.badge !== undefined && tab.badge > 0 && (
                      <span className="absolute right-1 top-1 size-2 rounded-full bg-brand ring-2 ring-card" />
                    )}
                  </button>
                )
              })}
            </div>

            {groups.map((group) => {
              const groupTabItems = groupedTabs.filter((t) => t.group === group)
              const isCollapsed = collapsed ? true : collapsedGroups.has(group)
              const groupLabel = tGroups(group) || group

              if (collapsed) {
                return (
                  <div key={group} className="space-y-1 border-t border-border pt-3 first:border-0 first:pt-0">
                    {groupTabItems.map((tab) => {
                      const isActive = activeTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          title={`${groupLabel} — ${tab.label}`}
                          onClick={() => {
                            onTabChange(tab.id)
                            setSidebarOpen(false)
                          }}
                          className={cn(
                            'relative flex w-full items-center justify-center rounded-lg p-2.5 transition-colors',
                            isActive ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          )}
                        >
                          <tab.icon className="size-4" />
                          {tab.badge !== undefined && tab.badge > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground ring-2 ring-card">
                              {tab.badge > 9 ? '9+' : tab.badge}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              }

              return (
                <div key={group} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group)}
                    className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 transition-colors hover:text-foreground"
                  >
                    {isCollapsed ? <ChevronRight className="size-3 shrink-0" /> : <ChevronDown className="size-3 shrink-0" />}
                    <span className="truncate">{groupLabel}</span>
                    <span className="ml-auto text-[10px] font-medium tabular-nums">{groupTabItems.length}</span>
                  </button>
                  {!isCollapsed && (
                    <div className="space-y-0.5">
                      {groupTabItems.map((tab) => {
                        const isActive = activeTab === tab.id
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              onTabChange(tab.id)
                              setSidebarOpen(false)
                            }}
                            className={cn(
                              'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-muted text-foreground'
                                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                            )}
                          >
                            <span
                              className={cn(
                                'h-6 w-0.5 shrink-0 rounded-full transition-colors',
                                isActive ? 'bg-foreground' : 'bg-transparent group-hover:bg-border',
                              )}
                            />
                            <tab.icon className="size-4 shrink-0" />
                            <span className="flex-1 truncate text-left">{tab.label}</span>
                            {tab.badge !== undefined && tab.badge > 0 && (
                              <span
                                className={cn(
                                  'ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none',
                                  isActive ? 'bg-foreground text-background' : 'bg-brand text-brand-foreground',
                                )}
                              >
                                {tab.badge}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        <div className="border-t border-border p-2">
          {!collapsed ? (
            <>
              <div className="mb-2 rounded-lg border border-border bg-muted/50 p-3">
                <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">{welcomeMessage}</p>
              </div>
              <button
                onClick={onSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
                {t('signOut')}
              </button>
            </>
          ) : (
            <button
              onClick={onSignOut}
              title={t('signOut')}
              className="flex w-full items-center justify-center rounded-lg p-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </aside>

      <div className={cn('transition-all duration-200', collapsed ? 'lg:pl-14' : 'lg:pl-60')}>
        {/* Topbar - always visible */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card/80 backdrop-blur-xl px-4">
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) setCollapsed((c) => !c)
              else setSidebarOpen(true)
            }}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className="size-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-foreground">{activeTabData?.label}</h1>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {activeTab === 'overview' ? welcomeMessage : tGroups(activeTabData?.group ?? '') || panelTitle}
              </p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-1.5">
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground md:w-64 lg:w-80 justify-between"
            >
              <span className="flex items-center gap-2">
                <Search className="size-4" />
                <span>Search…</span>
              </span>
              <span className="hidden items-center gap-1 rounded bg-card border border-border px-1.5 py-0.5 text-xs font-medium lg:flex">
                <Command className="size-3" />K
              </span>
            </button>
            <button
              onClick={() => setCmdOpen(true)}
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
            >
              <Search className="size-4" />
            </button>

            <div className="ml-1 h-6 w-px bg-border hidden sm:block" />

            <button
              onClick={() => {
                const el = document.getElementById('admin-notifications-tab')
                if (el) el.scrollIntoView()
                const notifTab = tabs.find((x) => x.id === 'notifications')
                if (notifTab) onTabChange('notifications')
              }}
              className="relative flex size-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Notifications"
            >
              <Bell className="size-4" />
              {totalBadges > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground ring-2 ring-card">
                  {totalBadges > 99 ? '99+' : totalBadges}
                </span>
              )}
            </button>

            <ThemeToggle className="hidden sm:inline-flex" />

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-muted/30 pl-1 pr-2 py-1">
              <div className="flex size-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-foreground lg:block max-w-[120px] truncate">{userName}</span>
            </div>

            <button
              onClick={onSignOut}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive lg:hidden"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        {/* Breadcrumb - desktop */}
        <div className="hidden border-b border-border/60 bg-card/50 px-6 py-2.5 lg:block">
          <div className="flex items-center gap-1.5 text-sm">
            <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
              {siteName}
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
            <span className="font-medium text-foreground">{activeTabData?.label}</span>
            {activeTabData?.group && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground">{tGroups(activeTabData.group)}</span>
              </>
            )}
          </div>
        </div>

        <main className="px-4 py-4 lg:px-6 lg:py-6">{children}</main>
      </div>
    </div>
  )
}
