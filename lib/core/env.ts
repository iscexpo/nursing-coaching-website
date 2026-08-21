import { z } from 'zod/v3'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters long'),
  BETTER_AUTH_URL: z.string().optional(),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ADMIN_SEED_KEY: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_PHONE: z.string().optional(),
  ADMIN_NAME: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

let cached: Env | null = null

export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    undefined
  )
}

export function validateEnv(): Env {
  if (cached) return cached

  const buildPhase = isBuildPhase()

  // Coalesce Vercel Postgres vars into DATABASE_URL for validation.
  // Vercel often provides POSTGRES_URL but not DATABASE_URL.
  const rawEnv: Record<string, string | undefined> = {
    ...process.env,
    DATABASE_URL: getDatabaseUrl(),
    // Provide a dummy secret during build so static generation doesn't fail
    // when env vars aren't injected (Vercel build without env or local next build).
    BETTER_AUTH_SECRET:
      process.env.BETTER_AUTH_SECRET ||
      (buildPhase
        ? 'build-time-placeholder-secret-32-chars-minimum-xxxxxxxxxxxx'
        : undefined),
  }

  const parsed = envSchema.safeParse(rawEnv)
  if (!parsed.success) {
    // During `next build` we must not throw — pages like /[locale] call
    // getSystemSettings() which would otherwise log noisy stack traces
    // ("Unable to load system settings, using defaults: Invalid env...").
    // Return a placeholder Env so getDb() isn't called at build time.
    if (buildPhase) {
      const fallback: Env = {
        NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) || 'production',
        DATABASE_URL:
          rawEnv.DATABASE_URL || 'postgres://user:pass@localhost:5432/postgres',
        BETTER_AUTH_SECRET:
          rawEnv.BETTER_AUTH_SECRET ||
          'build-time-placeholder-secret-32-chars-minimum-xxxxxxxxxxxx',
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        ADMIN_SEED_KEY: process.env.ADMIN_SEED_KEY,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
        ADMIN_PHONE: process.env.ADMIN_PHONE,
        ADMIN_NAME: process.env.ADMIN_NAME,
      }
      cached = fallback
      return fallback
    }

    const issues = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid environment variables:\n${issues}`)
  }

  cached = parsed.data
  return cached
}

// Test helper — clears cached env so validateEnv re-parses process.env.
export function __clearEnvCache(): void {
  cached = null
}
