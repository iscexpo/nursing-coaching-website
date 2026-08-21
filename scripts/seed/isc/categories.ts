import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/lib/db/schema'
import { createCourseCategorySchema } from '@/lib/core/validations'
import { ISC_CATEGORIES } from '../../data/isc/categories'

export async function seedCategories(
  db: PostgresJsDatabase<typeof schema>,
  opts: { dryRun?: boolean } = {},
) {
  let inserted = 0
  let updated = 0

  for (const raw of ISC_CATEGORIES) {
    const parsed = createCourseCategorySchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(`Invalid category ${raw.slug}: ${parsed.error.message}`)
    }
    const data = parsed.data

    if (opts.dryRun) {
      // Dry-run: just validate
      continue
    }

    const existing = await db.query.courseCategories.findFirst({
      where: (t, { eq }) => eq(t.slug, data.slug),
    })

    await db
      .insert(schema.courseCategories)
      .values({
        id: raw.id,
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      })
      .onConflictDoUpdate({
        target: schema.courseCategories.slug,
        set: {
          name: data.name,
          description: data.description ?? null,
          sortOrder: data.sortOrder ?? 0,
          isActive: data.isActive ?? true,
          updatedAt: new Date(),
        },
      })

    if (existing) updated++
    else inserted++
  }

  return { inserted, updated, total: ISC_CATEGORIES.length }
}
