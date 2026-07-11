import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

const MIGRATION_FILES = [
  '0000_curly_trish_tilby.sql',
  '0001_windy_nomad.sql',
]

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_SEED_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const migrationsDir = join(process.cwd(), 'lib', 'db', 'migrations')
    const results: { file: string; statements: number }[] = []

    for (const fileName of MIGRATION_FILES) {
      const filePath = join(migrationsDir, fileName)
      const content = readFileSync(filePath, 'utf-8')
      const statements = content
        .split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      for (const statement of statements) {
        await db.execute(sql.raw(statement))
      }

      results.push({ file: fileName, statements: statements.length })
    }

    return NextResponse.json({ success: true, migrations: results })
  } catch (error) {
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    )
  }
}
