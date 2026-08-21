import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/lib/db/schema'
import { seedCategories } from './categories'
import { seedSubjects } from './subjects'
import { seedCourses } from './courses'
import { seedTeachers } from './teachers'

export interface SeedIscResult {
  categories: { inserted: number; updated: number; total: number }
  subjects: { inserted: number; updated: number; total: number }
  courses: { inserted: number; updated: number; total: number }
  teachers: { inserted: number; updated: number; total: number }
}

export async function seedIscCurriculum(
  db: PostgresJsDatabase<typeof schema>,
  opts: { dryRun?: boolean } = {},
): Promise<SeedIscResult> {
  const categories = await seedCategories(db, opts)
  const subjects = await seedSubjects(db, opts)
  const courses = await seedCourses(db, opts)
  const teachers = await seedTeachers(db, opts)

  return { categories, subjects, courses, teachers }
}
