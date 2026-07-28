import postgres from 'postgres'
import { config } from 'dotenv'

config({ path: '.env' })
config({ path: '.env.local' })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const sql = postgres(DATABASE_URL)

async function main() {
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `

  console.log('=== Database Analysis ===\n')
  for (const t of tables) {
    const tableName = t.table_name as string
    const [count] = await sql`SELECT COUNT(*) as cnt FROM ${sql(tableName)}`
    console.log(`  ${tableName.padEnd(35)} ${String(count.cnt).padStart(6)} rows`)
  }

  console.log('\n=== Cleanup ===')
  const [testUsers] = await sql`SELECT COUNT(*) as cnt FROM "user" WHERE email LIKE '%test%' OR email LIKE '%example%'`
  console.log(`  Test/example users: ${testUsers.cnt}`)

  const [expiredOtps] = await sql`SELECT COUNT(*) as cnt FROM otp WHERE expires_at < NOW()`
  console.log(`  Expired OTPs: ${expiredOtps.cnt}`)

  const [orphanedSessions] = await sql`
    SELECT COUNT(*) as cnt FROM session s
    LEFT JOIN "user" u ON u.id = s.user_id
    WHERE u.id IS NULL
  `
  console.log(`  Orphaned sessions: ${orphanedSessions.cnt}`)

  await sql.end()
}

main().catch((e) => {
  console.error('Analysis failed:', e.message)
  process.exit(1)
})
