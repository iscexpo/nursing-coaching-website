# Refactoring Plan — Replace ISC Auth with Better Auth (Final Cleanup)

> Status: **Implemented** (2026-08-23) · Scope: repo root cleanup + Better Auth hardening
> Verified against working tree on 2026-08-23

## Implementation log

### 2026-08-23 (later same day): Better Auth replaced by in-house `isc-auth`

Per product decision, Better Auth was removed entirely and replaced by a
self-written `lib/isc-auth/` module reusing the existing Drizzle tables
(`user`, `session`, `account`, `verification`) — zero schema changes.

| Layer | File | Notes |
|---|---|---|
| Passwords | `lib/isc-auth/password.ts` | bcrypt (new canonical) + verbatim legacy BA scrypt verifier (`N=16384,r=16,p=1,dkLen=64`) so existing accounts keep working |
| Sessions | `lib/isc-auth/session.ts` | DB sessions, 7-day expiry, httpOnly SameSite=Lax cookie renamed to `isc-auth.session_token` / `__Secure-isc-auth.session_token` |
| API core | `lib/isc-auth/api.ts` | Typed `AuthError`; sign-in/up email+phone, phone OTP send/verify, phone+email password reset, change-password, sign-out, get-session; min password length now 6 (matches UI, was 8 under BA) |
| HTTP | `lib/isc-auth/handler.ts` | Origin/trusted-origin check on POSTs; same endpoint paths as before (`/api/auth/sign-in/email`, ...) so client pages & shell scripts are unchanged |
| Client | `lib/isc-auth/client.tsx` | Own `useSession` store (listener-based), `authClient` surface identical to previous consumer call shapes |
| Shims | `lib/auth/index.ts` / `client.ts` | Re-export from `lib/isc-auth/*` — ~50 permission consumers untouched |

Consequences: all users are logged out once (cookie rename); `better-auth`
dependency removed from package.json; proxy.ts updated to sniff new cookies;
6 new unit tests cover bcrypt + legacy-scrypt verification.

## Implementation log

| Phase | Result |
|---|---|
| 0 Baseline | typecheck ✅ · tests 146/146 ✅ · lint: 95 pre-existing errors elsewhere, touched files clean |
| 1 Remove `isc-auth/` | Backup `/tmp/opencode/isc-auth-vendored-backup-20260823.tar.gz` (715K) → deleted; sweep clean |
| 2 Dep cleanup | `@better-auth/drizzle-adapter` removed — it is a built-in dep of `better-auth` itself, so it was always redundant; `better-auth/adapters/drizzle` export verified |
| 3 OTP consolidation | Native plugin flow adopted: server gained `sendPasswordResetOTP`; forgot-password page now calls `/api/auth/phone-number/request-password-reset` + `/api/auth/phone-number/reset-password`; custom route **deleted**; custom `otp` table removed from schema + scripts (`clean-db`, `analyze-db`). Gains: attempt limiting (3), atomic code consumption, session revocation on reset |
| 4 Hardening | Reset email via Resend REST API when `RESEND_API_KEY` set (no new dep); dev logs link / prod errors loudly without key; `revokeSessionsOnPasswordReset: true`; csrf.ts scope documented (matcher excludes `/api` by design — frontend has no CSRF header wiring; APIs rely on SameSite=Lax + BA internal CSRF); `.env.example` documents `RESEND_API_KEY`/`EMAIL_FROM` |
| 5 Verification | lint ✅ · typecheck ✅ · tests 146/146 ✅ · `pnpm build` exit 0 ✅ · live e2e/auth-flow skipped (no DB in sandbox); run `pnpm test:e2e` + `scripts/test-auth-flow.sh` against a provisioned DB |

Files touched: `.env.example`, `app/[locale]/auth/forgot-password/page.tsx`,
`lib/auth/{index,csrf}.ts`, `lib/db/schema.ts`, `package.json`, `pnpm-lock.yaml`,
`scripts/{clean-db,analyze-db}.ts`, deleted `app/api/auth/reset-password-phone/`.

Follow-ups (deferred): drop `otp` table in live DB via migration
(`drizzle-kit push` after deploy); extend e2e with phone reset-path coverage;
optional client-side CSRF wiring for non-auth API mutations.


---

## 1. Current State (verified)

The application code has **already been migrated to Better Auth 1.6.x**. An exhaustive
case-insensitive search (`isc-auth`, `iscauth`, `ISC.auth`, cookie names,
`[...iscauth]` route paths, env vars) found **zero references to isc-auth anywhere
outside the vendored directory**.

### 1.1 What is already on Better Auth

| Layer | File(s) | Notes |
|---|---|---|
| Server config | `lib/auth/index.ts` | `betterAuth()` w/ drizzle pg adapter, `phoneNumber` plugin (Supabase SMS), email+password, custom `role`/`studentId` fields, lazy singleton via Proxy |
| Client config | `lib/auth/client.ts` | `createAuthClient` from `better-auth/react`, `phoneNumberClient`, `inferAdditionalFields` |
| CSRF layer | `lib/auth/csrf.ts` | Double-submit cookie, skips `/api/auth/*` (BA handles its own) |
| API handler | `app/api/auth/[...all]/route.ts` | `toNextJsHandler(getAuth())`, rate-limited POST 10/min / GET 20/min |
| Authorization | `lib/core/permissions.ts` | `auth.api.getSession({ headers })`; consumed by ~50 API routes + both protected layouts |
| Schema | `lib/db/schema.ts` L14–134 | BA tables: `user`, `session`, `account`, `verification` (+ custom `otp`) |
| Route protection | `proxy.ts` L16–17 | Sniffs `__Secure-better-auth.session_token` / `better-auth.session_token` |
| Consumers | 8 page components (`authClient`), 6 server routes (`auth.api.*`), e2e suites, shell scripts (`scripts/test-auth-flow.sh`) | All target `/api/auth/*` BA endpoints |

### 1.2 The vendored `isc-auth/` directory — dead code

- NextAuth v4 rebrand fork ("isc-auth" v1.0.1), ISC Expo.
- **Untracked in git**: `git ls-files isc-auth` → 0 files; shows as `?? isc-auth/`.
- **Not a workspace package**: `pnpm-workspace.yaml` has no `packages:` field.
- **Not installed**: absent from root `package.json` deps and `pnpm-lock.yaml`.
- **Not referenced**: no imports, no cookie names, no route paths, no env vars, no
  build-config mentions (checked `.gitignore`, `.dockerignore`, `Dockerfile`,
  `next.config.mjs`, `tsconfig.json`, `eslint.config.mjs`).
- Its own `PLAN.md` frames it as chasing Better Auth parity — superseded by the
  completed migration above.

### 1.3 Residual gaps found during analysis

| # | Gap | Location | Severity |
|---|---|---|---|
| G1 | Vendored `isc-auth/` dir still in tree (~full auth lib + its own tests/docker/example) | `./isc-auth/` | Medium (confusion, repo bloat, security-audit noise) |
| G2 | Unused dependency `@better-auth/drizzle-adapter` — source uses `better-auth/adapters/drizzle` subpath instead | `package.json:35` | Low |
| G3 | Custom phone reset-password endpoint bypasses BA phone-plugin verification store; reads bespoke `otp` table | `app/api/auth/reset-password-phone/route.ts`, `lib/db/schema.ts:121-134` | Medium (two OTP sources of truth) |
| G4 | Password-reset email only `console.log`s the link | `lib/auth/index.ts:115-117` | High (prod blocker) |
| G5 | `proxy.ts` matcher excludes `/api`, so `csrfMiddleware` never sees API traffic despite having an `/api/auth/*` skip-list | `proxy.ts:51-55`, `lib/auth/csrf.ts` | Low–Medium (defense-in-depth gap) |
| G6 | Dev `.env.development.local` lacks `BETTER_AUTH_SECRET/URL/TRUSTED_ORIGINS` and `DATABASE_URL`; relies on fallbacks/validation-error paths | `.env.development.local`, `lib/core/env.ts:8-19` | Low |

---

## 2. Refactoring Plan

### Phase 0 — Baseline & safety net *(no code changes)*

1. Record baseline: `pnpm typecheck && pnpm lint && pnpm test -- --run`.
2. Run e2e if DB available: `pnpm test:e2e` (Playwright boots dev server with fixed
   `BETTER_AUTH_SECRET=test_secret_key_for_testing_purposes`).
3. Confirm clean worktree or stash unrelated changes.

**Exit criteria:** green baseline captured; any pre-existing failures documented so
they are not attributed to this refactor.

---

### Phase 1 — Remove vendored `isc-auth/` *(G1)*

Safe because it is untracked, unreferenced, and not a workspace package.

1. Optional archival first (recommended): move to external storage or create a tag/
   bundle — it is NOT recoverable from git history once deleted.
   ```bash
   tar -czf ~/isc-auth-vendored-backup-$(date +%Y%m%d).tar.gz isc-auth/
   ```
2. Delete: `rm -rf isc-auth/`.
3. Sweep for stragglers:
   ```bash
   rg -i 'isc[-_]?auth' --glob '!node_modules' --glob '!.next' .
   ```
   Expected remaining hits: none (docs mention only "Better Auth"; `db:seed:isc*`
   scripts relate to *curriculum* seeding, not auth — leave untouched).
4. Add nothing to `.gitignore` (dir will be gone).

**Acceptance:** `rg -i 'isc[-_]?auth'` returns zero app/config hits; builds pass.
**Risk:** None — verified zero consumers. **Effort:** ~15 min incl. verification.

---

### Phase 2 — Dependency hygiene *(G2)*

1. `pnpm remove @better-auth/drizzle-adapter`
2. Verify lockfile diff contains only that removal.
3. `pnpm typecheck && pnpm build` — confirms `better-auth/adapters/drizzle`
   subpath resolves standalone.

**Acceptance:** `rg '@better-auth/drizzle-adapter'` → no hits outside lockfile
history; typecheck/build green.
**Risk:** None. **Effort:** ~10 min.

---

### Phase 3 — Consolidate OTP flows onto Better Auth plugin *(G3)*

Two OTP stores exist today: BA `phoneNumber` plugin (sign-up/forgot-password pages)
and the custom `otp` table (`reset-password-phone/route.ts`). Consolidate:

1. Rewrite `app/api/auth/reset-password-phone/route.ts` to verify via
   `auth.api.verifyPhoneNumberOtp(...)` (or `verifyPhoneNumber` internal API) instead
   of querying the custom `otp` table, then update password via
   `auth.api.resetPassword` / direct account update.
2. Migrate data (if prod rows exist): copy unexpired `otp` rows into the plugin's
   `phoneNumberVerification` state, or simply expire them and force re-request
   (recommended — OTPs are ≤5 min TTL).
3. Drop the custom `otp` table from `lib/db/schema.ts` after one release cycle;
   generate drizzle push/migration.
4. Update `scripts/test-auth-flow.sh` if it exercises the custom endpoint.

**Acceptance:** single OTP code path through the plugin; custom route either gone
or a thin wrapper; schema free of `otp` table (step 4 may be deferred).
**Risk:** Medium — touches password reset; cover with e2e
(`e2e/tests/auth.test.ts` extension: forgot → OTP → reset → sign-in).
**Effort:** 0.5–1 day.

---

### Phase 4 — Production hardening *(G4, G5, G6)*

1. **Email delivery (G4):** replace `console.log` in
   `lib/auth/index.ts:sendResetPassword` with a real provider (Resend/SES/etc.).
   Keep console fallback behind `NODE_ENV !== 'production'`.
2. **CSRF coverage decision (G5):** either
   - extend `proxy.ts` matcher to include `/api` minus BA routes (it self-skips
     `/api/auth/*` already), **or**
   - explicitly delete the misleading skip-list branch and document that API CSRF
     relies on per-route checks.
   Recommended: former — one line change in matcher, keep skip-list logic.
3. **Env parity (G6):** add `BETTER_AUTH_SECRET` (32+ chars), `BETTER_AUTH_URL`,
   `BETTER_AUTH_TRUSTED_ORIGINS`, `DATABASE_URL` names to `.env.development.local`
   guidance in `docs/installation.md` / `.env.example` comments; confirm
   `validateEnv()` fails fast in CI without them.
4. Optional: enable BA `rateLimit` built-in alongside existing `lib/core/rate-limit`
   usage, and revisit the deferred concurrent-session hook noted at
   `lib/auth/index.ts:107-110`.

**Acceptance:** reset email delivered in staging; API mutations without CSRF token
behave per chosen policy; fresh clone boots with documented env only.
**Risk:** Low-Medium (email deliverability, CSRF policy change). **Effort:** 0.5 day.

---

### Phase 5 — Final verification & documentation

1. Full gate: `pnpm lint && pnpm typecheck && pnpm test -- --run && pnpm build`.
2. E2E suite green (`pnpm test:e2e`) — auth.spec covers sign-in/up/out, redirects,
   persistence.
3. Manual curl cycle: `bash scripts/test-auth-flow.sh`.
4. Update `ARCHITECTURE.md` auth section: remove any isc-auth mention if present,
   note single-source-of-truth = Better Auth + plugins list.
5. Changelog entry under `CHANGELOG.md`.

---

## 3. Rollback Strategy

- Phase 1 (delete) is the only irreversible step — mitigated by Phase 1.1 backup
  tarball. Everything else is normal git revert territory.
- Phases 3–4 touch auth behavior: ship behind separate commits so bisecting is
  trivial; e2e must pass per-phase before proceeding.

## 4. Effort Summary

| Phase | Effort | Risk |
|---|---|---|
| 0 Baseline | 15 min | – |
| 1 Remove `isc-auth/` | 15 min | None |
| 2 Dep cleanup | 10 min | None |
| 3 OTP consolidation | 0.5–1 d | Medium |
| 4 Hardening | 0.5 d | Low–Medium |
| 5 Verify & document | 0.5 h | – |
| **Total** | **~1.5–2 days** | |
