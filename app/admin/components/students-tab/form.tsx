'use client'

import { useState, useRef } from 'react'
import NextImage from 'next/image'
import { useTranslations } from 'next-intl'
import { Loader2, Save, X, Upload } from 'lucide-react'
import type { Student } from '../types'
import { inputCls, labelCls } from './types'
import type { EducationField, FormState } from './types'

function resizeImage(
  file: File,
  maxW = 800,
  maxH = 800,
  quality = 0.8,
): Promise<Blob> {
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

function EduFields({
  label,
  value,
  onChange,
}: {
  label: string
  value: EducationField
  onChange: (v: EducationField) => void
}) {
  const t = useTranslations('admin.students')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const boards = [
    t('boards.select'),
    t('boards.dhaka'),
    t('boards.rajshahi'),
    t('boards.chattogram'),
    t('boards.jessore'),
    t('boards.barisal'),
    t('boards.sylhet'),
    t('boards.rangpur'),
    t('boards.mymensingh'),
    t('boards.dinajpur'),
    t('boards.comilla'),
  ]

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
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground">
            {t('formLabels.result')}
          </label>
          <input
            type="text"
            value={value.result}
            onChange={(e) => onChange({ ...value, result: e.target.value })}
            placeholder={t('formLabels.resultPlaceholder')}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground">
            {t('formLabels.institution')}
          </label>
          <input
            type="text"
            value={value.institution}
            onChange={(e) => onChange({ ...value, institution: e.target.value })}
            placeholder={t('formLabels.institutionPlaceholder')}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground">
            {t('formLabels.year')}
          </label>
          <select
            value={value.year}
            onChange={(e) => onChange({ ...value, year: e.target.value })}
            className={inputCls}
          >
            <option value="">{t('formLabels.yearSelect')}</option>
            {Array.from({ length: 27 }, (_, i) => 2026 - i).map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground">
            {t('formLabels.roll')}
          </label>
          <input
            type="text"
            value={value.roll}
            onChange={(e) => onChange({ ...value, roll: e.target.value })}
            placeholder={t('formLabels.rollPlaceholder')}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground">
            {t('formLabels.registration')}
          </label>
          <input
            type="text"
            value={value.registrationNo}
            onChange={(e) =>
              onChange({ ...value, registrationNo: e.target.value })
            }
            placeholder={t('formLabels.registrationPlaceholder')}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground">
            {t('formLabels.board')}
          </label>
          <select
            value={value.board}
            onChange={(e) => onChange({ ...value, board: e.target.value })}
            className={inputCls}
          >
            {boards.map((b, i) => (
              <option key={b} value={i === 0 ? '' : b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <Upload className="size-3.5" /> {t('formLabels.certificatePhoto')}
          </button>
        </div>
        {value.photoUrl && (
          <div className="flex items-center gap-2">
            <NextImage
              src={value.photoUrl}
              alt=""
              width={40}
              height={40}
              className="rounded object-cover border border-border"
            />
            <button
              type="button"
              onClick={() => onChange({ ...value, photoUrl: '' })}
              className="text-xs text-destructive hover:underline"
            >
              {t('formLabels.remove')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StudentPhotoUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const t = useTranslations('admin.students')
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
    } catch {
      /* ignore */
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Upload className="size-3.5" />
        )}
        {uploading ? t('formLabels.uploading') : t('formLabels.uploadPhoto')}
      </button>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('formLabels.pasteUrl')}
        className={inputCls}
      />
      {value && (
        <div className="flex items-center gap-2 shrink-0">
          <NextImage
            src={value}
            alt=""
            width={40}
            height={40}
            className="rounded object-cover border border-border"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-destructive hover:underline"
          >
            {t('formLabels.remove')}
          </button>
        </div>
      )}
    </div>
  )
}

export function StudentForm({
  editing,
  form,
  setForm,
  formError,
  saving,
  handleSave,
  onClose,
}: {
  editing: Student | null
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  formError: string
  saving: boolean
  handleSave: () => void
  onClose: () => void
}) {
  const t = useTranslations('admin.students')

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading font-semibold text-foreground">
          {editing ? t('editTitle') : t('formHeadingNew')}
        </h4>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {formError && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        )}

        {/* Personal info */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-1">
            {t('personalInfo')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{t('formLabels.name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('formLabels.namePlaceholder')}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t('formLabels.email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@email.com"
                className={inputCls}
              />
            </div>
          </div>
          {!editing && (
            <div className="mt-3">
              <label className={labelCls}>{t('formLabels.password')}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={t('formLabels.passwordPlaceholder')}
                className={inputCls}
              />
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3 mt-3">
            <div>
              <label className={labelCls}>{t('formLabels.phone')}</label>
              <input
                type="text"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                placeholder={t('formLabels.phonePlaceholder')}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t('formLabels.studentId')}</label>
              <input
                type="text"
                value={form.studentId}
                onChange={(e) =>
                  setForm({ ...form, studentId: e.target.value })
                }
                placeholder={t('formLabels.studentIdPlaceholder')}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t('formLabels.dateOfBirth')}</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm({ ...form, dateOfBirth: e.target.value })
                }
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelCls}>{t('formLabels.image')}</label>
            <div className="flex items-center gap-3 mt-1">
              <StudentPhotoUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-1">
            {t('formLabels.addressSection')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{t('formLabels.village')}</label>
              <input
                type="text"
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
                placeholder={t('formLabels.villagePlaceholder')}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t('formLabels.post')}</label>
              <input
                type="text"
                value={form.post}
                onChange={(e) => setForm({ ...form, post: e.target.value })}
                placeholder={t('formLabels.postPlaceholder')}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t('formLabels.policeStation')}</label>
              <input
                type="text"
                value={form.policeStation}
                onChange={(e) =>
                  setForm({ ...form, policeStation: e.target.value })
                }
                placeholder={t('formLabels.policeStationPlaceholder')}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t('formLabels.district')}</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                placeholder={t('formLabels.districtPlaceholder')}
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelCls}>{t('formLabels.fullAddress')}</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder={t('formLabels.fullAddressPlaceholder')}
              className={inputCls}
            />
          </div>
        </div>

        {/* Guardian */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-2 border-b border-border pb-1">
            {t('formLabels.guardianSection')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{t('formLabels.guardianName')}</label>
              <input
                type="text"
                value={form.guardianName}
                onChange={(e) =>
                  setForm({ ...form, guardianName: e.target.value })
                }
                placeholder={t('formLabels.guardianNamePlaceholder')}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t('formLabels.guardianPhone')}</label>
              <input
                type="text"
                value={form.guardianPhone}
                onChange={(e) =>
                  setForm({ ...form, guardianPhone: e.target.value })
                }
                placeholder={t('formLabels.phonePlaceholder')}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground border-b border-border pb-1">
            {t('formLabels.educationSection')}
          </p>
          <EduFields
            label={t('formLabels.ssc')}
            value={form.ssc}
            onChange={(v) => setForm({ ...form, ssc: v })}
          />
          <EduFields
            label={t('formLabels.hscOptional')}
            value={form.hsc}
            onChange={(v) => setForm({ ...form, hsc: v })}
          />
          <EduFields
            label={t('formLabels.honorsOptional')}
            value={form.honors}
            onChange={(v) => setForm({ ...form, honors: v })}
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
          {editing ? t('editTitle') : t('formHeadingNew')}
        </button>
      </div>
    </div>
  )
}