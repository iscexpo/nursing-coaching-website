import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courses, contactInquiries, admissions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createAdmissionSchema } from '@/lib/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { rateLimit } from '@/lib/rate-limit'

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
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { name, phone, courseSlug, message, ssc, hsc, honors } = parsed.data

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, courseSlug))
    if (!course)
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    if (!course.isActive)
      return NextResponse.json(
        { error: 'Course is not active' },
        { status: 400 },
      )

    const reference = `ADM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

    await db.transaction(async (tx) => {
      await tx.insert(admissions).values({
        id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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

    return NextResponse.json(
      {
        success: true,
        message:
          'আপনার আবেদন গ্রহণ করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
        reference,
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit admission' },
      { status: 500 },
    )
  }
}
