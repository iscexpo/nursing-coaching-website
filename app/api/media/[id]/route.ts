import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join, resolve } from 'path'
import { db } from '@/lib/db'
import { mediaFiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/permissions'
import { buildAuditEntry, writeAudit } from '@/lib/audit'

function isPathSafe(baseDir: string, targetPath: string): boolean {
  const resolvedBase = resolve(baseDir)
  const resolvedTarget = resolve(targetPath)
  return resolvedTarget.startsWith(resolvedBase + '/') || resolvedTarget === resolvedBase
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { id } = await params
    const existing = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id)).limit(1)
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
    }

    const mediaDir = join(process.cwd(), 'public', 'media')
    const filePath = join(mediaDir, existing[0].filename)

    if (!isPathSafe(mediaDir, filePath)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    await unlink(filePath).catch(() => {})
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
        request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
      )
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete media file' }, { status: 500 })
  }
}
