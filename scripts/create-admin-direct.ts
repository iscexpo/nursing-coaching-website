import postgres from 'postgres'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
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
  const email = process.env.ADMIN_EMAIL || 'admin@iscexpo.edu.bd'
  const password = process.env.ADMIN_PASSWORD || 'Sulaiman202520$'
  const phone = process.env.ADMIN_PHONE || '+8801784176442'
  const name = process.env.ADMIN_NAME || 'Admin'

  console.log(`Creating admin: ${email}`)

  const hashedPassword = await bcrypt.hash(password, 12)
  const userId = randomUUID()
  const accountId = randomUUID()

  await sql`
    INSERT INTO "user" (id, name, email, email_verified, phone_number, phone_number_verified, role)
    VALUES (${userId}, ${name}, ${email}, true, ${phone}, true, 'admin')
    ON CONFLICT (email) DO UPDATE SET role = 'admin', name = ${name}, phone_number = ${phone}, phone_number_verified = true
    RETURNING id
  `

  const [existing] = await sql`SELECT id FROM "user" WHERE email = ${email}`
  const actualUserId = existing.id

  await sql`
    INSERT INTO account (id, account_id, provider_id, user_id, password)
    VALUES (${accountId}, ${email}, 'email', ${actualUserId}, ${hashedPassword})
    ON CONFLICT DO NOTHING
  `

  console.log('Admin created successfully!')
  console.log(`  Email:    ${email}`)
  console.log(`  Password: ${password}`)
  console.log(`  Phone:    ${phone}`)
  console.log(`  User ID:  ${actualUserId}`)

  await sql.end()
}

main().catch((e) => {
  console.error('Failed:', e.message)
  process.exit(1)
})
