import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import {
  notFound,
  ok,
  badRequest,
  serverError,
  validationError,
} from '@/lib/api/response'
import { db } from '@/lib/db'
import { courses, contactInquiries, admissions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createAdmissionSchema } from '@/lib/core/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { rateLimit } from '@/lib/core/rate-limit'

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 5,
    prefix: 'admission',
  })
  if (limiter) return limiter

  try {
    const body = await request.json()
    const parsed = createAdmissionSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(
        'Invalid input',
        parsed.error.flatten().fieldErrors,
      )
    }

    const { name, phone, courseSlug, message, ssc, hsc, honors } = parsed.data

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, courseSlug))
    if (!course) return notFound('Course not found')
    if (!course.isActive) return badRequest('Course is not active')

    const reference = `ADM-${randomUUID().slice(0, 8).toUpperCase()}`

    await db.transaction(async (tx) => {
      await tx.insert(admissions).values({
        id: randomUUID(),
        reference,
        name,
        phone,
        courseId: course.id,
        message,
        ssc: ssc || null,
        hsc: hsc || null,
        honors: honors || null,
        status: 'pending',
      })

      await tx.insert(contactInquiries).values({
        id: randomUUID(),
        name,
        phone,
        message: `ভর্তি আবেদন (${reference}): ${course.title} | ${message || 'কোনো বিশেষ বার্তা নেই'}`,
      })
    })

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'admission',
          action: 'admission.submit',
          details: { name, phone, courseSlug },
        },
        null,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return ok(
      {
        success: true,
        message:
          'আপনার আবেদন গ্রহণ করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
        reference,
      },
      201,
    )
  } catch (error) {
    console.error('Error:', error)
    return serverError('Failed to submit admission')
  }
}
