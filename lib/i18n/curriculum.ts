import { useTranslations } from 'next-intl'
import type { Locale } from '@/i18n/routing'
import {
  getCurriculumCategoryKey,
  getCurriculumCourseKey,
  getCurriculumSubjectKey,
  getSubjectLabelFallback,
  type CurriculumCategorySlug,
  type CurriculumCourseSlug,
  type CurriculumSubjectName,
} from '@/i18n/curriculum'

/**
 * Curriculum translations helper — wraps `useTranslations('curriculum')`.
 * Refactored i18n: curriculum strings live under `messages/{en,bn}.json:curriculum`
 * and are validated via `pnpm i18n:check`. This module provides type-safe
 * accessors used by courses/subjects/teachers UI and seed display.
 */

export function useCurriculumTranslations() {
  return useTranslations('curriculum')
}

type CurriculumT = ReturnType<typeof useTranslations>

export function translateSubject(t: CurriculumT, name: CurriculumSubjectName | string): string {
  try {
    // next-intl will fallback to key if missing; we catch and return raw
    return t(getCurriculumSubjectKey(name as CurriculumSubjectName))
  } catch {
    return name
  }
}

export function translateCategory(
  t: CurriculumT,
  slug: CurriculumCategorySlug | string,
): string {
  try {
    return t(getCurriculumCategoryKey(slug as CurriculumCategorySlug))
  } catch {
    return slug
  }
}

export function translateCourse(
  t: CurriculumT,
  slug: CurriculumCourseSlug | string,
  field: 'title' | 'shortDescription' | 'description' = 'title',
): string {
  try {
    return t(getCurriculumCourseKey(slug as CurriculumCourseSlug, field))
  } catch {
    return slug
  }
}

// Pure helper for non-React contexts (seed scripts, email, PDF)
export function getSubjectLabel(name: string, locale: Locale): string {
  return getSubjectLabelFallback(name, locale)
}

export function getCategoryLabel(slug: string, locale: Locale): string {
  const map: Record<string, Record<Locale, string>> = {
    isc: { en: 'ISC', bn: 'আইএসসি' },
    icon: { en: 'Icon', bn: 'আইকন' },
  }
  return map[slug]?.[locale] ?? slug
}

export const curriculumSubjectOptions = (
  locale: Locale,
): Array<{ value: CurriculumSubjectName; label: string }> => {
  const names: CurriculumSubjectName[] = [
    'Bangla',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'Higher Math',
    'ICT',
    'General Knowledge',
  ]
  return names.map((n) => ({ value: n, label: getSubjectLabel(n, locale) }))
}
