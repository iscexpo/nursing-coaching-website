import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env' })
config({ path: '.env.local' })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const client = postgres(DATABASE_URL)

async function main() {
  // Step 1: Run migrations
  console.log('Running migrations...')
  const migrationsDir = join(process.cwd(), 'lib', 'db', 'migrations')
  const migrationFiles = ['0000_curly_trish_tilby.sql', '0001_windy_nomad.sql', '0002_add_attendance_admit_cards.sql', '0003_add_student_address_education.sql', '0004_teachers.sql']

  for (const fileName of migrationFiles) {
    const content = readFileSync(join(migrationsDir, fileName), 'utf-8')
    const statements = content
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    for (const stmt of statements) {
      try {
        await client.unsafe(stmt)
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          console.error(`  Error: ${e.message}`)
        }
      }
    }
    console.log(`  ${fileName}: ${statements.length} statements done`)
  }

  await client.end()

  // Step 2: Create admin via Better Auth API (handles password hashing correctly)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cornia.co'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!'
  const adminName = process.env.ADMIN_NAME || 'Demo Admin'
  const adminPhone = process.env.ADMIN_PHONE || '+8801784176442'

  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000'

  console.log('\nSeeding admin via API...')

  const response = await fetch(`${baseUrl}/api/admin/seed`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ADMIN_SEED_KEY || 'seed-admin-2024'}`,
      'Content-Type': 'application/json',
    },
  })

  const result = await response.json()
  console.log(result.message || result.error)

  console.log('\n--- Demo Admin Credentials ---')
  console.log(`  Email:    ${adminEmail}`)
  console.log(`  Password: ${adminPassword}`)
  console.log(`  Phone:    ${adminPhone}`)
  console.log('-------------------------------\n')
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
