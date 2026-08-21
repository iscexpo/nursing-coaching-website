import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/lib/db/schema'
import { createSubjectSchema } from '@/lib/core/validations'
import { ISC_SUBJECTS } from '../../data/isc/subjects'

export async function seedSubjects(
  db: PostgresJsDatabase<typeof schema>,
  opts: { dryRun?: boolean } = {},
) {
  let inserted = 0
  let updated = 0

  for (const raw of ISC_SUBJECTS) {
    const parsed = createSubjectSchema.safeParse({
      name: raw.name,
      sortOrder: raw.sortOrder,
      isActive: raw.isActive,
    })
    if (!parsed.success) {
      throw new Error(`Invalid subject ${raw.name}: ${parsed.error.message}`)
    }

    if (opts.dryRun) continue

    const existing = await db.query.subjects.findFirst({
      where: (t, { eq }) => eq(t.name, parsed.data.name),
    })

    await db
      .insert(schema.subjects)
      .values({
        id: raw.id,
        name: parsed.data.name,
        sortOrder: parsed.data.sortOrder ?? 0,
        isActive: parsed.data.isActive ?? true,
      })
      .onConflictDoUpdate({
        target: schema.subjects.name,
        set: {
          sortOrder: parsed.data.sortOrder ?? 0,
          isActive: parsed.data.isActive ?? true,
        },
      })

    if (existing) updated++
    else inserted++
  }

  return { inserted, updated, total: ISC_SUBJECTS.length }
}
