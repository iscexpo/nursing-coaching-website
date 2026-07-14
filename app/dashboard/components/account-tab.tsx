'use client'

import { useState, useRef } from 'react'
import {
  CheckCircle2,
  UserCog,
  Phone,
  Mail,
  BookOpen,
  MapPin,
  Calendar,
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  Upload,
} from 'lucide-react'
import { InfoRow } from '@/components/ui/info-row'
import type { UserProfile } from './types'

type EducationData = { result: string; institution: string; year: string; roll: string; registrationNo: string; board: string; photoUrl: string }
const BOARDS = ['বোর্ড নির্বাচন করুন', 'ঢাকা বোর্ড', 'রাজশাহী বোর্ড', 'চট্টগ্রাম বোর্ড', 'যশোর বোর্ড', 'বরিশাল বোর্ড', 'সিলেট বোর্ড', 'রংপুর বোর্ড', 'ময়মনসিংহ বোর্ড', 'দিনাজপুর বোর্ড', 'কুমিল্লা বোর্ড']
const inputCls = "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"

function EduEditSection({ label, value, onChange }: { label: string; value: EducationData; onChange: (v: EducationData) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
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
          <label className="mb-1 block text-xs font-medium text-muted-foreground">ফলাফল</label>
          <input type="text" value={value.result} onChange={(e) => onChange({ ...value, result: e.target.value })} placeholder="যেমন: GPA 5.00" className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">প্রতিষ্ঠান</label>
          <input type="text" value={value.institution} onChange={(e) => onChange({ ...value, institution: e.target.value })} placeholder="কলেজ/বিশ্ববিদ্যালয়" className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">সাল</label>
          <input type="text" value={value.year} onChange={(e) => onChange({ ...value, year: e.target.value })} placeholder="যেমন: 2020" className={inputCls} />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">রোল নম্বর</label>
          <input type="text" value={value.roll} onChange={(e) => onChange({ ...value, roll: e.target.value })} placeholder="রোল নম্বর" className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">রেজিস্ট্রেশন নম্বর</label>
          <input type="text" value={value.registrationNo} onChange={(e) => onChange({ ...value, registrationNo: e.target.value })} placeholder="রেজিস্ট্রেশন নম্বর" className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">বোর্ড</label>
          <select value={value.board} onChange={(e) => onChange({ ...value, board: e.target.value })} className={inputCls}>
            {BOARDS.map((b, i) => <option key={b} value={i === 0 ? '' : b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors">
          <Upload className="size-3.5" /> সার্টিফিকেট ছবি আপলোড
        </button>
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

function EduViewSection({ label, value }: { label: string; value: EducationData | null }) {
  if (!value) return null
  const fields = [
    { label: 'ফলাফল', val: value.result },
    { label: 'প্রতিষ্ঠান', val: value.institution },
    { label: 'সাল', val: value.year },
    { label: 'রোল', val: value.roll },
    { label: 'রেজিস্ট্রেশন', val: value.registrationNo },
    { label: 'বোর্ড', val: value.board },
  ].filter(f => f.val)
  if (fields.length === 0 && !value.photoUrl) return null
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="grid gap-1 sm:grid-cols-3">
        {fields.map(f => (
          <div key={f.label} className="text-xs">
            <span className="text-muted-foreground">{f.label}: </span>
            <span className="font-medium text-foreground">{f.val}</span>
          </div>
        ))}
      </div>
      {value.photoUrl && (
        <img src={value.photoUrl} alt={`${label} সার্টিফিকেট`} className="h-16 w-16 rounded object-cover border border-border" />
      )}
    </div>
  )
}

export function AccountSection({
  profile,
  onRefresh,
}: {
  profile: UserProfile | null
  onRefresh: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [success, setSuccess] = useState('')

  const defaultEdu = { result: '', institution: '', year: '', roll: '', registrationNo: '', board: '', photoUrl: '' }

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    address: profile?.address || '',
    dateOfBirth: profile?.dateOfBirth || '',
    guardianName: profile?.guardianName || '',
    guardianPhone: profile?.guardianPhone || '',
    institution: profile?.institution || '',
    ssc: profile?.ssc || defaultEdu,
    hsc: profile?.hsc || defaultEdu,
    honors: profile?.honors || defaultEdu,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  async function handleSaveProfile() {
    setSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setEditing(false)
        setSuccess('প্রোফাইল আপডেট হয়েছে!')
        onRefresh()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('নতুন পাসওয়ার্ড মিলেনি!')
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে!')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      if (res.ok) {
        setChangingPassword(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setSuccess('পাসওয়ার্ড পরিবর্তন হয়েছে!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        alert('বর্তমান পাসওয়ার্ড ভুল!')
      }
    } catch (error) {
      console.error('Failed to change password:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="rounded-xl border border-green/30 bg-green/5 p-4 text-sm text-green flex items-center gap-2">
          <CheckCircle2 className="size-5" />
          {success}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-base font-bold text-foreground">প্রোফাইল তথ্য</h3>
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm font-medium text-brand hover:text-brand/80"
          >
            {editing ? 'বাতিল' : 'সম্পাদনা'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">নাম</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">ইমেইল</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">ঠিকানা</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">জন্ম তারিখ</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">প্রতিষ্ঠান</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">অভিভাবকের নাম</label>
                <input
                  type="text"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">অভিভাবকের ফোন</label>
                <input
                  type="tel"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground border-b border-border pb-1">শিক্ষাগত যোগ্যতা</p>
              <EduEditSection label="S.S.C" value={formData.ssc} onChange={(v) => setFormData({ ...formData, ssc: v })} />
              <EduEditSection label="H.S.C (ঐচ্ছিক)" value={formData.hsc} onChange={(v) => setFormData({ ...formData, hsc: v })} />
              <EduEditSection label="অনার্স (ঐচ্ছিক)" value={formData.honors} onChange={(v) => setFormData({ ...formData, honors: v })} />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="mx-auto size-5 animate-spin" /> : 'সংরক্ষণ করুন'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <InfoRow icon={UserCog} label="নাম" value={profile?.name || '—'} />
            <InfoRow icon={Phone} label="ফোন" value={profile?.phoneNumber || '—'} />
            <InfoRow icon={Mail} label="ইমেইল" value={profile?.email || '—'} />
            <InfoRow icon={BookOpen} label="শিক্ষার্থী ID" value={profile?.studentId || '—'} />
            <InfoRow icon={MapPin} label="ঠিকানা" value={profile?.address || '—'} />
            <InfoRow icon={Calendar} label="জন্ম তারিখ" value={profile?.dateOfBirth || '—'} />
            <InfoRow icon={GraduationCap} label="প্রতিষ্ঠান" value={profile?.institution || '—'} />
            <InfoRow icon={UserCog} label="অভিভাবক" value={profile?.guardianName || '—'} />
            <InfoRow icon={Phone} label="অভিভাবকের ফোন" value={profile?.guardianPhone || '—'} />
          </div>
        )}

        {(!editing && (profile?.ssc || profile?.hsc || profile?.honors)) && (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5"><GraduationCap className="size-4" /> শিক্ষাগত যোগ্যতা</p>
            <EduViewSection label="S.S.C" value={profile?.ssc || null} />
            <EduViewSection label="H.S.C" value={profile?.hsc || null} />
            <EduViewSection label="অনার্স" value={profile?.honors || null} />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-base font-bold text-foreground">পাসওয়ার্ড পরিবর্তন</h3>
          <button
            onClick={() => setChangingPassword(!changingPassword)}
            className="text-sm font-medium text-brand hover:text-brand/80"
          >
            {changingPassword ? 'বাতিল' : 'পরিবর্তন'}
          </button>
        </div>

        {changingPassword ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">বর্তমান পাসওয়ার্ড</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 pr-10 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">নতুন পাসওয়ার্ড</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 pr-10 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">পাসওয়ার্ড নিশ্চিত করুন</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-xs text-destructive">পাসওয়ার্ড মিলেনি</p>
            )}
            <button
              onClick={handleChangePassword}
              disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="mx-auto size-5 animate-spin" /> : 'পাসওয়ার্ড আপডেট করুন'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">পাসওয়ার্ড পরিবর্তন করতে উপরের বোতামে ক্লিক করুন।</p>
        )}
      </div>
    </div>
  )
}
