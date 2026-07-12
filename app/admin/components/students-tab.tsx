'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Save, X, Loader2, Search } from 'lucide-react'
import type { Student } from './types'

export function StudentsPanel({
  students,
  onRefresh,
}: {
  students: Student[]
  onRefresh: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    studentId: '',
    address: '',
    dateOfBirth: '',
    guardianName: '',
    guardianPhone: '',
    institution: '',
  })

  function resetForm() {
    setForm({ name: '', email: '', password: '', phoneNumber: '', studentId: '', address: '', dateOfBirth: '', guardianName: '', guardianPhone: '', institution: '' })
    setFormError('')
  }

  function handleEdit(student: Student) {
    setEditing(student)
    setForm({
      name: student.name,
      email: student.email,
      password: '',
      phoneNumber: student.phoneNumber || '',
      studentId: student.studentId || '',
      address: student.address || '',
      dateOfBirth: student.dateOfBirth || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      institution: student.institution || '',
    })
    setFormError('')
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return
    if (!editing && !form.password.trim()) {
      setFormError('পাসওয়ার্ড আবশ্যক')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        const body: Record<string, unknown> = {}
        if (form.name.trim()) body.name = form.name.trim()
        if (form.email.trim()) body.email = form.email.trim()
        if (form.phoneNumber.trim()) body.phoneNumber = form.phoneNumber.trim()
        if (form.studentId.trim()) body.studentId = form.studentId.trim()
        if (form.address.trim()) body.address = form.address.trim()
        if (form.dateOfBirth.trim()) body.dateOfBirth = form.dateOfBirth.trim()
        if (form.guardianName.trim()) body.guardianName = form.guardianName.trim()
        if (form.guardianPhone.trim()) body.guardianPhone = form.guardianPhone.trim()
        if (form.institution.trim()) body.institution = form.institution.trim()
        const res = await fetch(`/api/students/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          onRefresh()
          setShowForm(false)
          setEditing(null)
          resetForm()
        } else {
          const err = await res.json().catch(() => ({ error: 'আপডেট ব্যর্থ' }))
          setFormError(err.details ? Object.values(err.details).flat().join(', ') : err.error || 'আপডেট ব্যর্থ')
        }
      } else {
        const body: Record<string, string> = {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }
        if (form.phoneNumber.trim()) body.phoneNumber = form.phoneNumber.trim()
        if (form.studentId.trim()) body.studentId = form.studentId.trim()
        if (form.address.trim()) body.address = form.address.trim()
        if (form.dateOfBirth.trim()) body.dateOfBirth = form.dateOfBirth.trim()
        if (form.guardianName.trim()) body.guardianName = form.guardianName.trim()
        if (form.guardianPhone.trim()) body.guardianPhone = form.guardianPhone.trim()
        if (form.institution.trim()) body.institution = form.institution.trim()
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          onRefresh()
          setShowForm(false)
          setEditing(null)
          resetForm()
        } else {
          const err = await res.json().catch(() => ({ error: 'তৈরি ব্যর্থ' }))
          setFormError(err.details ? Object.values(err.details).flat().join(', ') : err.error || 'তৈরি ব্যর্থ')
        }
      }
    } catch (error) {
      setFormError('সংরক্ষণ ব্যর্থ')
      console.error('Failed to save student:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('আপনি কি নিশ্চিত এই শিক্ষার্থী মুছে ফেলতে চান?')) return
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      if (res.ok) onRefresh()
      else {
        const err = await res.json().catch(() => ({ error: 'মুছে ফেলা ব্যর্থ' }))
        alert(err.error || 'মুছে ফেলা ব্যর্থ')
      }
    } catch (error) {
      console.error('Failed to delete student:', error)
    }
  }

  const filtered = students.filter(
    (s) => !search || (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.email || '').toLowerCase().includes(search.toLowerCase()) || (s.phoneNumber || '').includes(search) || (s.studentId || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">শিক্ষার্থী ব্যবস্থাপনা</h3>
        <button
          onClick={() => { setShowForm(true); setEditing(null); resetForm() }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          নতুন শিক্ষার্থী
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? 'শিক্ষার্থী সম্পাদনা' : 'নতুন শিক্ষার্থী যোগ'}
            </h4>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-3">
            {formError && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">নাম *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="শিক্ষার্থীর নাম"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">ইমেইল *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@email.com"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            {!editing && (
              <div>
                <label className="block text-sm font-medium text-foreground">পাসওয়ার্ড *</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="কমপক্ষে ৬ অক্ষর"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">ফোন নম্বর</label>
                <input type="text" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="+8801..."
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">শিক্ষার্থী আইডি</label>
                <input type="text" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="যেমন: STU-001"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">জন্ম তারিখ</label>
                <input type="text" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} placeholder="যেমন: 01/01/2000"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">প্রতিষ্ঠান</label>
                <input type="text" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="পড়ুয়া প্রতিষ্ঠান"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">অভিভাবকের নাম</label>
                <input type="text" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} placeholder="বাবা/মা/অভিভাবক"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">অভিভাবকের ফোন</label>
                <input type="text" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} placeholder="+8801..."
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">ঠিকানা</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="সম্পূর্ণ ঠিকানা"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {editing ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="নাম, ইমেইল, ফোন বা আইডি দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">নাম</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">ইমেইল</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">ফোন</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">শিক্ষার্থী আইডি</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">প্রতিষ্ঠান</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">ভূমিকা</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    {search ? 'কোনো শিক্ষার্থী পাওয়া যায়নি' : 'এখনো কোনো শিক্ষার্থী যোগ করা হয়নি'}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50">
                    <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.phoneNumber || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.studentId || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.institution || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.role === 'admin' ? 'bg-brand/10 text-brand' : 'bg-green/10 text-green'}`}>
                        {s.role === 'admin' ? 'অ্যাডমিন' : 'শিক্ষার্থী'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(s)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                          <Pencil className="size-4" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
