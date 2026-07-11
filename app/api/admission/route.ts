import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courses, contactInquiries } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createAdmissionSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createAdmissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, phone, courseSlug, message } = parsed.data

    const [course] = await db.select().from(courses).where(eq(courses.slug, courseSlug))
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    if (!course.isActive) return NextResponse.json({ error: 'Course is not active' }, { status: 400 })

    await db.insert(contactInquiries).values({
      id: crypto.randomUUID(),
      name,
      phone,
      message: `ভর্তি আবেদন: ${course.title} | ${message || 'কোনো বিশেষ বার্তা নেই'}`,
    })

    return NextResponse.json({
      success: true,
      message: 'আপনার আবেদন গ্রহণ করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to submit admission' }, { status: 500 })
  }
}
