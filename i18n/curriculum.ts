import type { Locale } from './routing'

/**
 * Curriculum i18n — isolated namespace for ISC/ISC track translations.
 * Refactored from monolithic `messages/{en,bn}.json` to dedicated `curriculum` namespace.
 * Source of truth: `messages/en.json:curriculum` and `messages/bn.json:curriculum` (validated via `pnpm i18n:check`).
 * Seed data: `scripts/data/isc/*` (categories, subjects, courses, teachers) uses these keys for display.
 */

export const curriculumCategorySlugs = ['isc', 'icon'] as const
export type CurriculumCategorySlug = (typeof curriculumCategorySlugs)[number]

export const curriculumSubjectNames = [
  'Bangla',
  'English',
  'Physics',
  'Chemistry',
  'Biology',
  'Higher Math',
  'ICT',
  'General Knowledge',
] as const
export type CurriculumSubjectName = (typeof curriculumSubjectNames)[number]

export const curriculumCourseSlugs = [
  'hsc-science-2026',
  'isc-second-timer-intensive',
  'bnmc-bridge-isc',
] as const
export type CurriculumCourseSlug = (typeof curriculumCourseSlugs)[number]

export const curriculumTeacherSubjects = [
  'Physics',
  'Chemistry',
  'Biology',
  'Higher Math',
  'English',
  'ICT',
] as const

export type CurriculumMessages = {
  categories: Record<CurriculumCategorySlug, { name: string; description: string }>
  subjects: Record<CurriculumSubjectName, string>
  courses: Record<CurriculumCourseSlug, { title: string; shortDescription: string; description: string }>
  teachers: Record<string, string>
}

export function isCurriculumCategorySlug(value: string): value is CurriculumCategorySlug {
  return (curriculumCategorySlugs as readonly string[]).includes(value)
}

export function isCurriculumSubjectName(value: string): value is CurriculumSubjectName {
  return (curriculumSubjectNames as readonly string[]).includes(value)
}

export function getCurriculumSubjectKey(name: CurriculumSubjectName) {
  return `subjects.${name}` as const
}

export function getCurriculumCategoryKey(slug: CurriculumCategorySlug) {
  return `categories.${slug}.name` as const
}

export function getCurriculumCourseKey(
  slug: CurriculumCourseSlug,
  field: 'title' | 'shortDescription' | 'description' = 'title',
) {
  return `courses.${slug}.${field}` as const
}

// Locale-aware helper for pure (non-hook) contexts
export function getSubjectLabelFallback(name: string, locale: Locale): string {
  // Fallback to raw name if translation missing (e.g., during seed)
  const fallbacks: Record<string, Record<Locale, string>> = {
    Bangla: { en: 'Bangla', bn: 'বাংলা' },
    English: { en: 'English', bn: 'ইংরেজি' },
    Physics: { en: 'Physics', bn: 'পদার্থবিজ্ঞান' },
    Chemistry: { en: 'Chemistry', bn: 'রসায়ন' },
    Biology: { en: 'Biology', bn: 'জীববিজ্ঞান' },
    'Higher Math': { en: 'Higher Math', bn: 'উচ্চতর গণিত' },
    ICT: { en: 'ICT', bn: 'তথ্য ও যোগাযোগ প্রযুক্তি' },
    'General Knowledge': { en: 'General Knowledge', bn: 'সাধারণ জ্ঞান' },
  }
  return fallbacks[name]?.[locale] ?? name
}
