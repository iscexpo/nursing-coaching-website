'use client'

import { useState } from 'react'
import NextImage from 'next/image'
import { Plus, Trash2, Loader2, Image, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { MediaFile } from './types'
import { useToast } from '@/components/ui/toast'

export function MediaPanel({
  mediaFiles,
  onRefresh,
}: {
  mediaFiles: MediaFile[]
  onRefresh: () => void
}) {
  const t = useTranslations('admin.media')
  const {
    success: toastSuccess,
    error: toastError,
    confirm: toastConfirm,
  } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [altText, setAltText] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<'general' | 'gallery'>('general')
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload() {
    if (!file) {
      setError(t('uploadFailed'))
      return
    }

    setUploading(true)
    setError(null)
    setStatus(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('altText', altText)
      formData.append('description', description)
      formData.append('category', category)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || t('uploadFailed'))
      }

      setStatus(t('uploadSuccess'))
      setFile(null)
      setAltText('')
      setDescription('')
      setCategory('general')
      onRefresh()
    } catch (uploadError) {
      console.error('Upload failed:', uploadError)
      setError(
        uploadError instanceof Error ? uploadError.message : t('uploadFailed'),
      )
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!(await toastConfirm(t('deleteConfirm')))) return

    try {
      const response = await fetch(`/api/media/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const result = await response
          .json()
          .catch(() => ({ error: t('deleteFailed') }))
        throw new Error(result.error || t('deleteFailed'))
      }
      onRefresh()
      toastSuccess(t('deleteSuccess'))
    } catch (deleteError) {
      console.error('Delete failed:', deleteError)
      const msg =
        deleteError instanceof Error ? deleteError.message : t('deleteFailed')
      setError(msg)
      toastError(msg)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground">
            {t('title')}
          </h3>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('altTextLabel')}
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder={t('altTextPlaceholder')}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('descriptionLabel')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={t('descriptionPlaceholder')}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('categoryLabel')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'general' | 'gallery')}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="general">{t('categoryGeneral')}</option>
                <option value="gallery">{t('categoryGallery')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('fileLabel')}
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-muted p-4">
            <div className="text-sm font-semibold text-foreground">
              {t('uploadInstructions')}
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t('acceptedTypes')}</li>
              <li>{t('maxSize')}</li>
              <li>{t('accessNote')}</li>
            </ul>
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {uploading ? t('uploading') : t('uploadBtn')}
            </button>
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {status && (
              <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                {status}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h4 className="font-heading mb-4 text-base font-semibold text-foreground">
          {t('filesTitle')}
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mediaFiles.map((media) => (
            <div
              key={media.id}
              className="rounded-2xl border border-border bg-background p-4 shadow-sm"
            >
              <div className="relative mb-3 h-40 overflow-hidden rounded-xl bg-muted">
                {media.contentType.startsWith('image/') ? (
                  <NextImage
                    src={media.url}
                    alt={media.altText || media.originalFilename}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <FileText className="size-10" />
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-foreground truncate">
                  {media.originalFilename}
                </div>
                <div className="text-muted-foreground">{media.contentType}</div>
                <div className="text-muted-foreground">
                  {(media.size / 1024).toFixed(1)} KB
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
                    {media.category === 'gallery' ? t('categoryGallery') : t('categoryGeneral')}
                  </span>
                  {media.altText && (
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs text-foreground">
                      ALT
                    </span>
                  )}
                  {media.description && (
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs text-foreground">
                      DESC
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 pt-3">
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand underline"
                  >
                    {t('viewLink')}
                  </a>
                  <button
                    onClick={() => handleDelete(media.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-destructive px-3 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" /> {t('deleteBtn')}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {mediaFiles.length === 0 && (
            <div className="col-span-full rounded-2xl border border-border bg-background p-6 text-center text-muted-foreground">
              {t('noMedia')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
