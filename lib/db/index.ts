import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { validateEnv } from '@/lib/env'

let _db: PostgresJsDatabase<typeof schema> | null = null

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    const env = validateEnv()
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
