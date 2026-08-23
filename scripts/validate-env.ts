#!/usr/bin/env node
/**
 * Build-time environment variable validation.
 * Run before `next build` to catch missing or invalid env vars early.
 *
 * Usage: node scripts/validate-env.ts
 */
import { z } from 'zod/v3'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  ISC_AUTH_SECRET: z
    .string()
    .min(32, 'ISC_AUTH_SECRET must be at least 32 characters long'),
  ISC_AUTH_URL: z.string().optional(),
  ISC_AUTH_TRUSTED_ORIGINS: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ADMIN_SEED_KEY: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_PHONE: z.string().optional(),
  ADMIN_NAME: z.string().optional(),
})

// ISC_AUTH_SECRET falls back to the legacy BETTER_AUTH_SECRET name so
// environments provisioned before the isc-auth rename keep validating.
const parsed = envSchema.safeParse({
  ...process.env,
  ISC_AUTH_SECRET:
    process.env.ISC_AUTH_SECRET || process.env.BETTER_AUTH_SECRET,
})

if (!parsed.success) {
  console.error('\n❌ Environment validation failed:\n')
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
  }
  console.error(
    '\nCopy .env.example to .env and fill in the required values.\n',
  )
  process.exit(1)
}

console.log('✅ Environment variables validated successfully')
