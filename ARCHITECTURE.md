# Project architecture

## Runtime boundaries

- `app/` owns routes, pages, layouts, and thin route handlers.
- `components/` owns reusable UI and layout primitives.
- `lib/<feature>/` owns feature-domain rules, validation, and formatting.
- `lib/db/` owns the Drizzle schema, database client, and migrations.
- `i18n/` owns locale metadata, routing, request loading, and locale helpers.
- `messages/` owns the English reference catalog and Bengali translation catalog.
- `scripts/` owns operational checks and database utilities.
- `tests/` owns unit and contract tests; `e2e/` owns browser workflows.

## i18n workflow

English is the reference catalog. Bengali must keep the same leaf keys and interpolation variables. Run `pnpm i18n:check` after changing either catalog. Use `lib/i18n/formatters.ts` for locale-aware dates, numbers, currency, and percentages.

## Migration workflow

Migrations are append-only and live in `lib/db/migrations/`. Never rewrite an applied migration. Create a new Drizzle migration for schema corrections, review the SQL, and verify the file/journal relationship with `pnpm db:verify` before applying it.

## Quality gates

Run `pnpm i18n:check`, `pnpm db:verify`, `pnpm typecheck`, `pnpm lint`, `pnpm test -- --run`, and `pnpm build` before release.
