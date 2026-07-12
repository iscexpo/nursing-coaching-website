import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { hashPassword } from 'better-auth/crypto'

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
  const migrationFiles = ['0000_curly_trish_tilby.sql', '0001_windy_nomad.sql']

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

  // Step 2: Create demo admin user
  const adminEmail = 'admin@cornia.co'
  const adminPassword = 'Admin123!'
  const adminName = 'Demo Admin'
  const adminPhone = '+8801784176442'

  console.log('\nCreating admin user...')

  const existing = await client`SELECT id, role FROM "user" WHERE email = ${adminEmail}`

  let userId: string

  if (existing.length > 0) {
    userId = existing[0].id
    await client`UPDATE "user" SET role = 'admin', "phone_number" = ${adminPhone}, "phone_number_verified" = true WHERE id = ${userId}`
    console.log(`Updated existing user ${adminEmail} to admin role`)
  } else {
    userId = randomUUID()
    const hashedPw = await hashPassword(adminPassword)
    const accountId = randomUUID()
    const now = new Date()

    await client`
      INSERT INTO "user" (id, name, email, "email_verified", role, "phone_number", "phone_number_verified", created_at, updated_at)
      VALUES (${userId}, ${adminName}, ${adminEmail}, true, 'admin', ${adminPhone}, true, ${now.toISOString()}, ${now.toISOString()})
    `

    await client`
      INSERT INTO "account" (id, "account_id", "provider_id", "user_id", "password", created_at, updated_at)
      VALUES (${accountId}, ${adminEmail}, 'email', ${userId}, ${hashedPw}, ${now.toISOString()}, ${now.toISOString()})
    `

    console.log(`Created admin user: ${adminEmail}`)
  }

  console.log('\n--- Demo Admin Credentials ---')
  console.log(`  Email:    ${adminEmail}`)
  console.log(`  Password: ${adminPassword}`)
  console.log(`  Phone:    ${adminPhone}`)
  console.log('-------------------------------\n')

  await client.end()
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
