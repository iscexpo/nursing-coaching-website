import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactInquiries } from '@/lib/db/schema'
import { createContactInquirySchema, paginationSchema } from '@/lib/validations'
import { desc } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/permissions'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20 }

    const data = await db
      .select()
      .from(contactInquiries)
      .orderBy(desc(contactInquiries.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    return NextResponse.json({ data, page, limit })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 5,
    prefix: 'contact',
  })
  if (limiter) return limiter

  try {
    const body = await request.json()
    const parsed = createContactInquirySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { name, phone, message } = parsed.data

    await db.insert(contactInquiries).values({
      id: crypto.randomUUID(),
      name,
      phone,
      message,
    })

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'contact_inquiry',
          action: 'contact.submit',
          details: { name, phone },
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
          'আপনার বার্তা পাঠানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 },
    )
  }
}
