import { sql } from 'drizzle-orm'
import { db } from './index'

/**
 * Columns/tables that must exist for the app (especially authentication) to work.
 * These are derived from the migration chain (0000-0014). If any are missing the
 * running database is out of sync with `lib/db/schema.ts` and auth will fail.
 */
const REQUIRED_TABLES = [
  'user',
  'session',
  'account',
  'admissions',
  'courses',
  'enrollments',
  'media_files',
]

const REQUIRED_USER_COLUMNS = [
  'admission_id',
  'village',
  'post',
  'police_station',
  'district',
  'ssc',
  'hsc',
  'honors',
]

export type DatabaseHealth = {
  ok: boolean
  missingTables: string[]
  missingColumns: string[]
  error: string | null
}

/**
 * Non-throwing health probe. Returns a structured result that can be surfaced
 * in the admin UI (see the database-health banner) without crashing the
 * request that triggered it.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const result: DatabaseHealth = {
    ok: true,
    missingTables: [],
    missingColumns: [],
    error: null,
  }
  try {
    const tables = await db.execute<{ table_name: string }>(sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `)
    const presentTables = new Set(
      (Array.isArray(tables) ? tables : [tables]).flatMap((row) =>
        Object.values(row).map(String),
      ),
    )

    result.missingTables = REQUIRED_TABLES.filter((t) => !presentTables.has(t))

    const columns = await db.execute<{ column_name: string }>(sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user'
    `)
    const presentColumns = new Set(
      (Array.isArray(columns) ? columns : [columns]).flatMap((row) =>
        Object.values(row).map(String),
      ),
    )

    result.missingColumns = REQUIRED_USER_COLUMNS.filter(
      (c) => !presentColumns.has(c),
    )

    result.ok =
      result.missingTables.length === 0 && result.missingColumns.length === 0
  } catch (error) {
    result.ok = false
    result.error = error instanceof Error ? error.message : String(error)
  }
  return result
}

/**
 * Fail-fast health check executed at server startup. Throws if the live database
 * schema is missing tables or columns the application expects. This catches
 * migration drift (e.g. journal recorded only 0000/0001) before a request
 * surfaces a confusing 500 on the auth path.
 */
export async function assertDatabaseReady(): Promise<void> {
  try {
    const tables = await db.execute<{ table_name: string }>(sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `)
    const presentTables = new Set(
      (Array.isArray(tables) ? tables : [tables]).flatMap((row) =>
        Object.values(row).map(String),
      ),
    )

    const missingTables = REQUIRED_TABLES.filter((t) => !presentTables.has(t))
    if (missingTables.length > 0) {
      throw new Error(
        `Database schema is missing tables: ${missingTables.join(', ')}. ` +
          `Run "pnpm db:migrate" (drizzle-kit push) to sync the schema.`,
      )
    }

    const columns = await db.execute<{ column_name: string }>(sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user'
    `)
    const presentColumns = new Set(
      (Array.isArray(columns) ? columns : [columns]).flatMap((row) =>
        Object.values(row).map(String),
      ),
    )

    const missingColumns = REQUIRED_USER_COLUMNS.filter(
      (c) => !presentColumns.has(c),
    )
    if (missingColumns.length > 0) {
      throw new Error(
        `Database schema is missing columns on "user": ${missingColumns.join(
          ', ',
        )}. Run "pnpm db:migrate" (drizzle-kit push) to sync the schema.`,
      )
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Run "pnpm db:migrate"')
    ) {
      throw error
    }
    throw new Error(
      `Database readiness check failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }
}
