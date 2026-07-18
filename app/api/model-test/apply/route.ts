import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { exams, modelTestApplicants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createModelTestApplicantSchema } from '@/lib/validations'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 5,
    prefix: 'model-test.apply',
  })
  if (limiter) return limiter

  try {
    const body = await request.json()
    const parsed = createModelTestApplicantSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { name, phone, examId, preferredSubject, message } = parsed.data

    if (examId) {
      const [exam] = await db.select().from(exams).where(eq(exams.id, examId))
      if (!exam)
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    const reference = `MT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

    const [created] = await db
      .insert(modelTestApplicants)
      .values({
        id: crypto.randomUUID(),
        reference,
        name,
        phone,
        examId: examId || null,
        preferredSubject: preferredSubject || null,
        message: message || null,
        status: 'pending',
      })
      .returning()

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'model_test_applicant',
          action: 'model_test_applicant.submit',
          details: { name, phone, examId },
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
          'আপনার মডেল টেস্টে আবেদন গ্রহণ করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
        reference,
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit model test application' },
      { status: 500 },
    )
  }
}
