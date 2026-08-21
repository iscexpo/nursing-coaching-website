import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { contactInquiries } from '@/lib/db/schema'
import { createContactInquirySchema, paginationSchema } from '@/lib/core/validations'
import { desc, count } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { rateLimit } from '@/lib/core/rate-limit'
import { ok, unauthorized, serverError, validationError } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

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

    const [totalRow] = await db
      .select({ count: count() })
      .from(contactInquiries)

    return ok({ data, page, limit, total: totalRow?.count ?? 0 })
  } catch (error) {
    console.error("Error:", error)
    return serverError('Failed to fetch inquiries')
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
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const { name, phone, message } = parsed.data

    await db.insert(contactInquiries).values({
      id: randomUUID(),
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

    return ok(
      {
        success: true,
        message:
          'আপনার বার্তা পাঠানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
      },
      201,
    )
  } catch (error) {
    console.error("Error:", error)
    return serverError('Failed to submit inquiry')
  }
}
