'use client'

import { useState } from 'react'
import { Plus, Trash2, Loader2, Image, FileText } from 'lucide-react'
import type { MediaFile } from './types'
import { useToast } from '@/components/ui/toast'

export function MediaPanel({
  mediaFiles,
  onRefresh,
}: {
  mediaFiles: MediaFile[]
  onRefresh: () => void
}) {
  const { success: toastSuccess, error: toastError, confirm: toastConfirm } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [altText, setAltText] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload() {
    if (!file) {
      setError('অনুগ্রহ করে একটি ফাইল নির্বাচন করুন')
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

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'ফাইল আপলোড ব্যর্থ হয়েছে')
      }

      setStatus('মিডিয়া ফাইল সফলভাবে আপলোড হয়েছে')
      setFile(null)
      setAltText('')
      setDescription('')
      onRefresh()
    } catch (uploadError) {
      console.error('Upload failed:', uploadError)
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'ফাইল আপলোড ব্যর্থ হয়েছে',
      )
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!(await toastConfirm('আপনি কি নিশ্চিত যে এই মিডিয়া ফাইল মুছতে চান?'))) return

    try {
      const response = await fetch(`/api/media/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const result = await response
          .json()
          .catch(() => ({ error: 'মুছা যায়নি' }))
        throw new Error(result.error || 'মুছা যায়নি')
      }
      onRefresh()
      toastSuccess('মিডিয়া ফাইল মুছে ফেলা হয়েছে')
    } catch (deleteError) {
      console.error('Delete failed:', deleteError)
      const msg = deleteError instanceof Error
        ? deleteError.message
        : 'মুছতে ব্যর্থ হয়েছে'
      setError(msg)
      toastError(msg)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground">
            মিডিয়া লাইব্রেরি
          </h3>
          <p className="text-sm text-muted-foreground">
            ছবি ও PDF আপলোড করুন, পরে সেগুলি সাইটে ব্যবহার করুন।
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground">
                ALT টেক্সট
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="বিকল্প টেক্সট (ঐচ্ছিক)"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                বিবরণ
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="মিডিয়া ফাইলের সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                ফাইল
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
              আপলোড নির্দেশনা
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>সমর্থিত ফাইল টাইপ: JPG, PNG, WEBP, GIF, PDF</li>
              <li>সর্বোচ্চ সাইজ: 5MB</li>
              <li>
                আপলোড করার পর ফাইলটি public/media থেকে সরাসরি অ্যাক্সেসible হবে
              </li>
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
              আপলোড করুন
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
          মিডিয়া ফাইলসমূহ
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mediaFiles.map((media) => (
            <div
              key={media.id}
              className="rounded-2xl border border-border bg-background p-4 shadow-sm"
            >
              <div className="mb-3 h-40 overflow-hidden rounded-xl bg-muted">
                {media.contentType.startsWith('image/') ? (
                  <img
                    src={media.url}
                    alt={media.altText || media.originalFilename}
                    className="h-full w-full object-cover"
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
                    দেখুন
                  </a>
                  <button
                    onClick={() => handleDelete(media.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-destructive px-3 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" /> মুছুন
                  </button>
                </div>
              </div>
            </div>
          ))}
          {mediaFiles.length === 0 && (
            <div className="col-span-full rounded-2xl border border-border bg-background p-6 text-center text-muted-foreground">
              এখনো কোনো মিডিয়া ফাইল যোগ করা হয়নি।
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
