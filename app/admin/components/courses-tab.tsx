'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Save, X, Loader2 } from 'lucide-react'
import type { Course } from './types'

export function CoursesPanel({
  courses,
  onRefresh,
}: {
  courses: Course[]
  onRefresh: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    slug: '',
    title: '',
    description: '',
    shortDescription: '',
    duration: '',
    fee: 0,
    discountFee: 0,
    image: '',
    maxStudents: 0,
    schedule: '',
  })

  function resetForm() {
    setForm({ slug: '', title: '', description: '', shortDescription: '', duration: '', fee: 0, discountFee: 0, image: '', maxStudents: 0, schedule: '' })
  }

  async function handleSave() {
    if (!form.title.trim() || !form.slug.trim()) return
    setSaving(true)
    try {
      const body = {
        ...form,
        fee: Number(form.fee),
        discountFee: form.discountFee ? Number(form.discountFee) : undefined,
        maxStudents: form.maxStudents ? Number(form.maxStudents) : undefined,
      }
      const url = editing ? `/api/courses/${editing.id}` : '/api/courses'
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
      }
    } catch (error) {
      console.error('Failed to save course:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('আপনি কি নিশ্চিত এই কোর্স মুছে ফেলতে চান?')) return
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  function handleEdit(course: Course) {
    setEditing(course)
    setForm({
      slug: course.slug,
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription || '',
      duration: course.duration,
      fee: course.fee,
      discountFee: course.discountFee || 0,
      image: course.image || '',
      maxStudents: course.maxStudents || 0,
      schedule: course.schedule || '',
    })
    setShowForm(true)
  }

  async function toggleActive(course: Course) {
    await fetch(`/api/courses/${course.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !course.isActive }),
    })
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">কোর্স ব্যবস্থাপনা</h3>
        <button
          onClick={() => { setShowForm(true); setEditing(null); resetForm() }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          নতুন কোর্স
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? 'কোর্স সম্পাদনা' : 'নতুন কোর্স যোগ'}
            </h4>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">কোর্সের নাম</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="যেমন: নার্সিং অ্যাডমিশন কোচিং"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">স্লাগ (URL)</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="যেমন: nursing-admission"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">সংক্ষিপ্ত বিবরণ</label>
              <input type="text" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="কোর্স সম্পর্কে সংক্ষিপ্ত"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">বিস্তারিত বিবরণ</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="কোর্সের বিস্তারিত বিবরণ"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground">সময়কাল</label>
                <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="যেমন: ১ বছর"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">ফি (৳)</label>
                <input type="number" value={form.fee || ''} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">ছাড়ের ফি (৳)</label>
                <input type="number" value={form.discountFee || ''} onChange={(e) => setForm({ ...form, discountFee: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">সর্বোচ্চ আসন</label>
                <input type="number" value={form.maxStudents || ''} onChange={(e) => setForm({ ...form, maxStudents: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">সময়সূচি</label>
                <input type="text" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="যেমন: শনি-বৃহ ৬:০০-৮:০০"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
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
                <th className="px-4 py-3 text-left font-semibold text-foreground">কোর্স</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">সময়কাল</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">ফি</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">ছাড়</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">শিক্ষার্থী</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">অবস্থা</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium text-foreground">{c.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.duration}</td>
                  <td className="px-4 py-3 text-center text-foreground">৳{c.fee.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-green">{c.discountFee ? `৳${c.discountFee.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3 text-center text-foreground">{c.currentStudents}/{c.maxStudents || '∞'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(c)} className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${c.isActive ? 'bg-green/10 text-green' : 'bg-secondary text-muted-foreground'}`}>
                      {c.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(c)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
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
