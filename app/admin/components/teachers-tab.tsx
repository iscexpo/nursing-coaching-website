'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Save, X, Loader2 } from 'lucide-react'
import type { Teacher } from './types'
import { useToast } from '@/components/ui/toast'

export function TeachersPanel({
  teachers,
  onRefresh,
}: {
  teachers: Teacher[]
  onRefresh: () => void
}) {
  const { success, error, confirm } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    name: '',
    designation: '',
    subject: '',
    phone: '',
    email: '',
    bio: '',
    image: '',
  })

  function resetForm() {
    setForm({
      name: '',
      designation: '',
      subject: '',
      phone: '',
      email: '',
      bio: '',
      image: '',
    })
    setFormError('')
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    setFormError('')
    try {
      const body: Record<string, unknown> = { name: form.name.trim() }
      if (form.designation.trim()) body.designation = form.designation.trim()
      if (form.subject.trim()) body.subject = form.subject.trim()
      if (form.phone.trim()) body.phone = form.phone.trim()
      if (form.email.trim()) body.email = form.email.trim()
      if (form.bio.trim()) body.bio = form.bio.trim()
      if (form.image.trim()) body.image = form.image.trim()

      const url = editing ? `/api/teachers/${editing.id}` : '/api/teachers'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        onRefresh()
        setShowForm(false)
        setEditing(null)
        resetForm()
      } else {
        const err = await res.json().catch(() => ({ error: 'সংরক্ষণ ব্যর্থ' }))
        const msg = err.details
          ? Object.values(err.details).flat().join(', ')
          : err.error || 'সংরক্ষণ ব্যর্থ'
        setFormError(msg)
        error(msg)
      }
    } catch (saveError) {
      setFormError('সংরক্ষণ ব্যর্থ')
      error('সংরক্ষণ ব্যর্থ')
      console.error('Failed to save teacher:', saveError)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!(await confirm('আপনি কি নিশ্চিত এই শিক্ষক মুছে ফেলতে চান?'))) return
    try {
      await fetch(`/api/teachers/${id}`, { method: 'DELETE' })
      onRefresh()
      success('শিক্ষক মুছে ফেলা হয়েছে')
    } catch (deleteError) {
      console.error('Failed to delete teacher:', deleteError)
    }
  }

  function handleEdit(teacher: Teacher) {
    setEditing(teacher)
    setForm({
      name: teacher.name,
      designation: teacher.designation || '',
      subject: teacher.subject || '',
      phone: teacher.phone || '',
      email: teacher.email || '',
      bio: teacher.bio || '',
      image: teacher.image || '',
    })
    setShowForm(true)
  }

  async function toggleActive(teacher: Teacher) {
    const res = await fetch(`/api/teachers/${teacher.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !teacher.isActive }),
    })
    if (res.ok) onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">
          শিক্ষক ব্যবস্থাপনা
        </h3>
        <button
          onClick={() => {
            setShowForm(true)
            setEditing(null)
            resetForm()
          }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          নতুন শিক্ষক
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? 'শিক্ষক সম্পাদনা' : 'নতুন শিক্ষক যোগ'}
            </h4>
            <button
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-3">
            {formError && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  নাম
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="যেমন: জনাব রহমান"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  পদবি
                </label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) =>
                    setForm({ ...form, designation: e.target.value })
                  }
                  placeholder="যেমন: সিনিয়র লেকচারার"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  বিষয়
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  placeholder="যেমন: জীববিজ্ঞান"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  ফোন
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  ইমেইল
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="teacher@example.com"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  ছবি (URL)
                </label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                বিবরণ
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder="শিক্ষকের সংক্ষিপ্ত পরিচিতি"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {editing ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  নাম
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  পদবি
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  বিষয়
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  ফোন
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  অবস্থা
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.designation || '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.subject || '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.phone || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(t)}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${t.isActive ? 'bg-green/10 text-green' : 'bg-secondary text-muted-foreground'}`}
                    >
                      {t.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(t)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
