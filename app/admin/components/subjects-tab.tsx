'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, X, GripVertical, Loader2 } from 'lucide-react'

interface Subject {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
  createdAt: string
}

interface SubjectsPanelProps {
  subjects: Subject[]
  onRefresh: () => void
}

export function SubjectsPanel({ subjects, onRefresh }: SubjectsPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)

  async function handleCreate() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), sortOrder: subjects.length }),
      })
      if (res.ok) {
        setName('')
        setShowForm(false)
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to create subject:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(sub: Subject) {
    setEditing(sub)
    setName(sub.name)
    setShowForm(true)
  }

  async function handleSaveEdit() {
    if (!editing || !name.trim()) return
    setSaving(true)
    try {
      await fetch(`/api/subjects/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      setName('')
      setEditing(null)
      setShowForm(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to update subject:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to toggle subject:', error)
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/subjects/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Failed to delete subject:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">
          বিষয় ব্যবস্থাপনা
        </h3>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditing(null)
            setName('')
          }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          নতুন বিষয়
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? 'বিষয় সম্পাদনা' : 'নতুন বিষয় যোগ করুন'}
            </h4>
            <button
              onClick={() => {
                setShowForm(false)
                setEditing(null)
                setName('')
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground">
                বিষয়ের নাম
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: বাংলা, ইংরেজি, পদার্থবিজ্ঞান"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    editing ? handleSaveEdit() : handleCreate()
                  }
                }}
              />
            </div>
            <button
              onClick={editing ? handleSaveEdit : handleCreate}
              disabled={saving || !name.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {editing ? 'সংরক্ষণ' : 'যোগ করুন'}
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
                  বিষয়ের নাম
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  অবস্থা
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  কার্যক্রম
                </th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="size-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(s.id, s.isActive)}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${s.isActive ? 'bg-green/10 text-green' : 'bg-secondary text-muted-foreground'}`}
                    >
                      {s.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleUpdate(s)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        সম্পাদনা
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    কোনো বিষয় নেই। উপরে &ldquo;নতুন বিষয়&rdquo; বোতামে ক্লিক
                    করুন।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
