import { NextRequest, NextResponse } from 'next/server'
import { deleteFromStorage } from '@/lib/storage'
import { db } from '@/lib/db'
import { mediaFiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/permissions'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { id } = await params
    const existing = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, id))
      .limit(1)
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 },
      )
    }

    const mediaUrl = existing[0].url
    await deleteFromStorage(mediaUrl).catch(() => {})

    await db.delete(mediaFiles).where(eq(mediaFiles.id, id))

    void writeAudit(
      buildAuditEntry(
        {
          resourceType: 'media',
          resourceId: id,
          action: 'delete',
          details: { filename: existing[0].filename },
        },
        auth.session,
        request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined,
      ),
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete media file' },
      { status: 500 },
    )
  }
}
