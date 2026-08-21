import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import {ok, serverError, validationError} from '@/lib/api/response'
import { db } from '@/lib/db'
import { teachers } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { requirePermission } from '@/lib/core/permissions'
import { createTeacherSchema } from '@/lib/core/validations'

export async function GET() {
  try {
    const authz = await requirePermission('teacher.manage')
    if (!authz.ok) return authz.response

    const rows = await db
      .select()
      .from(teachers)
      .orderBy(desc(teachers.createdAt))
    return ok({ data: rows })
  } catch (error) {
    console.error("Error:", error)
    return serverError('Failed to fetch teachers')
  }
}

export async function POST(request: NextRequest) {
  try {
    const authz = await requirePermission('teacher.manage')
    if (!authz.ok) return authz.response

    const body = await request.json()
    const parsed = createTeacherSchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const d = parsed.data
    const [teacher] = await db
      .insert(teachers)
      .values({
        id: randomUUID(),
        name: d.name,
        email: d.email || null,
        phone: d.phone || null,
        designation: d.designation || null,
        subject: d.subject || null,
        bio: d.bio || null,
        image: d.image || null,
      })
      .returning()

    return ok(teacher, 201)
  } catch (error) {
    console.error("Error:", error)
    return serverError('Failed to create teacher')
  }
}
