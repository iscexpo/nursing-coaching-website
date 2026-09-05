import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { config } from 'dotenv'
import * as schema from '@/lib/db/schema'
import { seedIscCurriculum } from './seed/isc/index'

config({ path: '.env' })
config({ path: '.env.local' })

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const force = args.includes('--force')

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: pnpm db:seed:isc [options]

Options:
  --dry-run   Validate data without writing to DB
  --force     Bypass NODE_ENV=production guard
  --help      Show this help

Env: DATABASE_URL (required), supports .env and .env.local
`)
  process.exit(0)
}

if (process.env.NODE_ENV === 'production' && !force && !dryRun) {
  console.error('Refusing to seed in production without --force or --dry-run')
  process.exit(1)
}

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL && !dryRun) {
  console.error('DATABASE_URL not set (required unless --dry-run)')
  process.exit(1)
}

async function main() {
  const client = DATABASE_URL
    ? postgres(DATABASE_URL, { prepare: false })
    : null
  const db = client ? drizzle(client, { schema }) : ({} as never)

  console.log(`\nISC curriculum seed ${dryRun ? '(dry-run)' : ''}`)
  if (DATABASE_URL) {
    console.log(`  DATABASE_URL: ${DATABASE_URL.replace(/:[^@]+@/, ':***@')}`)
  }

  try {
    const result = await seedIscCurriculum(db as never, { dryRun })

    if (dryRun) {
      console.log('\nDry-run validation passed:')
    } else {
      console.log('\nSeed completed:')
    }

    for (const [key, stats] of Object.entries(result)) {
      console.log(
        `  ${key.padEnd(12)} total=${String(stats.total).padStart(2)}  inserted=${String(stats.inserted).padStart(2)}  updated=${String(stats.updated).padStart(2)}`,
      )
    }

    if (!dryRun) {
      console.log(
        '\nVerify: pnpm analyze-db or check Admin > Courses/Categories/Subjects/Teachers',
      )
    }
  } finally {
    if (client) await client.end({ timeout: 5 })
  }
}

main().catch((e) => {
  console.error('\nSeed failed:', e instanceof Error ? e.message : e)
  process.exit(1)
})
