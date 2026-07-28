import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mediaFiles } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category') || 'gallery'
    const rows = await db
      .select({
        id: mediaFiles.id,
        url: mediaFiles.url,
        altText: mediaFiles.altText,
        description: mediaFiles.description,
        contentType: mediaFiles.contentType,
        originalFilename: mediaFiles.originalFilename,
      })
      .from(mediaFiles)
      .where(eq(mediaFiles.category, category as 'general' | 'gallery'))
      .orderBy(desc(mediaFiles.createdAt))

    return NextResponse.json({ data: rows })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 },
    )
  }
}
