'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Pencil, Save, X, Loader2, Search, Upload, Key } from 'lucide-react'
import type { Student } from './types'

function resizeImage(file: File, maxW = 800, maxH = 800, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width: w, height: h } = img
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
    }
    img.src = url
  })
}

const inputCls = "mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
const labelCls = "block text-sm font-medium text-foreground"

type EducationField = { result: string; institution: string; year: string; roll: string; registrationNo: string; board: string; photoUrl: string }
type FormState = {
  name: string; email: string; password: string; phoneNumber: string; studentId: string; image: string
  address: string; village: string; post: string; policeStation: string; district: string
  dateOfBirth: string; guardianName: string; guardianPhone: string; institution: string
  ssc: EducationField; hsc: EducationField; honors: EducationField
}

function emptyEducation(): EducationField { return { result: '', institution: '', year: '', roll: '', registrationNo: '', board: '', photoUrl: '' } }

function emptyForm(): FormState {
  return {
    name: '', email: '', password: '', phoneNumber: '', studentId: '', image: '',
    address: '', village: '', post: '', policeStation: '', district: '',
    dateOfBirth: '', guardianName: '', guardianPhone: '', institution: '',
    ssc: emptyEducation(), hsc: emptyEducation(), honors: emptyEducation(),
  }
}

const BOARDS = ['বোর্ড নির্বাচন করুন', 'ঢাকা বোর্ড', 'রাজশাহী বোর্ড', 'চট্টগ্রাম বোর্ড', 'যশোর বোর্ড', 'বরিশাল বোর্ড', 'সিলেট বোর্ড', 'রংপুর বোর্ড', 'ময়মনসিংহ বোর্ড', 'দিনাজপুর বোর্ড', 'কুমিল্লা বোর্ড']

function EduFields({ label, value, onChange }: { label: string; value: EducationField; onChange: (v: EducationField) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const resized = await resizeImage(file)
    const formData = new FormData()
    formData.append('file', resized, 'photo.jpg')
    try {
      const res = await fetch('/api/media', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        onChange({ ...value, photoUrl: data.url })
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground">ফলাফল</label>
          <input type="text" value={value.result} onChange={(e) => onChange({ ...value, result: e.target.value })} placeholder="যেমন: GPA 5.00"
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground">প্রতিষ্ঠান</label>
          <input type="text" value={value.institution} onChange={(e) => onChange({ ...value, institution: e.target.value })} placeholder="কলেজ/বিশ্ববিদ্যালয়"
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground">সাল</label>
          <select value={value.year} onChange={(e) => onChange({ ...value, year: e.target.value })}
            className={inputCls}>
            <option value="">বছর নির্বাচন</option>
            {Array.from({ length: 27 }, (_, i) => 2026 - i).map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground">রোল নম্বর</label>
          <input type="text" value={value.roll} onChange={(e) => onChange({ ...value, roll: e.target.value })} placeholder="রোল নম্বর"
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground">রেজিস্ট্রেশন নম্বর</label>
          <input type="text" value={value.registrationNo} onChange={(e) => onChange({ ...value, registrationNo: e.target.value })} placeholder="রেজিস্ট্রেশন নম্বর"
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground">বোর্ড</label>
          <select value={value.board} onChange={(e) => onChange({ ...value, board: e.target.value })}
            className={inputCls}>
            {BOARDS.map((b, i) => <option key={b} value={i === 0 ? '' : b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors">
            <Upload className="size-3.5" /> সার্টিফিকেট ছবি আপলোড
          </button>
        </div>
        {value.photoUrl && (
          <div className="flex items-center gap-2">
            <img src={value.photoUrl} alt="" className="h-10 w-10 rounded object-cover border border-border" />
            <button type="button" onClick={() => onChange({ ...value, photoUrl: '' })} className="text-xs text-destructive hover:underline">মুছুন</button>
          </div>
        )}
      </div>
    </div>
  )
}

function StudentPhotoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const resized = await resizeImage(file, 600, 600, 0.85)
      const formData = new FormData()
      formData.append('file', resized, 'photo.jpg')
      const res = await fetch('/api/media', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        onChange(data.url)
      }
    } catch { /* ignore */ }
    finally { setUploading(false) }
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50">
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        {uploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড'}
      </button>
      <input type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="অথবা URL পেস্ট করুন" className={inputCls} />
      {value && (
        <div className="flex items-center gap-2 shrink-0">
          <img src={value} alt="" className="h-10 w-10 rounded object-cover border border-border" />
          <button type="button" onClick={() => onChange('')} className="text-xs text-destructive hover:underline">মুছুন</button>
        </div>
      )}
    </div>
  )
}

export function StudentsPanel({ students, onRefresh }: { students: Student[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [resettingStudent, setResettingStudent] = useState<Student | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSaving, setResetSaving] = useState(false)

  function handleEdit(s: Student) {
    setEditing(s)
    setForm({
      name: s.name, email: s.email, password: '',
      phoneNumber: s.phoneNumber || '', studentId: s.studentId || '', image: s.image || '',
      address: s.address || '', village: s.village || '', post: s.post || '',
      policeStation: s.policeStation || '', district: s.district || '',
      dateOfBirth: s.dateOfBirth || '', guardianName: s.guardianName || '',
      guardianPhone: s.guardianPhone || '', institution: s.institution || '',
      ssc: s.ssc || emptyEducation(), hsc: s.hsc || emptyEducation(), honors: s.honors || emptyEducation(),
    })
    setFormError('')
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return
    if (!editing && !form.password.trim()) { setFormError('পাসওয়ার্ড আবশ্যক'); return }
    setSaving(true)
    setFormError('')
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(), email: form.email.trim(),
      }
      if (!editing) body.password = form.password
      if (form.phoneNumber.trim()) body.phoneNumber = form.phoneNumber.trim()
      if (form.studentId.trim()) body.studentId = form.studentId.trim()
      if (form.image.trim()) body.image = form.image.trim()
      if (form.address.trim()) body.address = form.address.trim()
      if (form.village.trim()) body.village = form.village.trim()
      if (form.post.trim()) body.post = form.post.trim()
      if (form.policeStation.trim()) body.policeStation = form.policeStation.trim()
      if (form.district.trim()) body.district = form.district.trim()
      if (form.dateOfBirth.trim()) body.dateOfBirth = form.dateOfBirth.trim()
      if (form.guardianName.trim()) body.guardianName = form.guardianName.trim()
      if (form.guardianPhone.trim()) body.guardianPhone = form.guardianPhone.trim()
      if (form.institution.trim()) body.institution = form.institution.trim()
      if (form.ssc.result.trim() || form.ssc.roll.trim() || form.ssc.institution.trim()) body.ssc = form.ssc
      if (form.hsc.result.trim() || form.hsc.roll.trim() || form.hsc.institution.trim()) body.hsc = form.hsc
      if (form.honors.result.trim() || form.honors.roll.trim() || form.honors.institution.trim()) body.honors = form.honors

      const url = editing ? `/api/students/${editing.id}` : '/api/students'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        onRefresh()
        setShowForm(false)
        setEditing(null)
        setForm(emptyForm())
      } else {
        const err = await res.json().catch(() => ({ error: 'সংরক্ষণ ব্যর্থ' }))
        setFormError(err.details ? Object.values(err.details).flat().join(', ') : err.error || 'সংরক্ষণ ব্যর্থ')
      }
    } catch { setFormError('সংরক্ষণ ব্যর্থ') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('আপনি কি নিশ্চিত এই শিক্ষার্থী মুছে ফেলতে চান?')) return
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
    if (res.ok) onRefresh()
    else { const err = await res.json().catch(() => ({})); alert(err.error || 'মুছে ফেলা ব্যর্থ') }
  }

  async function handleResetPassword() {
    if (!resettingStudent || !newPassword.trim()) return
    setResetSaving(true)
    setResetError('')
    try {
      const res = await fetch(`/api/students/${resettingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      if (res.ok) {
        setResettingStudent(null)
        setNewPassword('')
      } else {
        const err = await res.json().catch(() => ({ error: 'পাসওয়ার্ড রিসেট ব্যর্থ' }))
        setResetError(err.error || 'পাসওয়ার্ড রিসেট ব্যর্থ')
      }
    } catch { setResetError('পাসওয়ার্ড রিসেট ব্যর্থ') }
    finally { setResetSaving(false) }
  }

  const filtered = students.filter((s) =>
    !search || [s.name, s.email, s.phoneNumber, s.studentId, s.district].some((f) => (f || '').toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">শিক্ষার্থী ব্যবস্থাপনা</h3>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm()) }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90">
          <Plus className="size-4" /> নতুন শিক্ষার্থী
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">{editing ? 'শিক্ষার্থী সম্পাদনা' : 'নতুন শিক্ষার্থী যোগ'}</h4>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
          </div>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {formError && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>}

            {/* ব্যক্তিগত তথ্য */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-1">ব্যক্তিগত তথ্য</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>নাম *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="শিক্ষার্থীর নাম" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>ইমেইল *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" className={inputCls} />
                </div>
              </div>
              {!editing && (
                <div className="mt-3">
                  <label className={labelCls}>পাসওয়ার্ড *</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="কমপক্ষে ৬ অক্ষর" className={inputCls} />
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-3 mt-3">
                <div>
                  <label className={labelCls}>ফোন নম্বর</label>
                  <input type="text" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="+8801..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>শিক্ষার্থী আইডি</label>
                  <input type="text" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="STU-001" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>জন্ম তারিখ</label>
                  <input type="text" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} placeholder="01/01/2000" className={inputCls} />
                </div>
              </div>
              <div className="mt-3">
                <label className={labelCls}>ছবি</label>
                <div className="flex items-center gap-3 mt-1">
                  <StudentPhotoUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
                </div>
              </div>
            </div>

            {/* ঠিকানা */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-1">ঠিকানা</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>গ্রাম</label>
                  <input type="text" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} placeholder="গ্রামের নাম" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>পোস্ট</label>
                  <input type="text" value={form.post} onChange={(e) => setForm({ ...form, post: e.target.value })} placeholder="পোস্ট অফিস" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>থানা</label>
                  <input type="text" value={form.policeStation} onChange={(e) => setForm({ ...form, policeStation: e.target.value })} placeholder="থানা/উপজেলা" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>জেলা</label>
                  <input type="text" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="জেলা" className={inputCls} />
                </div>
              </div>
              <div className="mt-3">
                <label className={labelCls}>পূর্ণ ঠিকানা</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="সম্পূর্ণ ঠিকানা (ঐচ্ছিক)" className={inputCls} />
              </div>
            </div>

            {/* অভিভাবক */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-1">অভিভাবক</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>অভিভাবকের নাম</label>
                  <input type="text" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} placeholder="বাবা/মা/অভিভাবক" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>অভিভাবকের ফোন</label>
                  <input type="text" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} placeholder="+8801..." className={inputCls} />
                </div>
              </div>
            </div>

            {/* শিক্ষাগত যোগ্যতা */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground border-b border-border pb-1">শিক্ষাগত যোগ্যতা</p>
              <EduFields label="S.S.C" value={form.ssc} onChange={(v) => setForm({ ...form, ssc: v })} />
              <EduFields label="H.S.C (ঐচ্ছিক)" value={form.hsc} onChange={(v) => setForm({ ...form, hsc: v })} />
              <EduFields label="অনার্স (ঐচ্ছিক)" value={form.honors} onChange={(v) => setForm({ ...form, honors: v })} />
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
        <input type="text" placeholder="নাম, ইমেইল, ফোন, আইডি বা জেলা দিয়ে খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
      </div>

      {resettingStudent && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm dark:border-blue-900 dark:bg-blue-950/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">পাসওয়ার্ড রিসেট — {resettingStudent.name}</h4>
            <button onClick={() => { setResettingStudent(null); setNewPassword(''); setResetError('') }} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
          </div>
          <div className="space-y-3">
            {resetError && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{resetError}</div>}
            <div>
              <label className={labelCls}>নতুন পাসওয়ার্ড *</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="কমপক্ষে ৬ অক্ষর" className={inputCls}
                onKeyDown={(e) => { if (e.key === 'Enter') handleResetPassword() }} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleResetPassword} disabled={resetSaving || newPassword.length < 6}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {resetSaving ? <Loader2 className="size-4 animate-spin" /> : <Key className="size-4" />}
                পাসওয়ার্ড আপডেট করুন
              </button>
              <button onClick={() => { setResettingStudent(null); setNewPassword(''); setResetError('') }}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary">বাতিল</button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">নাম</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">ইমেইল</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">ফোন</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">জেলা</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">শিক্ষার্থী আইডি</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">ভূমিকা</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  {search ? 'কোনো শিক্ষার্থী পাওয়া যায়নি' : 'এখনো কোনো শিক্ষার্থী যোগ করা হয়নি'}
                </td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      {s.image ? (
                        <img src={s.image} alt={s.name} className="size-10 rounded-full object-cover border border-border" />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-muted-foreground">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.phoneNumber || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.district || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.studentId || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.role === 'admin' ? 'bg-brand/10 text-brand' : 'bg-green/10 text-green'}`}>
                      {s.role === 'admin' ? 'অ্যাডমিন' : 'শিক্ষার্থী'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(s)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"><Pencil className="size-4" /></button>
                      <button onClick={() => { setResettingStudent(s); setNewPassword(''); setResetError('') }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-50 hover:text-blue-600" title="পাসওয়ার্ড রিসেট"><Key className="size-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
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
