'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Student } from '../types'
import { useToast } from '@/components/ui/toast'
import { FilterBar } from '@/components/ui/filter-bar'
import { StudentForm } from './form'
import { ResetPasswordCard } from './reset-password'
import { StudentsTable } from './table'
import { emptyForm, emptyEducation } from './types'
import type { FormState } from './types'

export function StudentsPanel({
  students,
  onRefresh,
}: {
  students: Student[]
  onRefresh: () => void
}) {
  const t = useTranslations('admin.students')
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
  const { success, error, confirm } = useToast()

  function handleEdit(s: Student) {
    setEditing(s)
    setForm({
      name: s.name,
      email: s.email,
      password: '',
      phoneNumber: s.phoneNumber || '',
      studentId: s.studentId || '',
      image: s.image || '',
      address: s.address || '',
      village: s.village || '',
      post: s.post || '',
      policeStation: s.policeStation || '',
      district: s.district || '',
      dateOfBirth: s.dateOfBirth || '',
      guardianName: s.guardianName || '',
      guardianPhone: s.guardianPhone || '',
      institution: s.institution || '',
      ssc: s.ssc || emptyEducation(),
      hsc: s.hsc || emptyEducation(),
      honors: s.honors || emptyEducation(),
    })
    setFormError('')
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return
    if (!editing && !form.password.trim()) {
      setFormError(t('formLabels.passwordRequired'))
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
      }
      if (!editing) body.password = form.password
      if (form.phoneNumber.trim()) body.phoneNumber = form.phoneNumber.trim()
      if (form.studentId.trim()) body.studentId = form.studentId.trim()
      if (form.image.trim()) body.image = form.image.trim()
      if (form.address.trim()) body.address = form.address.trim()
      if (form.village.trim()) body.village = form.village.trim()
      if (form.post.trim()) body.post = form.post.trim()
      if (form.policeStation.trim())
        body.policeStation = form.policeStation.trim()
      if (form.district.trim()) body.district = form.district.trim()
      if (form.dateOfBirth.trim()) body.dateOfBirth = form.dateOfBirth.trim()
      if (form.guardianName.trim()) body.guardianName = form.guardianName.trim()
      if (form.guardianPhone.trim())
        body.guardianPhone = form.guardianPhone.trim()
      if (form.institution.trim()) body.institution = form.institution.trim()
      if (
        form.ssc.result.trim() ||
        form.ssc.roll.trim() ||
        form.ssc.institution.trim()
      )
        body.ssc = form.ssc
      if (
        form.hsc.result.trim() ||
        form.hsc.roll.trim() ||
        form.hsc.institution.trim()
      )
        body.hsc = form.hsc
      if (
        form.honors.result.trim() ||
        form.honors.roll.trim() ||
        form.honors.institution.trim()
      )
        body.honors = form.honors

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
        success(editing ? t('saveSuccess') : t('createSuccess'))
      } else {
        const err = await res.json().catch(() => ({ error: t('saveFailed') }))
        const msg = err.details
          ? Object.values(err.details).flat().join(', ')
          : err.error || t('saveFailed')
        setFormError(msg)
        error(msg)
      }
    } catch {
      setFormError(t('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm(t('deleteConfirm'))
    if (!ok) return
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
    if (res.ok) {
      onRefresh()
      success(t('deleteSuccess'))
    } else {
      const err = await res.json().catch(() => ({}))
      error(err.error || t('deleteFailed'))
    }
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
        const err = await res.json().catch(() => ({ error: t('resetFailed') }))
        setResetError(err.error || t('resetFailed'))
      }
    } catch {
      setResetError(t('resetFailed'))
    } finally {
      setResetSaving(false)
    }
  }

  const filtered = students
    .filter((s) => s.role === 'student')
    .filter(
      (s) =>
        !search ||
        [s.name, s.email, s.phoneNumber, s.studentId, s.district].some((f) =>
          (f || '').toLowerCase().includes(search.toLowerCase()),
        ),
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">
          {t('management')}
        </h3>
        <button
          onClick={() => {
            setShowForm(true)
            setEditing(null)
            setForm(emptyForm())
          }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" /> {t('newStudent')}
        </button>
      </div>

      {showForm && (
        <StudentForm
          editing={editing}
          form={form}
          setForm={setForm}
          formError={formError}
          saving={saving}
          handleSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
          }}
        />
      )}

      <FilterBar
        searchPlaceholder={t('searchPlaceholder')}
        searchValue={search}
        onSearchChange={setSearch}
      />

      {resettingStudent && (
        <ResetPasswordCard
          student={resettingStudent}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          resetError={resetError}
          resetSaving={resetSaving}
          handleResetPassword={handleResetPassword}
          onClose={() => {
            setResettingStudent(null)
            setNewPassword('')
            setResetError('')
          }}
        />
      )}

      <StudentsTable
        filtered={filtered}
        search={search}
        onEdit={handleEdit}
        onResetPassword={(s) => {
          setResettingStudent(s)
          setNewPassword('')
          setResetError('')
        }}
        onDelete={handleDelete}
      />
    </div>
  )
}