import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/lib/db/schema'
import { createTeacherSchema } from '@/lib/core/validations'
import { ISC_SUBJECTS } from '../../data/isc/subjects'
import { ISC_TEACHERS } from '../../data/isc/teachers'

const validSubjects = new Set(ISC_SUBJECTS.map((s) => s.name))

export async function seedTeachers(
  db: PostgresJsDatabase<typeof schema>,
  opts: { dryRun?: boolean } = {},
) {
  let inserted = 0
  let updated = 0

  for (const raw of ISC_TEACHERS) {
    if (raw.subject && !validSubjects.has(raw.subject)) {
      throw new Error(
        `Invalid teacher ${raw.id}: subject "${raw.subject}" not in ISC_SUBJECTS`,
      )
    }

    const parsed = createTeacherSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(`Invalid teacher ${raw.id}: ${parsed.error.message}`)
    }

    if (opts.dryRun) continue

    const existing = await db.query.teachers.findFirst({
      where: (t, { eq }) => eq(t.id, raw.id),
    })

    await db
      .insert(schema.teachers)
      .values({
        id: raw.id,
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        designation: parsed.data.designation || null,
        subject: parsed.data.subject || null,
        bio: parsed.data.bio || null,
        image: parsed.data.image || null,
        isActive: parsed.data.isActive ?? true,
      })
      .onConflictDoUpdate({
        target: schema.teachers.id,
        set: {
          name: parsed.data.name,
          email: parsed.data.email || null,
          phone: parsed.data.phone || null,
          designation: parsed.data.designation || null,
          subject: parsed.data.subject || null,
          bio: parsed.data.bio || null,
          image: parsed.data.image || null,
          isActive: parsed.data.isActive ?? true,
          updatedAt: new Date(),
        },
      })

    if (existing) updated++
    else inserted++
  }

  return { inserted, updated, total: ISC_TEACHERS.length }
}
