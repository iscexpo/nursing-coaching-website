'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { InfoRow } from '@/components/ui/info-row'
import type { UserProfile } from './types'

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

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    address: profile?.address || '',
    dateOfBirth: profile?.dateOfBirth || '',
    guardianName: profile?.guardianName || '',
    guardianPhone: profile?.guardianPhone || '',
    institution: profile?.institution || '',
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
