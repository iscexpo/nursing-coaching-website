'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Send, Loader2, Bell, CheckCheck } from 'lucide-react'
import type { NotificationRecord } from './types'

export function NotificationsPanel({
  notifications,
  onRefresh,
}: {
  notifications: NotificationRecord[]
  onRefresh: () => void
}) {
  const t = useTranslations('admin.notifications')
  const [form, setForm] = useState({ title: '', message: '', target: 'all' })
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!form.title.trim() || !form.message.trim()) return
    setSending(true)
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          type: 'info',
        }),
      })
      setForm({ title: '', message: '', target: 'all' })
      onRefresh()
    } catch (error) {
      console.error('Failed to send notification:', error)
    } finally {
      setSending(false)
    }
  }

  async function markAllRead() {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
      onRefresh()
    } catch (error) {
      console.error('Failed to mark all read:', error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-foreground">
            {t('sendNotification')}
          </h3>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('titleLabel')}
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t('titlePlaceholder')}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('bodyLabel')}
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                placeholder={t('messagePlaceholder')}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {t('sendBtn')}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-foreground">
            {t('latestNotifications')}
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                {unreadCount} {t('newCount')}
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80"
            >
              <CheckCheck className="size-3.5" />
              {t('markAllRead')}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border bg-card p-4 shadow-sm ${n.isRead ? 'border-border' : 'border-brand/30 bg-brand/5'}`}
            >
              <div className="flex items-start gap-3">
                <Bell
                  className={`mt-0.5 size-4 shrink-0 ${n.isRead ? 'text-muted-foreground' : 'text-brand'}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground">
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="size-2 rounded-full bg-brand" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              {t('noNotifications')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
