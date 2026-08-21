import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { validateEnv } from '@/lib/core/env'

let _db: PostgresJsDatabase<typeof schema> | null = null

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    const env = validateEnv()
    // ValidateEnv now coalesces POSTGRES_URL fallbacks and provides a dummy
    // during phase-production-build, so this will not throw during `next build`.
    // Still, guard against empty URL in edge cases.
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }
    const client = postgres(env.DATABASE_URL, { prepare: false })
    _db = drizzle(client, { schema })
  }
  return _db
}

export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_, prop) {
    return (getDb() as never)[prop as keyof PostgresJsDatabase<typeof schema>]
  },
})
