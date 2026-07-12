import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { admissions, courses } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const limiter = rateLimit(request, { windowMs: 60_000, max: 20, prefix: 'admissions.status' })
  if (limiter) return limiter

  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')?.trim()
    const phone = searchParams.get('phone')?.trim()

    if (!reference || !phone) {
      return NextResponse.json({ error: 'Reference and phone are required.' }, { status: 400 })
    }

    const [application] = await db.select({
      id: admissions.id,
      reference: admissions.reference,
      name: admissions.name,
      phone: admissions.phone,
      message: admissions.message,
      status: admissions.status,
      courseId: admissions.courseId,
      createdAt: admissions.createdAt,
      updatedAt: admissions.updatedAt,
      courseTitle: courses.title,
    })
      .from(admissions)
      .leftJoin(courses, eq(admissions.courseId, courses.id))
      .where(and(eq(admissions.reference, reference), eq(admissions.phone, phone)))
      .limit(1)

    if (!application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
    }

    return NextResponse.json({ data: application })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch application status' }, { status: 500 })
  }
}
