import { NextRequest } from 'next/server'
import { ok, notFound, badRequest, serverError } from '@/lib/api/response'
import { db } from '@/lib/db'
import { admissions, courses } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { rateLimit } from '@/lib/core/rate-limit'

export async function GET(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 20,
    prefix: 'admissions.status',
  })
  if (limiter) return limiter

  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')?.trim()
    const phone = searchParams.get('phone')?.trim()

    if (!reference || !phone) {
      return badRequest('Reference and phone are required.')
    }

    const [application] = await db
      .select({
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
      .where(
        and(eq(admissions.reference, reference), eq(admissions.phone, phone)),
      )
      .limit(1)

    if (!application) {
      return notFound('Application not found.')
    }

    return ok({ data: application })
  } catch {
    return serverError('Failed to fetch application status')
  }
}
