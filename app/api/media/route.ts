import { NextRequest } from 'next/server'
import {ok, badRequest, serverError, validationError} from '@/lib/api/response'
import { randomUUID } from 'node:crypto'
import { join, extname } from 'path'
import { z } from 'zod/v3'
import { uploadToStorage } from '@/lib/media/storage'
import { db } from '@/lib/db'
import { mediaFiles } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/core/permissions'
import { rateLimit } from '@/lib/core/rate-limit'
import {
  hasAllowedExtension,
  isAllowedMime,
  matchesSignature,
  validateImageDimensions,
  isValidLogoSize,
} from '@/lib/media/validation'

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 // 5MB

const metadataSchema = z.object({
  altText: z.string().max(200).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  category: z.enum(['general', 'gallery']).optional().default('general'),
})

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const rows = await db
      .select()
      .from(mediaFiles)
      .orderBy(desc(mediaFiles.createdAt))
    return ok({ data: rows })
  } catch (error) {
    console.error('Failed to fetch media files:', error)
    return serverError('Failed to fetch media files')
  }
}

export async function POST(request: NextRequest) {
  const limiter = await rateLimit(request, {
    windowMs: 60_000,
    max: 10,
    prefix: 'media.upload',
  })
  if (limiter) return limiter

  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const formData = await request.formData()
    const file = formData.get('file')
    const altText = formData.get('altText')?.toString() || ''
    const description = formData.get('description')?.toString() || ''
    const category = (formData.get('category')?.toString() as 'general' | 'gallery') || 'general'

    const parsed = metadataSchema.safeParse({ altText, description, category })
    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.flatten().fieldErrors)
    }

    if (!(file instanceof File)) {
      return badRequest('File upload is required')
    }

    if (!isAllowedMime(file.type)) {
      return badRequest('Unsupported file type. Only PNG, JPG, WEBP, GIF or PDF are allowed.',)
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return badRequest('File is too large. Maximum upload size is 5MB.')
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (!hasAllowedExtension(file.name, file.type)) {
      return badRequest('File extension does not match the declared type.')
    }

    if (!matchesSignature(buffer, file.type)) {
      return badRequest('File content does not match the declared type. Upload rejected.',)
    }

    // Validate image dimensions for logos (if altText indicates it's a logo)
    const isLogo =
      altText.toLowerCase().includes('logo') ||
      altText.toLowerCase().includes('লোগো')
    if (isLogo && file.type.startsWith('image/')) {
      const dimensions = validateImageDimensions(buffer, file.type)
      const sizeCheck = isValidLogoSize(dimensions)
      if (!sizeCheck.valid) {
        return badRequest(sizeCheck.error || 'Invalid image dimensions for logo')
      }
    }

    const originalFilename = file.name
    const extension = extname(originalFilename) || ''
    const savedFilename = `${randomUUID()}${extension}`

    let blobUrl: string
    try {
      blobUrl = await uploadToStorage(
        `media/${savedFilename}`,
        buffer,
        file.type,
      )
    } catch (blobError) {
      console.error('Storage upload failed:', blobError)
      return serverError(blobError instanceof Error
              ? blobError.message
              : 'Failed to store media file',)
    }

    const [media] = await db
      .insert(mediaFiles)
      .values({
        id: randomUUID(),
        filename: savedFilename,
        originalFilename,
        contentType: file.type,
        size: file.size,
        altText: parsed.data.altText || null,
        description: parsed.data.description || null,
        category: parsed.data.category || 'general',
        url: blobUrl,
        uploadedBy: auth.session.user.id,
      })
      .returning()

    return ok(media, 201)
  } catch (error) {
    console.error('Media upload failed:', error)
    return serverError(error instanceof Error
            ? error.message
            : 'Failed to upload media file',)
  }
}
