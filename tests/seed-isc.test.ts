import { describe, it, expect } from 'vitest'
import {
  createCourseCategorySchema,
  createSubjectSchema,
  createCourseSchema,
  createTeacherSchema,
} from '@/lib/core/validations'
import { ISC_CATEGORIES } from '@/scripts/data/isc/categories'
import { ISC_SUBJECTS } from '@/scripts/data/isc/subjects'
import { ISC_COURSES } from '@/scripts/data/isc/courses'
import { ISC_TEACHERS } from '@/scripts/data/isc/teachers'

describe('ISC curriculum seed data', () => {
  it('has deterministic counts', () => {
    expect(ISC_CATEGORIES.length).toBe(2)
    expect(ISC_SUBJECTS.length).toBe(8)
    expect(ISC_COURSES.length).toBe(3)
    expect(ISC_TEACHERS.length).toBe(6)
  })

  it('validates categories via Zod', () => {
    for (const c of ISC_CATEGORIES) {
      const r = createCourseCategorySchema.safeParse(c)
      expect(r.success, `category ${c.slug} should validate`).toBe(true)
    }
  })

  it('validates subjects via Zod and unique names', () => {
    const names = new Set<string>()
    for (const s of ISC_SUBJECTS) {
      const r = createSubjectSchema.safeParse(s)
      expect(r.success, `subject ${s.name}`).toBe(true)
      expect(names.has(s.name)).toBe(false)
      names.add(s.name)
    }
  })

  it('validates courses via Zod, discount < fee, category isc, features subset of subjects', () => {
    const subjectSet = new Set(ISC_SUBJECTS.map((s) => s.name))
    for (const c of ISC_COURSES) {
      const r = createCourseSchema.safeParse(c)
      expect(
        r.success,
        `course ${c.slug}: ${r.success ? '' : JSON.stringify((r as { error: unknown }).error)}`,
      ).toBe(true)
      expect(c.category).toBe('isc')
      if (c.discountFee) expect(c.discountFee).toBeLessThan(c.fee)
      for (const f of c.features) {
        expect(
          subjectSet.has(f),
          `feature ${f} should be a known subject`,
        ).toBe(true)
      }
    }
  })

  it('validates teachers via Zod and subject linkage', () => {
    const subjectSet = new Set(ISC_SUBJECTS.map((s) => s.name))
    for (const t of ISC_TEACHERS) {
      const r = createTeacherSchema.safeParse(t)
      expect(r.success, `teacher ${t.id}`).toBe(true)
      if (t.subject) expect(subjectSet.has(t.subject)).toBe(true)
    }
  })

  it('has stable ids/slugs (no collisions)', () => {
    const catSlugs = ISC_CATEGORIES.map((c) => c.slug)
    expect(new Set(catSlugs).size).toBe(catSlugs.length)
    const courseSlugs = ISC_COURSES.map((c) => c.slug)
    expect(new Set(courseSlugs).size).toBe(courseSlugs.length)
    const teacherIds = ISC_TEACHERS.map((t) => t.id)
    expect(new Set(teacherIds).size).toBe(teacherIds.length)
  })
})
