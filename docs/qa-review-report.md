# QA Review Report — LMS Admin Panel
### Scope: Authentication & Infrastructure Review (Phase 1)

> **Important scope note:** This report is an **Authentication & Infrastructure Review**, not
> a complete functional QA. Because authentication failed before any admin surface could be
> reached, the business modules (Student, Admission, Enrollment, Course, Payment, Exam, etc.)
> were **blocked** and could **not** be tested end-to-end. They are marked **"Not Tested"**
> below, which means *unverified*, not *defective*. A true end-to-end functional report
> (Phase 2) is planned once the auth/database blocker is resolved.

| QA Metadata | Value |
| ----------- | ----- |
| Report phase | Phase 1 — Authentication & Infrastructure Review |
| Review date | 2026-07-18 |
| Reviewer | QA (automated workspace review) |
| Target | LMS Admin Panel (Next.js + Better Auth + Drizzle/PostgreSQL) |
| Env observed | Local dev server (external env vars injected; no committed `.env`) |
| Upstream commit reviewed | see `git rev-parse HEAD` at review time |
| Verification method | Static inspection + live HTTP probes (curl) + migration-journal diff |
| Blocking defect | Migration drift — journal stops at `0001`; auth query fails at runtime |

> **Test-coverage caveat:** This report assesses *runtime/auth* behavior. A unit-test suite
> already exists under `tests/` (Vitest) covering validation, settings, SMS, and payment
> utilities. Those unit tests were **not** executed as part of this review and are out of
> scope for the auth-blocker analysis; they are noted under "Existing Test Assets" below.

## Executive Summary

- **Critical Issues:** 1
- **High Issues:** 2
- **Medium Issues:** 3
- **Low Issues:** 1
- **Modules tested end-to-end:** 0 (auth blocked all business modules)
- **Modules blocked (Not Tested):** 13+
- **Existing unit tests (out of scope, not run here):** `tests/` (Vitest)

**Overall verdict:** the admin panel has a substantial UI/API scaffold, but the current
deployment is not usable for real admin workflows. The core authentication flow is failing
before any admin module can be exercised. Local runtime evidence shows that sign-in returns a
server error, and the database-backed auth query is failing because the live database schema
does not match the migrations the application expects.

### Review Basis & Method

This assessment is based on local verification against the available workspace and live
server responses. Where a defect could not be confirmed directly (e.g. the exact database
column state), the evidence is stated as inferred from the migration journal and server
behavior rather than asserted as fact.

## Scoring by Category

A single aggregate score would be misleading because most modules were never reached. The
evaluation is therefore broken down by category. Modules blocked by the auth failure are
explicitly marked **Not Tested** (unverified, not confirmed defective).

| Category       | Score / Status | Notes                                              |
| -------------- | -------------- | -------------------------------------------------- |
| Authentication | 15/100         | Sign-in returns 500; no session can be established |
| Database       | 30/100         | Migration drift; journal stops at `0001`           |
| Security       | 65/100         | Upload hardening gap; other checks not yet run     |
| Performance    | 55/100         | Slow session lookup; no load testing performed     |
| UI/UX          | 70/100         | Rich scaffold; weak loading/error states           |
| Student        | Not Tested     | Blocked by auth                                    |
| Admission      | Not Tested     | Blocked by auth                                    |
| Enrollment     | Not Tested     | Blocked by auth                                    |
| Course         | Not Tested     | Blocked by auth                                    |
| Subject        | Not Tested     | Blocked by auth                                    |
| Teacher        | Not Tested     | Blocked by auth                                    |
| Payment        | Not Tested     | Blocked by auth                                    |
| Exam           | Not Tested     | Blocked by auth                                    |
| Attendance     | Not Tested     | Blocked by auth                                    |
| SMS            | Not Tested     | Blocked by auth                                    |
| Notice         | Not Tested     | Blocked by auth                                    |
| Notification   | Not Tested     | Blocked by auth                                    |
| Settings       | Not Tested     | Blocked by auth                                    |
| User Mgmt      | Not Tested     | Blocked by auth                                    |
| Reports        | Not Tested     | Blocked by auth                                    |

## Verified Evidence From This Review

- **Sign-in failure (verified via curl):**
  - `POST /api/auth/sign-in/email` returned **HTTP 500**.
  - The response body was empty (no JSON payload); the underlying error is surfaced in the
    dev-server console, not the HTTP body.
- **Migration journal drift (verified by file inspection):**
  - `lib/db/migrations/meta/_journal.json` records only migrations `0000` and `0001` as
    applied. Migrations `0002` through `0014` — including `0013_add_user_admission_link.sql`,
    which adds `user.admission_id` — are **not** recorded against the live database.
  - This is the concrete mechanism behind the auth failure: the table shape the app expects
    does not exist in the running database.
- **Protected endpoints return 401 without a session (verified via curl):**
  - `/api/students` → 401
  - `/api/settings` → 401
  - `/api/teachers` → 401
  - `/api/notices` → 401
- **Public data endpoints are reachable:**
  - `/api/courses` returned data successfully, so the app is not entirely down; the blocker
    is authentication/session state.
- **Environment configuration:**
  - There is no committed `.env` or `.env.local` in the workspace (only `.env.example` and
    `.env.vercel`). Despite this, the dev server was running and responding during review,
    indicating the required variables were injected into the dev-server shell externally.
- **Existing test assets (not executed in this review):**
  - `tests/` contains Vitest suites: `student-validation.test.ts`, `settings.test.ts`,
    `payment-utils.test.ts`, `cms-content.test.ts`, `sas-sms.test.ts`, `sms-service.test.ts`,
    and `example.test.ts`. These cover validation and service-level logic but do not exercise
    the auth/DB path that is the focus of this report. They should be run and extended with
    integration tests in Phase 2.

## Detailed Findings

### 1) Authentication Is Broken at the Core
- **Module:** Authentication / Admin Access
- **Severity:** Critical
- **Description:**
  - The login flow fails before the admin panel becomes usable. The auth handler queries the
    user table and crashes because the live database schema does not include the fields the
    current app model expects.
  - The strongest evidence is the migration journal: only migrations `0000` and `0001` are
    recorded as applied, so the `user.admission_id` column added by
    `0013_add_user_admission_link.sql` (and other post-`0001` tables/columns) is absent at
    runtime. The dev-server console reports a missing-column error when Better Auth queries
    the user table.
- **Steps to Reproduce:**
  1. Start the Next.js app locally with a database whose applied migrations stop at `0001`.
  2. `POST /api/auth/sign-in/email` with any credentials.
  3. Observe the response and the dev-server console.
- **Expected:**
  - A successful sign-in response, a valid session, and redirect to `/admin` (or role-based
    dashboard).
- **Actual:**
  - HTTP 500 with an empty body; no session established. Dev-server console reports a missing
    column on the user table.
- **Screenshot Placeholder:** N/A — the failure occurs before the admin UI renders.
- **Suggested Fix:**
  - Apply the full migration chain (`0002`–`0014`) against the live database and verify the
    resulting column/table list.
  - Add a startup health check that fails fast if required columns/tables (e.g.
    `user.admission_id`) are missing.
  - Reconcile the migration journal so applied state matches `lib/db/migrations`.
- **Priority:** P0

### 2) Schema / Migration Drift Is Present
- **Module:** Database / Migrations
- **Severity:** High
- **Description:**
  - The schema definition in `lib/db/schema.ts` includes an admission link field on the user
    table (`admissionId`, line 64), and migration history includes
    `0013_add_user_admission_link.sql`. However, `lib/db/migrations/meta/_journal.json`
    records only `0000` and `0001` as applied. The runtime therefore does not match the code
    expectation.
  - This is a classic migration-drift issue and will affect any auth flow or profile update
    that touches the user table shape.
- **Steps to Reproduce:**
  1. Inspect `lib/db/migrations/meta/_journal.json` and compare against the migration files
     present in `lib/db/migrations/`.
  2. Inspect the live database table shape.
  3. Trigger any auth-driven query (e.g. sign-in).
- **Expected:** Runtime schema and migration history should be in sync.
- **Actual:** Auth fails at runtime because expected columns/tables are missing.
- **Screenshot Placeholder:** N/A
- **Suggested Fix:**
  - Run the full migration chain against the live database and verify the column list
    afterward.
  - Add CI or startup validation that compares schema expectations against the live database
    and blocks deployment on mismatch.
- **Priority:** P0

### 3) File Uploads Are Not Adequately Hardened
- **Module:** File Upload / Security (`app/api/media/route.ts`)
- **Severity:** High
- **Description:**
  - The upload handler at `app/api/media/route.ts` validates MIME type (allowlist of
    JPEG/PNG/WEBP/GIF/PDF) and size (5 MB cap), and applies a per-IP rate limit
    (`media.upload`, 10/min). It does **not** perform content sniffing, malware scanning, or
    verification that file contents match the declared type.
  - Uploaded files are written into `public/media` and served by URL stored in the database.
    This is acceptable for a simple app but introduces abuse risk for malicious content.
- **Steps to Reproduce:**
  1. Submit an upload with a legitimate-looking MIME type but dangerous content.
  2. Observe that checks only reject by MIME allowlist and size.
- **Expected:** The server should reject suspicious or dangerous files via content sniffing
  and/or antivirus scanning.
- **Actual:** Files are accepted if MIME is on the allowlist and under the size limit.
- **Screenshot Placeholder:** N/A
- **Suggested Fix:**
  - Add content sniffing and extension validation; re-check MIME after reading file bytes.
  - Store uploads outside the web root or behind signed URLs.
  - Add virus scanning or sandboxed inspection for uploaded documents.
- **Priority:** P1

### 4) Client-Side Validation Is Incomplete
- **Module:** Student / Course / Admission Forms
- **Severity:** Medium
- **Description:**
  - The admin UI includes rich forms (`app/admin/components/students-tab.tsx`,
    `app/admin/components/courses-tab.tsx`). Shared Zod schemas exist (e.g. `lib/validations`)
    and are enforced server-side via API routes, so malformed input is ultimately rejected.
    The gap is the **user-facing feedback**: inline field-level errors are inconsistent, the
    submit button is not always disabled while in flight, and duplicate/format errors are
    surfaced late (after a round-trip) rather than preemptively.
- **Steps to Reproduce:**
  1. Open the student or course form.
  2. Enter invalid values (invalid slug, empty title, invalid email, duplicate data).
  3. Submit.
- **Expected:** Inline field-level validation, disabled submit state, field-specific feedback
  before the request is sent.
- **Actual:** The UI mostly relies on server-side errors and generic alerts.
- **Screenshot Placeholder:** N/A
- **Suggested Fix:** Add client-side validation for slug, email, phone, required fields, and
  fee constraints; show field-specific errors inline and disable submit while in flight.
- **Priority:** P2

### 5) Loading and Error States Are Weak in the Admin Experience
- **Module:** UI / UX
- **Severity:** Medium
- **Description:**
  - The admin shell (`app/admin/page.tsx`) has a skeleton for the main tab shell, but tab panels and
    lists do not always give clear feedback when a fetch fails or when there is no data. Some
    destructive actions rely on `window.confirm`/alert rather than structured feedback.
- **Steps to Reproduce:**
  1. Open the admin panel and navigate among tabs.
  2. Trigger a failed request or empty dataset.
- **Expected:** Skeletons, empty-state tables with guidance, toast-style success/error
  feedback.
- **Actual:** Experience is mostly static and lacks clarity on network/backend failure.
- **Screenshot Placeholder:** N/A
- **Suggested Fix:** Introduce shared loading skeletons, empty states, and toast components;
  add error boundaries around tab panels.
- **Priority:** P2

### 6) Deployment Is Fragile and Environment-Dependent
- **Module:** Deployment / DevOps
- **Severity:** Medium
- **Description:**
  - The repository includes `.env.example` and `.env.vercel`, but there is no committed
    `.env`/`.env.local` for local development. During review the dev server was nonetheless
    running and responding, indicating the required variables were injected externally into
    the dev-shell rather than supplied via a committed template. This makes dev/CI setup
    inconsistent and increases the risk of broken environments.
- **Steps to Reproduce:**
  1. Start from a clean checkout without preloaded environment variables.
  2. Run the app.
- **Expected:** The app should start from documented environment settings without relying on
  manually injected shell variables.
- **Actual:** No local env template is committed; setup depends on externally provided vars.
- **Screenshot Placeholder:** N/A
- **Suggested Fix:** Document and provide a local env template flow; add a startup health
  check that fails with a clear message when required variables are missing.
- **Priority:** P2

## Module-by-Module Status

> All business modules below are **Not Tested** — their routes and UI exist in the codebase,
> but they could not be exercised end-to-end because authentication failed before access. They
> are listed with the evidence that they exist, not that they work.

### Dashboard
- **Status:** Not Tested (UI exists; blocked by auth).
- **Evidence:** The overview panel exists in `app/admin/components/overview-tab.tsx` and renders counts and recent
  activity from props.

### Student Module
- **Status:** Not Tested (UI and routes present; blocked by auth).
- **Evidence:** Student list/form flow exists in `app/admin/components/students-tab.tsx`; create/update/delete APIs
  exist at `app/api/students/route.ts` and `app/api/students/[id]/route.ts`.

### Admission Module
- **Status:** Not Tested (API and UI scaffolding exist; blocked by auth).
- **Evidence:** Admin admission routes exist at `app/api/admissions/route.ts` and
  `app/api/admissions/[id]/route.ts`.

### Enrollment / Course / Subject / Teacher / Exam / Attendance / Payment / SMS /
Notification / Notice / Settings / User Management / Reports
- **Status:** Not Tested (routes and UI panels exist; blocked by auth).
- **Evidence:** Routes exist under `app/api` and UI panels are registered in `app/admin/page.tsx`.

## Missing Features

- Import/export controls for students and admissions are not surfaced in the current admin UI.
- Bulk actions and multi-select workflows are not implemented.
- Restore/soft-delete workflows are not present for students or admissions.
- Session logout and 2FA management are not clearly surfaced in the admin experience.
- Report export to PDF/Excel/CSV is not wired into the UI even where export endpoints exist.
- Admin user management is not fully represented as a first-class role-based module.

## Security Improvements

- Fix the database/schema drift immediately; this is the highest-risk defect.
- Harden media uploads (`app/api/media/route.ts`) with content sniffing and extension checks.
- Add malware scanning or sandboxed inspection for uploaded documents.
- Ensure uploads are stored outside the web root or behind signed URLs.
- Add explicit CSRF protections for state-changing requests where appropriate.
- Continue masking sensitive settings and secrets on non-super-admin responses.

## Performance Improvements

- Reduce auth/session lookup cost; the session endpoint was slow in local testing.
- Avoid over-fetching the whole admin page from multiple routes at once; consolidate fetches
  by tab or use server-side prefetch.
- Add route-level caching or revalidation where data is semi-static.
- Improve pagination in the UI so large lists do not load everything in one request.

## Database Improvements

- Add migration smoke tests so schema drift is caught before deploy.
- Add startup checks for required tables/columns.
- Introduce consistent soft-delete/restore behavior instead of hard deletes where appropriate.
- Add foreign-key integrity and transaction checks for enrollment/payment flows.
- Add audit-trail coverage for sensitive changes and delete operations.

## UX Improvements

- Add toasts for success/error actions.
- Add inline validation and field-level error messaging.
- Add skeletons and empty states for all list pages.
- Make destructive actions explicit with confirmation dialogs and clear success feedback.

## Accessibility Improvements

- Add `aria-live` regions for form errors and success messages.
- Ensure keyboard focus is handled when forms open/close.
- Include semantic labels and grouping for large admin forms.
- Improve contrast for status badges and destructive actions in dark mode.

## Code Improvements

- Reduce duplication in forms via shared validation/field-layout components.
- Introduce shared fetch helpers with consistent error handling.
- Use stricter TypeScript patterns; avoid `any`-style casts in route code where possible.
- Centralize validation and error formatting so UI and API behave consistently.

## API Improvements

- Standardize response shapes across modules.
- Return structured 409/422/404 responses consistently rather than generic messages.
- Add request IDs and correlation headers for support/debugging.
- Review authorization logic to ensure every route uses the same role model and policy checks.

## Deployment Improvements

- Document and enforce environment variables for local development.
- Add a startup health endpoint for DB/auth readiness.
- Create a deployment checklist that includes migration verification.
- Add CI smoke tests for sign-in and protected routes before production deployment.

## Prioritized Roadmap

### Immediate Fixes (Today)
- Repair the schema/migration drift blocking authentication (apply `0002`–`0014`; reconcile
  `_journal.json`).
- Re-test login and confirm the admin session is created successfully.
- Add a startup health check for database/auth readiness.
- Patch upload security (`app/api/media/route.ts`) to reject suspicious files before saving.

### Short Term (This Week)
- Add inline validation and better error feedback to the admin forms.
- Add toasts, loading states, and empty states across important list views.
- Add a smoke-test suite for sign-in and the core CRUD APIs.

### Medium Term
- Implement missing import/export and bulk operations for major modules.
- Add restore/soft-delete semantics for student/admission records.
- Introduce stronger audit and permission UX for admin roles.

### Long Term
- Refactor the admin data layer for better performance and less repeated fetch logic.
- Add report export pipelines, analytics, and role-based dashboards.
- Harden the platform for production with deeper security tests and deployment guardrails.

---

## Phase 2 — Deferred Functional, API, Security & Performance Test Plan

The following test coverage is **planned but not yet executed**, because every business
module is blocked behind the authentication failure documented above. Once the auth/database
blocker is fixed, rerun QA and produce a true end-to-end functional report. Each item should
be recorded with a **Pass/Fail** result, a **Bug ID** (where it fails), severity, and
reproduction steps, plus a screenshot.

### Functional Test Checklist (per module)

**Student**
- Create student · Edit student · Delete student · Restore student · Search · Filter ·
  Pagination · Validation · Duplicate prevention · Image upload

**Admission**
- Create · Update · Delete · Status change · Convert to student

**Enrollment**
- Enroll student · Prevent duplicate enrollment · Drop course · Fee calculation

**Course**
- Add · Edit · Delete · Duplicate slug rejection · Inactive course handling

**Subject**
- CRUD · Credit validation

**Teacher**
- CRUD · Assign subjects

**Payment**
- Manual payment · Partial payment · Discount · Due calculation · Receipt generation ·
  Delete payment

**Exam**
- Create exam · Assign subjects · Marks entry · Publish result

**Attendance**
- Mark attendance · Edit attendance · Monthly report

**Notice**
- Publish · Edit · Delete · Rich text

**Notification**
- Push notification · Email notification · Read status

**SMS**
- Single SMS · Bulk SMS · Failed-delivery handling

**Settings**
- Institute profile · Logo upload · SMTP · SMS gateway · Payment gateway

**User Management**
- Create admin · Edit role · Disable user · Reset password

**Reports**
- Generate · Export (PDF/Excel/CSV) · Role-based visibility

### API Test Checklist
- HTTP status codes per endpoint · Validation-error responses (422) · Authorization (401/403)
  · Rate limiting (media upload limiter) · Duplicate-request handling · Invalid-ID handling ·
  Pagination · Sorting · Filtering · File-upload abuse (type/size/MIME mismatch)

### Security Test Checklist
- Broken Access Control · IDOR (object ownership) · Privilege Escalation · Session/JWT
  tampering · CSRF · XSS (input reflection, rich text) · SQL Injection · File-upload bypass ·
  Password policy · Session expiration

### Performance Test Checklist
- Dashboard load time · Student list with 10,000 records · Concurrent logins · Payment
  creation speed · API response times (p50/p95) · Database query optimization review

### Deliverables for the Phase 2 Report
- ✅ Pass/Fail checklist per module · ✅ Bug IDs with severity and reproduction steps ·
  ✅ Role & permission matrix · ✅ API validation results · ✅ Security test results ·
  ✅ Performance benchmarks · ✅ Screenshots per module

This Phase 2 output is the artifact suitable for client delivery or release sign-off.
