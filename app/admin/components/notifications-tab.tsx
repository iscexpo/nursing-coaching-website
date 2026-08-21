'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  Send,
  Loader2,
  Bell,
  CheckCheck,
  FileText,
  CalendarClock,
  Plus,
  Trash2,
  Play,
} from 'lucide-react'
import type {
  NotificationRecord,
  NotificationTemplate,
  ScheduledNotification,
} from './types'

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

  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    channel: 'in_app',
  })
  const [templateBusy, setTemplateBusy] = useState(false)

  const [scheduled, setScheduled] = useState<ScheduledNotification[]>([])
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    message: '',
    scheduledAt: '',
    targetRole: '',
  })
  const [scheduleBusy, setScheduleBusy] = useState(false)
  const [processing, setProcessing] = useState(false)

  async function loadTemplates() {
    try {
      const res = await fetch('/api/notifications/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  async function loadScheduled() {
    try {
      const res = await fetch('/api/notifications/scheduled')
      if (res.ok) {
        const data = await res.json()
        setScheduled(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load scheduled notifications:', error)
    }
  }

  useEffect(() => {
    loadTemplates()
    loadScheduled()
  }, [])

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

  async function handleCreateTemplate() {
    if (!templateForm.name.trim() || !templateForm.body.trim()) return
    setTemplateBusy(true)
    try {
      const res = await fetch('/api/notifications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateForm.name,
          subject: templateForm.subject,
          body: templateForm.body,
          channel: templateForm.channel,
        }),
      })
      if (res.ok) {
        setTemplateForm({ name: '', subject: '', body: '', channel: 'in_app' })
        await loadTemplates()
      }
    } catch (error) {
      console.error('Failed to create template:', error)
    } finally {
      setTemplateBusy(false)
    }
  }

  async function handleDeleteTemplate(id: string) {
    try {
      await fetch(`/api/notifications/templates/${id}`, { method: 'DELETE' })
      await loadTemplates()
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  async function handleSchedule() {
    if (!scheduleForm.title.trim() || !scheduleForm.message.trim()) return
    if (!scheduleForm.scheduledAt) return
    setScheduleBusy(true)
    try {
      const res = await fetch('/api/notifications/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scheduleForm.title,
          message: scheduleForm.message,
          scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
          targetRole: scheduleForm.targetRole || undefined,
        }),
      })
      if (res.ok) {
        setScheduleForm({
          title: '',
          message: '',
          scheduledAt: '',
          targetRole: '',
        })
        await loadScheduled()
      }
    } catch (error) {
      console.error('Failed to schedule notification:', error)
    } finally {
      setScheduleBusy(false)
    }
  }

  async function handleProcessNow() {
    setProcessing(true)
    try {
      await fetch('/api/notifications/scheduled/process', { method: 'POST' })
      await loadScheduled()
      onRefresh()
    } catch (error) {
      console.error('Failed to process scheduled notifications:', error)
    } finally {
      setProcessing(false)
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

  const inputClass =
    'mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'

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
                className={inputClass}
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
                className={inputClass}
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
            {t('templatesTitle')}
          </h3>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('templateNameLabel')}
              </label>
              <input
                type="text"
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, name: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('templateSubjectLabel')}
              </label>
              <input
                type="text"
                value={templateForm.subject}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, subject: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('templateBodyLabel')}
              </label>
              <textarea
                value={templateForm.body}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, body: e.target.value })
                }
                rows={2}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('templateChannelLabel')}
              </label>
              <select
                value={templateForm.channel}
                onChange={(e) =>
                  setTemplateForm({
                    ...templateForm,
                    channel: e.target.value,
                  })
                }
                className={inputClass}
              >
                <option value="in_app">{t('templateChannelInApp')}</option>
                <option value="sms">{t('templateChannelSms')}</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleCreateTemplate}
            disabled={templateBusy}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
          >
            {templateBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {t('createTemplateBtn')}
          </button>
        </div>

        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {template.name}
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      template.channel === 'sms'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-brand/10 text-brand'
                    }`}
                  >
                    {template.channel === 'sms'
                      ? t('templateChannelSms')
                      : t('templateChannelInApp')}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {template.subject}
                </p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {template.body}
                </p>
              </div>
              <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="text-muted-foreground hover:text-destructive"
                title={t('deleteTemplate')}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              {t('templatesEmpty')}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-foreground">
            {t('scheduledTitle')}
          </h3>
          <button
            onClick={handleProcessNow}
            disabled={processing}
            className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            {t('processNow')}
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('scheduleTitleLabel')}
              </label>
              <input
                type="text"
                value={scheduleForm.title}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, title: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('scheduleRoleLabel')}
              </label>
              <select
                value={scheduleForm.targetRole}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    targetRole: e.target.value,
                  })
                }
                className={inputClass}
              >
                <option value="">{t('scheduleRoleAll')}</option>
                <option value="super-admin">
                  {t('scheduleRoleSuperAdmin')}
                </option>
                <option value="admin">{t('scheduleRoleAdmin')}</option>
                <option value="teacher">{t('scheduleRoleTeacher')}</option>
                <option value="student">{t('scheduleRoleStudent')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('scheduleDateLabel')}
              </label>
              <input
                type="datetime-local"
                value={scheduleForm.scheduledAt}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    scheduledAt: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('scheduleMessageLabel')}
              </label>
              <textarea
                value={scheduleForm.message}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    message: e.target.value,
                  })
                }
                rows={2}
                className={inputClass}
              />
            </div>
          </div>
          <button
            onClick={handleSchedule}
            disabled={scheduleBusy}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
          >
            {scheduleBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CalendarClock className="size-4" />
            )}
            {t('scheduleBtn')}
          </button>
        </div>

        <div className="space-y-2">
          {scheduled.map((s) => (
            <div
              key={s.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {s.title}
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.status === 'sent'
                        ? 'bg-green/10 text-green'
                        : s.status === 'failed'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-gold/15 text-gold'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {s.message}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('scheduledAt')}:{' '}
                  {new Date(s.scheduledAt).toLocaleString('bn-BD')}
                </p>
              </div>
            </div>
          ))}
          {scheduled.length === 0 && (
            <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              {t('scheduledEmpty')}
            </p>
          )}
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
