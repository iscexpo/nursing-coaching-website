# Database Setup

This repo stores schema and migrations in `lib/db/` and uses `DATABASE_URL` to connect to Postgres.

## Required environment variables

Copy the example env file and configure the database connection:

```bash
cp .env.example .env.local
```

At minimum, set:

- `DATABASE_URL` — Postgres connection string
- `BETTER_AUTH_SECRET` — secret for Better Auth
- `ADMIN_SEED_KEY` — seed auth token for migration/seed endpoints
- `ADMIN_EMAIL` — admin user email
- `ADMIN_PASSWORD` — admin user password
- `ADMIN_PHONE` — admin phone number
- `ADMIN_NAME` — admin display name

Optional values:

- `BETTER_AUTH_URL` — defaults to `http://localhost:3000`
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — for OTP/Supabase integration

## How the DB is wired

- `lib/db/index.ts` creates a Postgres client from `process.env.DATABASE_URL`
- `lib/db/schema.ts` defines the Drizzle ORM schema
- `drizzle.config.ts` points Drizzle Kit at `lib/db/schema.ts` and `lib/db/migrations`
- Migrations are stored under `lib/db/migrations`

## Run migrations locally

This repository contains a local admin migration endpoint for development.

1. Start the app:

```bash
pnpm dev
```

2. Run migrations:

```bash
curl -X POST http://localhost:3000/api/admin/migrate \
  -H "Authorization: Bearer ${ADMIN_SEED_KEY}"
```

The endpoint is intentionally disabled in production and only works when `NODE_ENV !== 'production'`.

## Seed the admin user

Use the repository seed script to create or update the demo admin account:

```bash
pnpm db:seed
```

This script:

- loads `.env` and `.env.local`
- runs the SQL migration files in order
- posts to `/api/admin/seed` using `ADMIN_SEED_KEY`
- prints the seeded admin credentials

If you prefer the underlying command, run:

```bash
node --experimental-strip-types scripts/seed-demo-admin.ts
```

## Important notes

- `ADMIN_SEED_KEY` protects the migration and seed endpoints.
- In production, both `api/admin/migrate` and `api/admin/seed` return 404.
- Migrations use SQL files split by `--> statement-breakpoint`.
- The local seed flow calls Better Auth sign-up and updates the user role to `admin`.

## Recommended setup workflow

1. Configure `.env.local`
2. Install dependencies:

```bash
pnpm approve-builds --all
pnpm install --no-frozen-lockfile
```

3. Start development:

```bash
pnpm dev
```

4. Run migrations and seed admin:

```bash
curl -X POST http://localhost:3000/api/admin/migrate -H "Authorization: Bearer ${ADMIN_SEED_KEY}"
pnpm db:seed
```
