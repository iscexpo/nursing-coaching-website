import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/lib/db/schema'
import { createCourseSchema } from '@/lib/core/validations'
import { ISC_COURSES } from '../../data/isc/courses'

export async function seedCourses(
  db: PostgresJsDatabase<typeof schema>,
  opts: { dryRun?: boolean } = {},
) {
  let inserted = 0
  let updated = 0

  for (const raw of ISC_COURSES) {
    const parsed = createCourseSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(`Invalid course ${raw.slug}: ${parsed.error.message}`)
    }
    if (parsed.data.discountFee && parsed.data.discountFee >= parsed.data.fee) {
      throw new Error(`Invalid course ${raw.slug}: discountFee must be < fee`)
    }

    if (opts.dryRun) continue

    const existing = await db.query.courses.findFirst({
      where: (t, { eq }) => eq(t.slug, parsed.data.slug),
    })

    await db
      .insert(schema.courses)
      .values({
        id: raw.id,
        slug: parsed.data.slug,
        courseCode: parsed.data.courseCode ?? null,
        title: parsed.data.title,
        description: parsed.data.description,
        shortDescription: parsed.data.shortDescription ?? null,
        duration: parsed.data.duration,
        fee: parsed.data.fee,
        discountFee: parsed.data.discountFee ?? null,
        image: parsed.data.image ?? null,
        features: parsed.data.features ?? [],
        category: parsed.data.category ?? 'isc',
        maxStudents: parsed.data.maxStudents ?? null,
        schedule: parsed.data.schedule ?? null,
        isActive: raw.isActive,
      })
      .onConflictDoUpdate({
        target: schema.courses.slug,
        set: {
          courseCode: parsed.data.courseCode ?? null,
          title: parsed.data.title,
          description: parsed.data.description,
          shortDescription: parsed.data.shortDescription ?? null,
          duration: parsed.data.duration,
          fee: parsed.data.fee,
          discountFee: parsed.data.discountFee ?? null,
          image: parsed.data.image ?? null,
          features: parsed.data.features ?? [],
          category: parsed.data.category ?? 'isc',
          maxStudents: parsed.data.maxStudents ?? null,
          schedule: parsed.data.schedule ?? null,
          isActive: raw.isActive,
          updatedAt: new Date(),
        },
      })

    if (existing) updated++
    else inserted++
  }

  return { inserted, updated, total: ISC_COURSES.length }
}
