# ISC Expo LMS — Project Plan

> **Start Date:** 2026-07-22
> **Target:** 7-week phased delivery
> **Repo:** private | **Stack:** Next.js 16 / Drizzle / PostgreSQL / Better Auth / Tailwind v4

---

## Status Legend

| Symbol | Meaning               |
| ------ | --------------------- |
| 🔴     | Blocked / not started |
| 🟡     | In progress           |
| 🟢     | Done                  |
| ⏳     | Waiting on dependency |

---

## Phase 1 — Critical Fixes (Week 1) — 🟢 Complete

Everything below is a **hard prerequisite** for all other phases.

| #    | Task                                                        | Files                                                       | Acceptance Criteria                                                         | Status |
| ---- | ----------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- | ------ |
| 1.1  | Rebuild migration journal                                   | `lib/db/migrations/meta/_journal.json`                      | All migration entries (0000–0017) present with correct file hashes          | 🟢     |
| 1.2  | Run `drizzle-kit push` or seed endpoint to apply migrations | `api/admin/migrate`                                         | DB tables match `lib/db/schema.ts`                                          | 🟢     |
| 1.3  | Verify email+password sign-in                               | `lib/auth/index.ts`, `app/api/auth/[...all]/route.ts`       | POST returns 200, session cookie set                                        | 🟢     |
| 1.4  | Verify middleware auth guard                                | `middleware.ts`                                             | Unauthenticated → `/auth/sign-in`; authenticated → `/admin` or `/dashboard` | 🟢     |
| 1.5  | Verify phone+OTP flow                                       | `lib/auth/index.ts` (phone plugin), Supabase Edge Functions | OTP sent, verified, session created                                         | 🟢     |
| 1.6  | Run existing unit tests (`pnpm test`)                       | `tests/*`                                                   | All 11 test files (90 tests) pass                                           | 🟢     |
| 1.7  | Run typecheck (`pnpm typecheck`)                            | —                                                           | Zero errors                                                                 | 🟢     |
| 1.8  | Run lint (`pnpm lint`)                                      | —                                                           | Zero errors and warnings                                                    | 🟢     |
| 1.9  | Add React error boundaries to admin tab panels              | `app/admin/components/*.tsx`                                | Each tab wrapped in `<ErrorBoundary>` with retry UI                         | 🟢     |
| 1.10 | Seed demo admin user                                        | `scripts/seed-demo-admin.ts`                                | `admin@khulnasoft.com` can log in and see all 22 tabs                       | 🟢     |

---

## Phase 2 — Admin UI Core (Weeks 2–3)

### 2A: Shared UI Components — 🟢 Complete

| #    | Task                      | Target File                        | Details                                                                                         | Status |
| ---- | ------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------- | ------ |
| 2A.1 | `ConfirmDialog` component | `components/ui/confirm-dialog.tsx` | Modal with title, body, confirm/cancel buttons. Replace every `window.confirm()` in admin tabs. | 🟢     |
| 2A.2 | `FormField` component     | `components/ui/form-field.tsx`     | Wraps label + input + error + help text. Used by every form in admin.                           | 🟢     |
| 2A.3 | `Alert` component         | `components/ui/alert.tsx`          | Error/info/success banners for form-level errors.                                               | 🟢     |
| 2A.4 | Enhanced `EmptyState`     | `components/ui/empty-state.tsx`    | Icon + heading + description + CTA button. Already exists — add icon prop.                      | 🟢     |
| 2A.5 | `SkeletonTable`           | `components/ui/skeleton.tsx`       | Rows of shimmer lines matching DataTable layout.                                                | 🟢     |

### 2B: Data Table Overhaul — 🟢 Complete

| #    | Task                         | Target File                    | Details                                                                                        | Status |
| ---- | ---------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------- | ------ |
| 2B.1 | Column sorting               | `components/ui/data-table.tsx` | Click header to toggle asc/desc. Show sort icon.                                               | 🟢     |
| 2B.2 | Column text filter           | `components/ui/data-table.tsx` | Per-column search input above the table.                                                       | 🟢     |
| 2B.3 | Row selection + bulk actions | `components/ui/data-table.tsx` | Checkbox column, "Select All" header, bulk delete/approve/export toolbar.                      | 🟢     |
| 2B.4 | Client-side pagination       | `components/ui/data-table.tsx` | Page size selector (10/25/50/100), prev/next/page number buttons.                              | 🟢     |
| 2B.5 | CSV export button            | `components/ui/data-table.tsx` | Export currently filtered+sorted rows. Use existing `/api/*/export` endpoints where available. | 🟢     |
| 2B.6 | Sticky header                | `components/ui/data-table.tsx` | `position: sticky; top: 0` on `<thead>`.                                                       | 🟢     |

### 2C: Admin Tab Upgrades — 🟡 Partial (see per-tab notes; most filters/actions done, some charts/PDF/calendar pending)

| #     | Tab               | Tasks                                                                                                             |
| ----- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| 2C.1  | **Overview**      | Add revenue trend sparkline (last 30 days), today's attendance count, upcoming exams card, quick-action buttons.  |
| 2C.2  | **Courses**       | Category filter tabs (All/Icon/ISC) with counts, image thumbnail in list rows, clone course button.               |
| 2C.3  | **Enrollments**   | Status workflow badges (pending→approved→active), course filter dropdown, date range filter, bulk approve/reject. |
| 2C.4  | **Payments**      | Verify/reject buttons per row, method filter, transaction ID search, date range filter, CSV export.               |
| 2C.5  | **Exams**         | Status badges (draft/active/completed), question count + submission count columns, clone exam button.             |
| 2C.6  | **Question Bank** | Subject filter, difficulty filter, duplicate question button, bulk CSV import.                                    |
| 2C.7  | **Students**      | Multi-field search (name/phone/email/ID), enrollment status filter, profile modal on row click.                   |
| 2C.8  | **Attendance**    | Calendar view (monthly grid), batch marking for a date, per-student attendance %.                                 |
| 2C.9  | **Admit Cards**   | Bulk generate for exam, PDF download, print preview.                                                              |
| 2C.10 | **Reports**       | Date range picker, charts via `recharts` (revenue line, enrollment pie, attendance heatmap), PDF export.          | 🟢 (2026-08-20: recharts charts + PDF export added) |
| 2C.11 | **Settings**      | Sub-tabs (General/SMS/Payment/CMS/Security), test SMS button, env status indicator.                               |

### 2D: Loading & Error States — 🟢 Complete

| #    | Task                                 | Scope                                                                   |
| ---- | ------------------------------------ | ----------------------------------------------------------------------- |
| 2D.1 | Skeleton loading for every tab panel | Replace `"লোড হচ্ছে..."` text with skeleton grids                       |
| 2D.2 | Error cards with retry               | When fetch fails, show error icon + message + "আবার চেষ্টা করুন" button |
| 2D.3 | Toast on all async ops               | Ensure every save/delete/update fires `success()` or `error()` toast    |

---

## Phase 3 — LMS Core Logic (Weeks 3–4) — 🟡 Partial (3A/3C/3D done; 3B partial; 3E pending)

### 3A: Enrollment Lifecycle — 🟢 Complete

| #    | Task                                        | Files                                      | Details                                                                                                |
| ---- | ------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| 3A.1 | Add migration: enrollment lifecycle columns | `lib/db/migrations/`, `lib/db/schema.ts`   | `approved_at`, `started_at`, `completed_at`, `expires_at`, `suspended_reason`, `completion_percentage` |
| 3A.2 | Status transition logic                     | `lib/validations.ts`, API routes           | Enforce valid transitions; reject invalid state changes                                                |
| 3A.3 | Auto-expire enrollments                     | Cron or API middleware                     | Check `expires_at` daily, set status to `expired`                                                      |
| 3A.4 | Auto-generate invoice on approval           | `app/api/enrollments/[id]/route.ts` (PUT)  | When status changes to `approved`, create invoice record                                               |
| 3A.5 | Notification on status change               | `app/api/enrollments/[id]/route.ts`        | Insert notification record for each transition                                                         |
| 3A.6 | Admin UI: enrollment workflow               | `app/admin/components/enrollments-tab.tsx` | Workflow visualization, suspend/complete buttons                                                       |

### 3B: Payment Enhancements — 🟡 Partial (receipt done; refund API missing)

| #    | Task                       | Files                                   | Details                                           | Status |
| ---- | -------------------------- | --------------------------------------- | ------------------------------------------------- | ------ |
| 3B.1 | Refund API endpoint        | `app/api/payments/[id]/refund/route.ts` | POST: process refund, update enrollment balance   | ⏳     |
| 3B.2 | Payment receipt generation | `components/payment-receipt.tsx`        | HTML-to-print receipt with institution branding   | 🟢     |
| 3B.3 | Overpayment detection      | `lib/validations.ts`                    | Reject payments exceeding due amount              | 🟢     |
| 3B.4 | Installment tracking       | `app/api/invoices/route.ts`             | Support partial payments, track installment count | 🟢     |

### 3C: Exam System — 🟢 Complete

| #    | Task                                | Files                                           | Details                                                                                                           | Status |
| ---- | ----------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| 3C.1 | Add migration: exam enhancements    | `lib/db/migrations/`, `lib/db/schema.ts`        | `exam_type`, `start_time`, `end_time`, `allow_review`, `negative_marking`, `shuffle_questions`, `shuffle_options` | 🟢     |
| 3C.2 | Question enhancements migration     | same                                            | `difficulty`, `points`, `explanation`                                                                             | 🟢     |
| 3C.3 | Exam types enum                     | `lib/db/schema.ts`                              | `model_test`, `practice_quiz`, `final_exam`, `subject_test`                                                       | 🟢     |
| 3C.4 | Question pool selection             | `app/api/exams/route.ts`                        | Random N questions from pool per subject                                                                          | 🟢     |
| 3C.5 | Anti-cheating: tab-switch detection | `app/exam/[id]/page.tsx`                        | Track tab changes, log warnings                                                                                   | 🟢     |
| 3C.6 | Anti-cheating: shuffle options      | `app/exam/[id]/page.tsx`                        | Randomize option order per question per student                                                                   | 🟢     |
| 3C.7 | Exam analytics API                  | `app/api/exams/[id]/results/analytics/route.ts` | Class average, percentile, std deviation, grade distribution                                                      | 🟢     |
| 3C.8 | Grade assignment                    | `lib/validations.ts`                            | A+/A/B+/B/C+/C/D/F based on score percentage                                                                      | 🟢     |

### 3D: Attendance — 🟢 Complete

| #    | Task                     | Files                                                                        | Details                                                   |
| ---- | ------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| 3D.1 | Calendar API endpoint    | `app/api/attendance/calendar/route.ts`                                       | Return attendance data grouped by date for calendar view  |
| 3D.2 | Batch marking endpoint   | `app/api/attendance/batch/route.ts`                                          | POST: mark attendance for multiple students at once       |
| 3D.3 | Attendance % calculation | `lib/validations.ts`                                                         | Utility: `(present / total) * 100` per student per course |
| 3D.4 | Admin UI: calendar view  | `components/ui/calendar-view.tsx`, `app/admin/components/attendance-tab.tsx` | Monthly grid, click date to mark, color-coded cells       |

### 3E: Notifications — 🔴 Pending (needs migration 0017/0018 + new APIs)

| #    | Task                              | Files                                      | Details                                 | Status |
| ---- | --------------------------------- | ------------------------------------------ | --------------------------------------- | ------ |
| 3E.1 | Notification templates migration  | `lib/db/migrations/`, `lib/db/schema.ts`   | `notification_templates` table          | ⏳     |
| 3E.2 | Scheduled notifications migration | same                                       | `scheduled_notifications` table         | ⏳     |
| 3E.3 | Template CRUD API                 | `app/api/notifications/templates/route.ts` | GET/POST/PUT/DELETE                     | ⏳     |
| 3E.4 | Scheduled notification processor  | Cron or API                                | Check `scheduled_at`, send when due     | ⏳     |
| 3E.5 | SMS integration for notifications | `lib/sms/`, notification API               | Send SMS when template channel is `sms` | ⏳     |

---

## Phase 4 — Reports & Analytics (Week 5) — 🟢 Complete (APIs, recharts, PDF done 2026-08-20)

| #    | Task                        | Files                                       | Details                                             | Status                                                                                |
| ---- | --------------------------- | ------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 4.1  | Install `recharts`          | `package.json`                              | Dynamic import to avoid SSR issues                  | 🟢                                                                                    |
| 4.2  | `ChartCard` component       | `components/ui/chart-card.tsx`              | Wraps recharts with title, loading, empty states    | 🟡 (reports-tab uses `ChartCard` from `charts.tsx`; `ui/chart-card.tsx` shell unused) |
| 4.3  | `DateRangePicker` component | `components/ui/date-range-picker.tsx`       | Start/end date inputs with presets (7d/30d/90d)     | 🟢                                                                                    |
| 4.4  | Revenue report API          | `app/api/reports/revenue/route.ts`          | Daily revenue, pending amount, refund total         | 🟢                                                                                    |
| 4.5  | Enrollment report API       | `app/api/reports/enrollment/route.ts`       | New enrollments over time, course popularity        | 🟢                                                                                    |
| 4.6  | Attendance report API       | `app/api/reports/attendance/route.ts`       | Per-course, per-student, daily summary              | 🟢                                                                                    |
| 4.7  | Exam performance report API | `app/api/reports/exam-performance/route.ts` | Score distribution, rank, improvement               | 🟢                                                                                    |
| 4.8  | Student report card         | `app/api/reports/student/[id]/route.ts`     | Enrollment + attendance + exam scores + payments    | 🟢                                                                                    |
| 4.9  | PDF export                  | `app/api/reports/export/[type]/route.ts`    | Generate PDF using `@react-pdf/renderer` or `jspdf` | 🟢 (jspdf; 6 report types)                                                            |
| 4.10 | Reports tab UI              | `app/admin/components/reports-tab/`         | Charts, date picker, export buttons per report type | 🟢 (recharts + PDF button added)                                                      |

---

## Phase 5 — Security & Testing (Week 6) — 🟡 Partial (security done; testing pending)

### 5A: Security — 🟢 Complete

| #    | Task                      | Files                               | Details                                                  | Status                      |
| ---- | ------------------------- | ----------------------------------- | -------------------------------------------------------- | --------------------------- |
| 5A.1 | CSRF token middleware     | `lib/auth/csrf.ts` + middleware     | Generate/validate tokens for POST/PUT/DELETE             | 🟢                          |
| 5A.2 | Session hardening         | `lib/auth/index.ts`                 | Invalidate on password change, max 3 concurrent sessions | 🟢                          |
| 5A.3 | Session activity tracking | `lib/db/schema.ts` (migration 0017) | `ip_address`, `user_agent` on session                    | 🟢 (last_active_at pending) |
| 5A.4 | Force logout              | `app/api/admin/logout-all/route.ts` | Delete all sessions for a user                           | 🟢                          |
| 5A.5 | Audit log for file ops    | `lib/audit/index.ts`                | Log upload/delete with actor + file details              | 🟢                          |
| 5A.6 | Signed URLs for uploads   | `lib/media/storage.ts`              | Use Vercel Blob signed URLs with expiry                  | 🔴                          |

### 5B: Testing — 🔴 Pending (audit + new tests in Phase C6)

| #     | Task                           | Target                                   | Target Count                                 | Status |
| ----- | ------------------------------ | ---------------------------------------- | -------------------------------------------- | ------ |
| 5B.1  | Auth unit tests                | `tests/auth.test.ts`                     | Login, logout, session refresh, OTP verify   | 🔴     |
| 5B.2  | RBAC unit tests                | `tests/permissions.test.ts`              | Every role × permission combination          | 🟢     |
| 5B.3  | Enrollment unit tests          | `tests/enrollment.test.ts`               | Status transitions, validation, auto-expire  | 🔴     |
| 5B.4  | Payment unit tests             | `tests/payment.test.ts`                  | All methods, verify, refund, overpayment     | 🔴     |
| 5B.5  | Exam unit tests                | `tests/exam.test.ts`                     | Create, submit, score, analytics, grade calc | 🔴     |
| 5B.6  | Attendance unit tests          | `tests/attendance.test.ts`               | Mark, batch, calendar, percentage calc       | 🔴     |
| 5B.7  | Notification unit tests        | `tests/notification.test.ts`             | Create, template, scheduled, delivery        | 🔴     |
| 5B.8  | Validation unit tests          | `tests/validations.test.ts`              | All Zod schemas (455+ lines)                 | 🔴     |
| 5B.9  | E2E: full enrollment lifecycle | `e2e/tests/enrollment-lifecycle.test.ts` | Sign up → enroll → pay → approve → active    | 🔴     |
| 5B.10 | E2E: exam flow                 | `e2e/tests/exam-flow.test.ts`            | Create exam → add questions → take → results | 🔴     |
| 5B.11 | E2E: payment flow              | `e2e/tests/payment-flow.test.ts`         | Submit → verify → invoice update             | 🔴     |
| 5B.12 | E2E: attendance flow           | `e2e/tests/attendance-flow.test.ts`      | Mark → report → calendar                     | 🔴     |
| 5B.13 | E2E: admin CRUD (all tabs)     | `e2e/tests/admin-crud.test.ts`           | Happy path for each of 22 tabs               | 🔴     |
| 5B.14 | E2E: error handling            | `e2e/tests/error-handling.test.ts`       | Invalid inputs, 401, 500, timeout            | 🔴     |
| 5B.15 | E2E: accessibility             | `e2e/tests/accessibility.test.ts`        | axe-core on all major pages                  | 🔴     |

---

## Phase 6 — Polish & Launch (Week 7)

| #   | Task                         | Details                                                                                                                                           |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1 | Dark mode audit              | Verify every new/modified component in dark mode                                                                                                  |
| 6.2 | Responsive audit             | Test admin at 1024px, 768px, 640px breakpoints                                                                                                    |
| 6.3 | Performance: code splitting  | Ensure all lazy-loaded tab panels use `React.lazy()` + `Suspense`                                                                                 |
| 6.4 | Performance: bundle analysis | Run `pnpm build` + analyze; remove unused deps                                                                                                    |
| 6.5 | CI/CD verification           | Push to main, verify all CI steps pass (lint, typecheck, test, build, migrate)                                                                    |
| 6.6 | Production env validation    | Verify all env vars present in Vercel dashboard                                                                                                   |
| 6.7 | Documentation                | Update README.md with new features, update AGENTS.md if created                                                                                   |
| 6.8 | QA regression                | Run full E2E suite against staging                                                                                                                |
| 6.9 | Launch checklist             | [ ] Auth works, [ ] All 22 admin tabs functional, [ ] Payment flow verified, [ ] Exam flow verified, [ ] SMS sending works, [ ] No console errors |

---

## New Files to Create

### Components

| File                                             | Purpose                     |
| ------------------------------------------------ | --------------------------- |
| `components/ui/confirm-dialog.tsx`               | Modal confirmation dialog   |
| `components/ui/form-field.tsx`                   | Reusable form field wrapper |
| `components/ui/alert.tsx`                        | Error/info/success banners  |
| `components/ui/chart-card.tsx`                   | Chart wrapper with title    |
| `components/ui/date-range-picker.tsx`            | Date range selection        |
| `components/ui/calendar-view.tsx`                | Monthly attendance calendar |
| `components/payment-receipt.tsx`                 | Printable payment receipt   |
| `components/admit-card-pdf.tsx`                  | PDF admit card generator    |
| `app/admin/components/student-profile-modal.tsx` | Quick-view student profile  |

### API Routes

| File                                            | Methods             |
| ----------------------------------------------- | ------------------- |
| `app/api/enrollments/[id]/approve/route.ts`     | POST                |
| `app/api/enrollments/[id]/suspend/route.ts`     | POST                |
| `app/api/enrollments/[id]/complete/route.ts`    | POST                |
| `app/api/payments/[id]/refund/route.ts`         | POST                |
| `app/api/attendance/batch/route.ts`             | POST                |
| `app/api/attendance/calendar/route.ts`          | GET                 |
| `app/api/exams/[id]/clone/route.ts`             | POST                |
| `app/api/exams/[id]/results/analytics/route.ts` | GET                 |
| `app/api/questions/import/route.ts`             | POST                |
| `app/api/notifications/templates/route.ts`      | GET/POST/PUT/DELETE |
| `app/api/notifications/scheduled/route.ts`      | GET/POST            |
| `app/api/reports/revenue/route.ts`              | GET                 |
| `app/api/reports/enrollment/route.ts`           | GET                 |
| `app/api/reports/attendance/route.ts`           | GET                 |
| `app/api/reports/exam-performance/route.ts`     | GET                 |
| `app/api/reports/student/[id]/route.ts`         | GET                 |
| `app/api/reports/export/[type]/route.ts`        | GET                 |
| `app/api/admin/audit-logs/route.ts`             | GET                 |

### Tests

| File                                     | Type |
| ---------------------------------------- | ---- |
| `tests/auth.test.ts`                     | Unit |
| `tests/permissions.test.ts`              | Unit |
| `tests/enrollment.test.ts`               | Unit |
| `tests/payment.test.ts`                  | Unit |
| `tests/exam.test.ts`                     | Unit |
| `tests/attendance.test.ts`               | Unit |
| `tests/notification.test.ts`             | Unit |
| `tests/validations.test.ts`              | Unit |
| `e2e/tests/enrollment-lifecycle.test.ts` | E2E  |
| `e2e/tests/exam-flow.test.ts`            | E2E  |
| `e2e/tests/payment-flow.test.ts`         | E2E  |
| `e2e/tests/attendance-flow.test.ts`      | E2E  |
| `e2e/tests/admin-crud.test.ts`           | E2E  |
| `e2e/tests/error-handling.test.ts`       | E2E  |
| `e2e/tests/accessibility.test.ts`        | E2E  |

---

## Database Migrations to Create

### Migration 0015: Enrollment Lifecycle — ✅ Applied (columns present in `lib/db/schema.ts`)

```sql
ALTER TABLE enrollments ADD COLUMN approved_at timestamp;
ALTER TABLE enrollments ADD COLUMN started_at timestamp;
ALTER TABLE enrollments ADD COLUMN completed_at timestamp;
ALTER TABLE enrollments ADD COLUMN expires_at timestamp;
ALTER TABLE enrollments ADD COLUMN suspended_reason text;
ALTER TABLE enrollments ADD COLUMN completion_percentage integer DEFAULT 0;
```

### Migration 0016: Exam Enhancements — ✅ Applied

```sql
ALTER TABLE exams ADD COLUMN exam_type text DEFAULT 'model_test';
ALTER TABLE exams ADD COLUMN start_time timestamp;
ALTER TABLE exams ADD COLUMN end_time timestamp;
ALTER TABLE exams ADD COLUMN allow_review boolean DEFAULT true;
ALTER TABLE exams ADD COLUMN negative_marking boolean DEFAULT false;
ALTER TABLE exams ADD COLUMN shuffle_questions boolean DEFAULT true;
ALTER TABLE exams ADD COLUMN shuffle_options boolean DEFAULT true;

ALTER TABLE questions ADD COLUMN difficulty text DEFAULT 'medium';
ALTER TABLE questions ADD COLUMN points integer DEFAULT 1;
ALTER TABLE questions ADD COLUMN explanation text;
```

### Migration 0017: Notifications & Session — ⏳ Partial (session ip_address/user_agent applied; notification tables + last_active_at pending)

```sql
CREATE TABLE notification_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  channel text DEFAULT 'in_app',
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE scheduled_notifications (
  id text PRIMARY KEY,
  template_id text REFERENCES notification_templates(id),
  scheduled_at timestamp NOT NULL,
  target_role text,
  target_course_id text,
  status text DEFAULT 'pending',
  sent_at timestamp,
  created_at timestamp DEFAULT now()
);

ALTER TABLE session ADD COLUMN ip_address text;
ALTER TABLE session ADD COLUMN user_agent text;
ALTER TABLE session ADD COLUMN last_active_at timestamp;
```

### Migration 0018: Attendance & Leave — ⏳ Pending (Phase C2)

```sql
CREATE TABLE leave_requests (
  id text PRIMARY KEY,
  student_id text NOT NULL,
  course_id text NOT NULL,
  date date NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending',
  approved_by text,
  approved_at timestamp,
  created_at timestamp DEFAULT now()
);
```

### Migration 0019: Ratings & CMS — ⏳ Pending (Phase C2)

```sql
CREATE TABLE course_ratings (
  id text PRIMARY KEY,
  student_id text NOT NULL,
  course_id text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamp DEFAULT now(),
  UNIQUE(student_id, course_id)
);

ALTER TABLE settings ADD COLUMN content_version integer DEFAULT 1;
ALTER TABLE settings ADD COLUMN content_draft jsonb;
ALTER TABLE settings ADD COLUMN published_at timestamp;
```

---

## Dependencies to Install

| Package               | Purpose                      | Phase |
| --------------------- | ---------------------------- | ----- |
| `recharts`            | Charts for reports dashboard | 4     |
| `@react-pdf/renderer` | PDF report generation        | 4     |
| `jspdf`               | Alternative PDF generation   | 4     |

All other dependencies (shadcn/ui, drizzle, better-auth, zod, next-intl, etc.) are already installed.

---

## Risk Register

| Risk                                         | Impact | Mitigation                                          |
| -------------------------------------------- | ------ | --------------------------------------------------- |
| Migration journal fix breaks existing DB     | High   | Test on staging DB first; keep backup               |
| `recharts` bundle size increase              | Medium | Dynamic import, lazy load only on Reports tab       |
| Anti-cheating measures are client-side only  | Medium | Accept limitation; server-side validation on submit |
| PDF generation adds build time               | Low    | Dynamic import; only load when export is clicked    |
| Auth flow has undocumented edge cases        | High   | Test all 4 roles × all protected routes in Phase 1  |
| Supabase Edge Functions for OTP may be flaky | Medium | Add retry logic; test with real phone numbers       |

---

_Detailed design specifications: `../lms-admin-improvement-design.md`_
_QA review report: `../qa-review-report.md`_
