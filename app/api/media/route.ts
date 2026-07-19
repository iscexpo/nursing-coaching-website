import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { join, extname } from 'path'
import { z } from 'zod/v3'
import { uploadToStorage } from '@/lib/storage'
import { db } from '@/lib/db'
import { mediaFiles } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/permissions'
import { rateLimit } from '@/lib/rate-limit'
import {
  hasAllowedExtension,
  isAllowedMime,
  matchesSignature,
  validateImageDimensions,
  isValidLogoSize,
} from '@/lib/media-validation'

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 // 5MB

const metadataSchema = z.object({
  altText: z.string().max(200).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
})

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const rows = await db
      .select()
      .from(mediaFiles)
      .orderBy(desc(mediaFiles.createdAt))
    return NextResponse.json({ data: rows })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 },
    )
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

    const parsed = metadataSchema.safeParse({ altText, description })
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'File upload is required' },
        { status: 400 },
      )
    }

    if (!isAllowedMime(file.type)) {
      return NextResponse.json(
        {
          error:
            'Unsupported file type. Only PNG, JPG, WEBP, GIF or PDF are allowed.',
        },
        { status: 400 },
      )
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: 'File is too large. Maximum upload size is 5MB.' },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (!hasAllowedExtension(file.name, file.type)) {
      return NextResponse.json(
        { error: 'File extension does not match the declared type.' },
        { status: 400 },
      )
    }

    if (!matchesSignature(buffer, file.type)) {
      return NextResponse.json(
        {
          error:
            'File content does not match the declared type. Upload rejected.',
        },
        { status: 400 },
      )
    }

    // Validate image dimensions for logos (if altText indicates it's a logo)
    const isLogo = altText.toLowerCase().includes('logo') || altText.toLowerCase().includes('লোগো')
    if (isLogo && file.type.startsWith('image/')) {
      const dimensions = validateImageDimensions(buffer, file.type)
      const sizeCheck = isValidLogoSize(dimensions)
      if (!sizeCheck.valid) {
        return NextResponse.json(
          { error: sizeCheck.error || 'Invalid image dimensions for logo' },
          { status: 400 },
        )
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
      return NextResponse.json(
        {
          error:
            blobError instanceof Error
              ? blobError.message
              : 'Failed to store media file',
        },
        { status: 500 },
      )
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
        url: blobUrl,
        uploadedBy: auth.session.user.id,
      })
      .returning()

    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    console.error('Media upload failed:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to upload media file',
      },
      { status: 500 },
    )
  }
}
