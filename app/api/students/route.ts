import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq, desc, like, or, count } from 'drizzle-orm'
import { getSession, requireAdmin } from '@/lib/core/permissions'
import { createStudentSchema, paginationSchema } from '@/lib/core/validations'
import { auth } from '@/lib/auth'
import { buildAuditEntry, writeAudit } from '@/lib/audit'
import { rateLimit } from '@/lib/core/rate-limit'
import { ok, unauthorized, badRequest, conflict, serverError, validationError } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response

    const { searchParams } = new URL(request.url)
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    const { page, limit } = parsed.success
      ? parsed.data
      : { page: 1, limit: 20 }
    const search = searchParams.get('search') || ''

    const where = search
      ? or(
          like(user.name, `%${search}%`),
          like(user.email, `%${search}%`),
          like(user.phoneNumber, `%${search}%`),
          like(user.studentId, `%${search}%`),
        )
      : undefined

    const users = await db
      .select()
      .from(user)
      .where(where)
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [totalRow] = await db
      .select({ count: count() })
      .from(user)
      .where(where)

    return ok({
      data: users,
      page,
      limit,
      total: totalRow?.count ?? 0,
    })
  } catch {
    return serverError('Failed to fetch students')
  }
}

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 5,
    prefix: 'students.create',
  })
  if (limiter) return limiter

  try {
    const session = await getSession()
    const authz = await requireAdmin()
    if (!authz.ok) return authz.response
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = createStudentSchema.safeParse(body)
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    const { password, ...profileData } = parsed.data

    const existingEmail = await db
      .select()
      .from(user)
      .where(eq(user.email, parsed.data.email))
    if (existingEmail.length > 0) {
      return conflict('এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে')
    }

    const result = await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password,
      },
    })

    const userId = result.user.id

    const updateData: Record<string, unknown> = {}
    if (profileData.phoneNumber)
      updateData.phoneNumber = profileData.phoneNumber
    if (profileData.studentId) updateData.studentId = profileData.studentId
    if (profileData.image) updateData.image = profileData.image
    if (profileData.address) updateData.address = profileData.address
    if (profileData.village) updateData.village = profileData.village
    if (profileData.post) updateData.post = profileData.post
    if (profileData.policeStation)
      updateData.policeStation = profileData.policeStation
    if (profileData.district) updateData.district = profileData.district
    if (profileData.dateOfBirth)
      updateData.dateOfBirth = profileData.dateOfBirth
    if (profileData.guardianName)
      updateData.guardianName = profileData.guardianName
    if (profileData.guardianPhone)
      updateData.guardianPhone = profileData.guardianPhone
    if (profileData.institution)
      updateData.institution = profileData.institution
    if (profileData.ssc) updateData.ssc = profileData.ssc
    if (profileData.hsc) updateData.hsc = profileData.hsc
    if (profileData.honors) updateData.honors = profileData.honors

    if (Object.keys(updateData).length > 0) {
      await db.update(user).set(updateData).where(eq(user.id, userId))
    }

    const [created] = await db.select().from(user).where(eq(user.id, userId))
    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'student',
          resourceId: userId,
          action: 'student.create',
          details: {
            email: parsed.data.email,
            studentId: profileData.studentId,
          },
        },
        session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return ok(created, 201)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create student'
    if (message.includes('already') || message.includes('Unique')) {
      return conflict('এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে')
    }
    return serverError(message)
  }
}
