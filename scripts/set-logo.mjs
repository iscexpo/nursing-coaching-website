import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { readFile } from 'fs/promises'
import { extname } from 'path'
import { randomUUID } from 'node:crypto'
import postgres from 'postgres'
import { put } from '@vercel/blob'

const LOGO_PATH =
  process.argv[2] || '/workspaces/nursing-coaching-website/logo.jpeg'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

async function main() {
  const buffer = await readFile(LOGO_PATH)
  const ext = extname(LOGO_PATH) || '.jpeg'
  const filename = `${randomUUID()}${ext}`

  const blob = await put(`media/${filename}`, buffer, {
    access: 'public',
    contentType: 'image/jpeg',
    addRandomSuffix: false,
  })
  console.log('Uploaded logo to:', blob.url)

  const sql = postgres(DATABASE_URL)
  await sql`
    UPDATE settings
    SET cms_content = COALESCE(cms_content, '{}'::jsonb) || jsonb_build_object(
      'site',
      COALESCE(cms_content->'site', '{}'::jsonb) || jsonb_build_object('logo', ${blob.url})
    ),
    updated_at = now()
    WHERE id = 'primary'
  `
  const [row] = await sql`
    SELECT cms_content FROM settings WHERE id = 'primary'
  `
  await sql.end()

  console.log('Settings logo updated to:', row?.cms_content?.site?.logo)
}

main().catch((err) => {
  console.error('Failed to set logo:', err)
  process.exit(1)
})
