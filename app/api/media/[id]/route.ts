import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mediaFiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/permissions'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const id = params.id
    const existing = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id)).limit(1)
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
    }

    await db.delete(mediaFiles).where(eq(mediaFiles.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete media file' }, { status: 500 })
  }
}
