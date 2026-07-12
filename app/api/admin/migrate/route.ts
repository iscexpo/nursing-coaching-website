import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

const MIGRATION_FILES = [
  '0000_curly_trish_tilby.sql',
  '0001_windy_nomad.sql',
  '0002_add_attendance_admit_cards.sql',
  '0003_add_student_address_education.sql',
  '0004_teachers.sql',
]

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_SEED_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const migrationsDir = join(process.cwd(), 'lib', 'db', 'migrations')
    const results: { file: string; statements: number; errors: string[] }[] = []

    for (const fileName of MIGRATION_FILES) {
      const filePath = join(migrationsDir, fileName)
      const content = readFileSync(filePath, 'utf-8')
      const statements = content
        .split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const errors: string[] = []
      for (const statement of statements) {
        try {
          await db.execute(sql.raw(statement))
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e)
          if (msg.includes('already exists') || msg.includes('does not exist') || msg.includes('column') && msg.includes('already')) {
            continue
          }
          errors.push(msg.substring(0, 100))
        }
      }

      results.push({ file: fileName, statements: statements.length, errors })
    }

    return NextResponse.json({ success: true, migrations: results })
  } catch (error) {
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    )
  }
}
