const postgres = require('postgres')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

async function seedAdmin() {
  const sql = postgres(process.env.POSTGRES_URL_NON_POOLING)

  const id = crypto.randomUUID()
  const hashedPassword = await bcrypt.hash('1a2s3d4f!@#$', 12)

  await sql`
    INSERT INTO "user" (id, name, email, email_verified, phone_number, phone_number_verified, role)
    VALUES (${id}, 'Admin', 'admin@cornia.co', true, '+8801784176442', true, 'admin')
    ON CONFLICT (phone_number) DO UPDATE SET role = 'admin', email = 'admin@cornia.co', email_verified = true, phone_number_verified = true
  `

  // Get the actual user id (might be the existing one)
  const users =
    await sql`SELECT id FROM "user" WHERE phone_number = '+8801784176442'`
  const userId = users[0].id

  const accountId = crypto.randomUUID()
  await sql`
    INSERT INTO account (id, account_id, provider_id, user_id, password)
    VALUES (${accountId}, 'admin@cornia.co', 'email', ${userId}, ${hashedPassword})
    ON CONFLICT DO NOTHING
  `

  console.log('Admin seeded successfully!')
  console.log('Email: admin@cornia.co')
  console.log('Phone: +8801784176442')
  console.log('Password: 1a2s3d4f!@#$')
  await sql.end()
}

seedAdmin().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
