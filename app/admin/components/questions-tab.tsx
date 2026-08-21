'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Trash2, Pencil, Save, X, Loader2 } from 'lucide-react'
import type { Exam, Question } from './types'
import { EmptyState } from '@/components/ui/empty-state'
import { FilterBar } from '@/components/ui/filter-bar'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export function QuestionsPanel({ exams }: { exams: Exam[] }) {
  const t = useTranslations('admin.questions')
  const tc = useTranslations('common')
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Question | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    question: '',
    options: ['', '', '', ''] as [string, string, string, string],
    correctIndex: 0,
  })

  const fetchQuestions = useCallback(async (examId: string) => {
    if (!examId) {
      setQuestions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/questions?examId=${examId}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.data || data)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuestions(selectedExamId)
  }, [selectedExamId, fetchQuestions])

  function handleEdit(q: Question) {
    setEditing(q)
    setForm({
      question: q.question,
      options: [...q.options] as [string, string, string, string],
      correctIndex: q.correctIndex,
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (
      !form.question.trim() ||
      form.options.some((o) => !o.trim()) ||
      !selectedExamId
    )
      return
    setSaving(true)
    try {
      if (editing) {
        await fetch(`/api/questions/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: form.question,
            options: form.options,
            correctIndex: form.correctIndex,
          }),
        })
      } else {
        await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examId: selectedExamId,
            question: form.question,
            options: form.options,
            correctIndex: form.correctIndex,
          }),
        })
      }
      setForm({ question: '', options: ['', '', '', ''], correctIndex: 0 })
      setEditing(null)
      setShowForm(false)
      fetchQuestions(selectedExamId)
    } catch (error) {
      console.error('Failed to save question:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/questions/${id}`, { method: 'DELETE' })
      fetchQuestions(selectedExamId)
    } catch (error) {
      console.error('Failed to delete question:', error)
    }
  }

  const subjectCounts = exams.reduce(
    (acc, e) => ({
      ...acc,
      [e.subject]: (acc[e.subject] || 0) + (e.questionCount || 0),
    }),
    {} as Record<string, number>,
  )
  const subjects = Object.keys(subjectCounts)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">
          {t('title')}
        </h3>
        <button
          onClick={() => {
            setShowForm(true)
            setEditing(null)
            setForm({
              question: '',
              options: ['', '', '', ''],
              correctIndex: 0,
            })
          }}
          disabled={!selectedExamId}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
        >
          <Plus className="size-4" />
          {t('addNew')}
        </button>
      </div>

      <FilterBar
        searchPlaceholder={t('searchPlaceholder')}
        filters={[
          {
            name: 'exam',
            label: t('examLabel'),
            type: 'select',
            value: selectedExamId,
            onChange: setSelectedExamId,
            options: exams.map((e) => ({
              label: `${e.title} (${e.subject}) — ${e.questionCount ?? 0} ${t('questionCount')}`,
              value: e.id,
            })),
          },
        ]}
      />

      {subjects.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {subjects.map((s) => (
            <div
              key={s}
              className="rounded-xl border border-border bg-card p-3 text-center"
            >
              <p className="text-lg font-bold text-foreground">
                {subjectCounts[s]}
              </p>
              <p className="text-xs text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && selectedExamId && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? t('editTitle') : t('addTitle')}
            </h4>
            <button
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-4">
            <FormField id="q-question" label={t('questionLabel')} required>
              <textarea
                id="q-question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                rows={2}
                placeholder={t('questionPlaceholder')}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                aria-required="true"
              />
            </FormField>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-2">
              {form.options.map((opt, i) => (
                <FormField
                  key={i}
                  id={`q-option-${i}`}
                  label={`${t('answerLabel')} ${String.fromCharCode(65 + i)} ${i === form.correctIndex ? `(${t('correctLabel')})` : ''}`}
                  required
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="correct"
                      checked={form.correctIndex === i}
                      onChange={() => setForm({ ...form, correctIndex: i })}
                      className="size-4"
                      aria-label={`${t('correctLabel')} ${String.fromCharCode(65 + i)}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {i === form.correctIndex ? t('correctLabel') : t('answerLabel')}
                    </span>
                  </div>
                  <Input
                    id={`q-option-${i}`}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...form.options] as [
                        string,
                        string,
                        string,
                        string,
                      ]
                      newOpts[i] = e.target.value
                      setForm({ ...form, options: newOpts })
                    }}
                    placeholder={`${t('answerLabel')} ${String.fromCharCode(65 + i)}`}
                    aria-required="true"
                  />
                </FormField>
              ))}
            </div>
            <Separator />
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
              {editing ? t('updateBtn') : t('saveBtn')}
            </button>
          </div>
        </div>
      )}

      {selectedExamId && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="size-6 animate-spin text-brand" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 py-3 text-center font-semibold text-foreground w-10">
                      #
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      {t('questionLabel')}
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                      {t('correctLabel')}
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => (
                    <tr
                      key={q.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                    >
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 text-foreground max-w-xs truncate">
                        {q.question}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-green/10 text-xs font-bold text-green">
                          {String.fromCharCode(65 + q.correctIndex)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(q)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {questions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center">
                        <EmptyState title={t('noQuestionsForExam')} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!selectedExamId && <EmptyState title={t('selectExamHint')} />}
    </div>
  )
}
