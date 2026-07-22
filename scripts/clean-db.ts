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
  console.log('Cleaning all data...')

  await sql.unsafe(`
    TRUNCATE TABLE
      audit_logs,
      admit_cards,
      attendance,
      exam_submissions,
      questions,
      model_test_applicants,
      admissions,
      contact_inquiries,
      notifications,
      invoices,
      payments,
      student_lifecycle_events,
      enrollments,
      media_files,
      notices,
      otp,
      verification,
      account,
      session,
      "user"
    RESTART IDENTITY CASCADE
  `)

  console.log('All data cleaned. Ready to re-seed.')
  await sql.end()
}

main().catch((e) => {
  console.error('Clean failed:', e)
  process.exit(1)
})
