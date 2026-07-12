import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { teachers } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { requirePermission } from '@/lib/permissions'
import { createTeacherSchema } from '@/lib/validations'

export async function GET() {
  try {
    const authz = await requirePermission('teacher.manage')
    if (!authz.ok) return authz.response

    const rows = await db.select().from(teachers).orderBy(desc(teachers.createdAt))
    return NextResponse.json({ data: rows })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authz = await requirePermission('teacher.manage')
    if (!authz.ok) return authz.response

    const body = await request.json()
    const parsed = createTeacherSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const d = parsed.data
    const [teacher] = await db
      .insert(teachers)
      .values({
        id: crypto.randomUUID(),
        name: d.name,
        email: d.email || null,
        phone: d.phone || null,
        designation: d.designation || null,
        subject: d.subject || null,
        bio: d.bio || null,
        image: d.image || null,
      })
      .returning()

    return NextResponse.json(teacher, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 })
  }
}
