# ISC Expo LMS — Comprehensive Improvement Design

> **Date:** 2026-07-22
> **Status:** Design Document
> **Scope:** Admin UI, LMS Core Logic, Security, UX, Testing

---

## Table of Contents

1. [Critical Blockers (P0)](#1-critical-blockers-p0)
2. [Admin UI Improvements](#2-admin-ui-improvements)
3. [LMS Core Logic Enhancements](#3-lms-core-logic-enhancements)
4. [Student Dashboard Improvements](#4-student-dashboard-improvements)
5. [Security Hardening](#5-security-hardening)
6. [Testing Strategy](#6-testing-strategy)
7. [Implementation Roadmap](#7-implementation-roadmap)

---

## 1. Critical Blockers (P0)

### 1.1 Fix Migration Journal Drift

**Problem:** `lib/db/migrations/meta/_journal.json` only lists migrations 0000 and 0001, but the app expects through migration 0014. This breaks `user.admission_id` and all auth-related features.

**Fix:**
```
Rebuild the migration journal to include all 15 migration files (0000–0014).
Each entry must map to the correct SQL file hash.
```

**Files to modify:**
- `lib/db/migrations/meta/_journal.json`

### 1.2 Verify Auth Flow End-to-End

After fixing the journal, verify:
- Email+password sign-in returns 200
- Session token is set in cookie
- Middleware allows access to `/admin` and `/dashboard`
- Phone+OTP flow works via Supabase Edge Functions

---

## 2. Admin UI Improvements

### 2.1 Overview Dashboard Enhancement

**Current:** Basic stat cards + recent enrollments + pending payments.

**Proposed:**
- Add **revenue trend chart** (7-day, 30-day, 90-day) using a lightweight chart library (e.g., `recharts` or `chart.js` via dynamic import)
- Add **enrollment trend sparkline** per active course
- Add **quick action buttons**: "Create Exam", "Send SMS", "Approve Pending Payments"
- Add **pending items notification bell** with badge count (currently only shown in tab badges)
- Add **today's attendance summary** card
- Add **upcoming exams** card

### 2.2 Data Table Component (`components/ui/data-table.tsx`)

**Current:** Basic table rendering.

**Proposed Enhancements:**
- **Column sorting** (client-side, toggle ascending/descending)
- **Column filtering** (text search per column)
- **Row selection** with bulk actions (delete selected, export selected, approve selected)
- **Pagination** with page size selector (10, 25, 50, 100)
- **CSV/Excel export** button per table (already have export endpoints)
- **Column visibility toggle** for users to show/hide columns
- **Sticky header** for long tables
- **Empty state** with illustration and CTA when no data
- **Loading skeleton** during fetch

### 2.3 Form Improvements Across All Admin Tabs

**Current:** Inconsistent form patterns; some use `window.confirm` for destructive actions; inline validation is missing.

**Proposed:**
- **Unified form component** (`components/ui/form-field.tsx`) with:
  - Label + required indicator
  - Input + error message below
  - Help text (optional)
  - Disabled state
- **Consistent validation display:**
  - Show field-level errors below each field
  - Show form-level errors at the top in a `Alert` component
  - Remove all `window.confirm()` usage — replace with a `ConfirmDialog` modal component
- **Optimistic UI updates** for save/update/delete operations
- **Unsaved changes warning** when navigating away from a dirty form
- **Keyboard shortcuts:** `Ctrl+S` to save, `Esc` to cancel

### 2.4 Tab-Specific Improvements

#### Courses Tab
- **Drag-and-drop reordering** for course display order
- **Bulk import** from CSV/Excel
- **Course cloning** (duplicate a course with all settings)
- **Image preview** in the course list (currently only shown in form)
- **Category tabs** with counts (All / Icon / Cornea)

#### Enrollments Tab
- **Status workflow visualization** (pending → approved → active → completed/expired)
- **Bulk approve/reject** with multi-select
- **Enrollment notes** (admin-only internal notes per enrollment)
- **Filter by date range** (enrollment date)
- **Filter by course** dropdown
- **Student quick-view** (hover card showing student profile)

#### Payments Tab
- **Payment verification workflow** with approve/reject buttons in each row
- **Transaction ID lookup** (search by transaction ID)
- **Payment method filter** (bKash, Nagad, Cash, Bank)
- **Date range filter**
- **Bulk verification** for cash payments
- **Payment receipt generation** (PDF with institution branding)
- **Export to CSV** button

#### Exams Tab
- **Exam status badges** (draft, active, completed, archived)
- **Question count** per exam
- **Submission count** per exam
- **Quick-create exam** wizard (step-by-step: title → subject → duration → add questions)
- **Import questions** from CSV
- **Exam preview** (see what students will see)
- **Clone exam** functionality

#### Question Bank Tab
- **Search/filter** by subject, difficulty, keyword
- **Bulk import** from CSV
- **Question preview** (render the question with options)
- **Duplicate question** button
- **Usage tracking** (which exams use this question)

#### Students Tab
- **Advanced search** (name, phone, email, student ID)
- **Filter by enrollment status** (active, inactive, never enrolled)
- **Student profile modal** (click to see full profile without leaving the list)
- **Bulk SMS** to filtered students
- **Export filtered results**
- **Student lifecycle timeline** view

#### Teachers Tab
- **Teacher assignment** to courses/subjects
- **Teacher schedule** view
- **Performance metrics** (if attendance tracking includes teacher marking)

#### Attendance Tab
- **Calendar view** (monthly grid showing attendance per day)
- **Batch attendance marking** (mark all students for a date)
- **Attendance statistics** per student (present %, absent %, late %)
- **Export attendance** report

#### Admit Cards Tab
- **Template editor** (customize admit card layout)
- **Bulk generate** admit cards for an exam
- **PDF export** per card
- **Print preview**
- **Regenerate** (if seat numbers change)

#### Reports Tab
- **Interactive charts** (not just numbers):
  - Revenue over time (line chart)
  - Enrollment distribution (pie chart)
  - Attendance heatmap (calendar)
  - Exam score distribution (histogram)
- **Date range picker** for all reports
- **Export to PDF** for each report section
- **Scheduled reports** (daily/weekly email to admin)

#### Settings Tab
- **Tabbed sub-sections** (General, SMS, Payment, CMS, Security)
- **Live preview** for CMS content changes
- **Test SMS** button (send test message to admin phone)
- **Environment status** indicator (show which env vars are configured)

### 2.5 UI/UX Polish

#### Loading States
- Replace bare text with **skeleton placeholders** for all tab content
- Show **progress indicators** for multi-step operations
- Add **skeleton rows** for table loading

#### Error States
- Show **error cards** with retry buttons (not just empty text)
- **Toast notifications** for all async operations (already using `useToast`, ensure consistency)
- **Error boundaries** per tab (not just global)

#### Empty States
- Every list view should have an **illustration + CTA** when empty
- Example: "No courses yet. Create your first course →"

#### Dark Mode
- Verify all new components work in dark mode
- Test color contrast ratios for accessibility

#### Responsive Design
- Admin dashboard should be usable on tablet (1024px+)
- Tables should be horizontally scrollable on smaller screens
- Forms should stack vertically on mobile

---

## 3. LMS Core Logic Enhancements

### 3.1 Enrollment Lifecycle

**Current:** Simple status enum (pending, approved, active, rejected).

**Proposed Workflow:**
```
pending → approved → active → completed
pending → rejected
active → suspended (with reason)
active → expired (auto after course end date)
suspended → active (reinstated)
```

**New Fields:**
- `enrollments.approvedAt` (timestamp)
- `enrollments.startedAt` (timestamp)
- `enrollments.completedAt` (timestamp)
- `enrollments.expiresAt` (timestamp)
- `enrollments.suspendedReason` (text)
- `enrollments.completionPercentage` (integer, 0-100)

**Business Rules:**
- Auto-expire enrollments past their end date
- Send notification on status change
- Track enrollment duration for reports
- Allow partial completion tracking

### 3.2 Payment System Enhancements

#### Invoice Auto-Generation
- When enrollment is approved, auto-generate an invoice
- Support installment plans (partial payments over time)
- Auto-calculate due amounts

#### Payment Reconciliation
- Match payments to invoices automatically
- Support partial payments
- Track payment history per enrollment
- Overpayment detection and handling

#### Refund Workflow
- Allow admins to process refunds
- Track refund status
- Generate refund receipts
- Update enrollment status on full refund

#### Payment Gateway Integration
- Currently manual (user sends money, provides transaction ID)
- Future: Direct bKash/Nagad API integration for verification
- Add webhook endpoint for payment confirmations

### 3.3 Exam System Enhancements

#### Exam Types
- **Model Test** (current implementation)
- **Practice Quiz** (unlimited attempts, no timer)
- **Final Exam** (strict timing, one attempt)
- **Subject-wise Test** (per subject assessment)

#### Question Features
- **Question bank pooling** (random questions from a pool per exam)
- **Question difficulty levels** (easy, medium, hard)
- **Question weight/scoring** (different points per question)
- **Negative marking** support
- **Question explanation** (shown after submission)

#### Exam Features
- **Anti-cheating measures:**
  - Tab-switch detection
  - Fullscreen mode enforcement
  - Randomized question order per student
  - Randomized option order per question
- **Auto-submit** when timer expires (current: already implemented)
- **Exam scheduling** (start time + end time window)
- **Exam results analytics** (class average, percentile, standard deviation)
- **Answer key release** (admin controls when answers are visible)

#### Results
- **Ranking system** across all students in an exam
- **Percentile calculation**
- **Grade assignment** (A+, A, B+, B, C+, C, D, F)
- **Performance tracking** over time (student's score trend)
- **Subject-wise breakdown** in results

### 3.4 Attendance System Enhancements

#### Marking Methods
- **Manual** (admin/teacher marks each student)
- **QR Code** (student scans QR at class start)
- **Geofencing** (optional, requires location permission)

#### Business Rules
- Auto-mark absent after a threshold (e.g., 15 minutes late = absent)
- Attendance percentage calculation for admit card eligibility
- Alert if attendance drops below threshold (e.g., 75%)
- Monthly attendance report auto-generation

#### Calendar Integration
- Sync class schedule with attendance
- Holiday management
- Leave request system (student requests, admin approves)

### 3.5 Notification System Enhancements

**Current:** Basic notifications stored in DB.

**Proposed:**
- **Notification templates** (enrollment confirmation, payment received, exam reminder, etc.)
- **Multi-channel delivery:**
  - In-app notification (current)
  - SMS notification (integrate with existing SMS providers)
  - Email notification (future)
  - WhatsApp notification (future, already have floating WhatsApp button)
- **Notification preferences** per user
- **Scheduled notifications** (send exam reminder 24h before)
- **Notification groups** (all students, specific course students, specific enrollment status)

### 3.6 Report Generation

**Current:** Basic stats in the Reports tab.

**Proposed Reports:**
1. **Student Report Card** — enrollment, attendance, exam scores, payment status
2. **Financial Report** — revenue, pending payments, refunds, installment tracking
3. **Attendance Report** — daily/weekly/monthly, per course, per student
4. **Exam Performance Report** — score distribution, rank, improvement over time
5. **Enrollment Report** — new enrollments over time, course popularity, conversion rate
6. **SMS Report** — messages sent, delivery status, cost tracking

**Export Formats:**
- CSV (current)
- Excel (current)
- PDF (new — using a library like `@react-pdf/renderer` or `jspdf`)

### 3.7 CMS Content Management

**Current:** JSONB-based CMS content in settings table.

**Proposed:**
- **Visual editor** for homepage sections
- **Content versioning** (save drafts, publish, rollback)
- **Image management** (upload, crop, resize for each section)
- **Preview mode** (see changes before publishing)
- **Content scheduling** (publish/unpublish on specific dates)

---

## 4. Student Dashboard Improvements

### 4.1 Enhanced Overview
- **Progress tracker** for each enrolled course
- **Upcoming deadlines** (exams, payment due dates)
- **Achievement badges** (first exam, perfect score, etc.)
- **Quick links** to frequently used features

### 4.2 Course Experience
- **Course material viewer** (notes, slides, videos)
- **Progress tracking** (chapters completed, time spent)
- **Course ratings** (student can rate after completion)
- **Course discussion** (Q&A with teachers)

### 4.3 Payment Experience
- **Payment reminders** (upcoming due dates)
- **Auto-pay option** (future)
- **Payment receipt download**
- **Installment tracker** (visual progress bar)

### 4.4 Results Experience
- **Detailed answer review** (see correct/incorrect for each question)
- **Performance comparison** (class average, top scorer)
- **Score trend graph** (line chart of exam scores over time)
- **Download result as PDF**

### 4.5 Admit Card Experience
- **Download as PDF**
- **Share via WhatsApp/SMS**
- **Add to calendar** (exam date/time)
- **QR code** on admit card for quick check-in

---

## 5. Security Hardening

### 5.1 File Upload Security
**Current:** MIME allowlist + magic byte checking.

**Enhancement:**
- Add **virus scanning** (ClamAV integration or cloud-based)
- Store uploads **outside web root** with signed URLs
- **Image-only** restriction for profile pictures
- **File size limits** per role (admin can upload larger files)
- **Audit log** for all file uploads/deletions

### 5.2 API Security
- Add **CSRF tokens** for state-changing requests
- Add **request ID** for tracing
- Add **API versioning** (e.g., `/api/v1/...`)
- **IP whitelisting** for admin API (optional)
- **API key authentication** for external integrations

### 5.3 Session Security
- Implement **session invalidation** on password change
- Add **concurrent session limit** (max 3 active sessions)
- Add **session activity log** (last IP, device, timestamp)
- **Force logout** from all devices

### 5.4 Data Protection
- **Encrypt sensitive fields** at rest (phone numbers, payment transaction IDs)
- **Data masking** in logs (phone: `01XXXXXXXXX`)
- **GDPR-like data export** for students (all their data in JSON)
- **Right to deletion** (anonymize student data on request)

---

## 6. Testing Strategy

### 6.1 Unit Tests (Vitest)
Expand from 8 to ~30 test files:

| Area | Test Files | Coverage Target |
|------|-----------|----------------|
| Auth | `auth.test.ts` | Login, logout, session, OTP |
| RBAC | `permissions.test.ts` | All role-permission combos |
| Enrollment | `enrollment.test.ts` | Status transitions, validation |
| Payment | `payment.test.ts` | Methods, verification, refunds |
| Exam | `exam.test.ts` | Creation, submission, scoring |
| Attendance | `attendance.test.ts` | Marking, percentage calc |
| Notification | `notification.test.ts` | Creation, delivery, read status |
| Validation | `validations.test.ts` | All Zod schemas |
| CMS | `cms.test.ts` | Content merging, defaults |
| SMS | (existing 3 files) | Add edge cases |

### 6.2 E2E Tests (Playwright)
Expand from 8 to ~15 test files:

| Flow | Coverage |
|------|----------|
| Full enrollment lifecycle | Sign up → enroll → pay → approve → active |
| Exam flow | Create exam → add questions → student takes exam → results |
| Payment flow | Submit payment → verify → invoice update |
| Attendance flow | Mark attendance → check report |
| SMS flow | Send SMS → verify delivery |
| Admin CRUD | All 22 tabs with happy paths |
| Error handling | Invalid inputs, network failures, auth expiry |

### 6.3 Integration Tests
- API endpoint testing (all 55+ routes)
- Database operation testing (Drizzle queries)
- Auth middleware testing
- File upload/download testing

### 6.4 Accessibility Tests
- axe-core integration (already in E2E)
- Keyboard navigation testing
- Screen reader compatibility
- Color contrast verification

---

## 7. Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)
- [ ] Fix migration journal drift
- [ ] Verify auth flow end-to-end
- [ ] Run existing unit tests
- [ ] Fix any failing tests
- [ ] Add error boundaries to admin tabs

### Phase 2: Admin UI Core (Weeks 2-3)
- [ ] Enhanced data table (sorting, filtering, pagination, bulk actions)
- [ ] Unified form component with validation
- [ ] ConfirmDialog component (replace window.confirm)
- [ ] Loading skeletons for all tabs
- [ ] Empty state components for all lists
- [ ] Toast notifications for all async operations

### Phase 3: LMS Logic (Weeks 3-4)
- [ ] Enrollment lifecycle enhancement
- [ ] Payment invoice auto-generation
- [ ] Exam system improvements (types, question features)
- [ ] Attendance calendar view
- [ ] Notification templates

### Phase 4: Reports & Analytics (Week 5)
- [ ] Interactive charts (recharts integration)
- [ ] Date range picker component
- [ ] PDF export for reports
- [ ] Student report card generation

### Phase 5: Security & Testing (Week 6)
- [ ] CSRF protection
- [ ] Session security enhancements
- [ ] File upload hardening
- [ ] Unit test expansion (8 → 30)
- [ ] E2E test expansion (8 → 15)
- [ ] API integration tests

### Phase 6: Polish & Launch (Week 7)
- [ ] Dark mode verification
- [ ] Responsive testing
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Documentation updates
- [ ] CI/CD pipeline verification
- [ ] Production deployment checklist

---

## Appendix A: New Components to Create

| Component | Purpose | Location |
|-----------|---------|----------|
| `ConfirmDialog` | Replace window.confirm | `components/ui/confirm-dialog.tsx` |
| `FormField` | Consistent form field wrapper | `components/ui/form-field.tsx` |
| `DataTable` (enhanced) | Sorting, filtering, pagination | `components/ui/data-table.tsx` |
| `ChartCard` | Chart wrapper with title | `components/ui/chart-card.tsx` |
| `DateRangePicker` | Date range selection | `components/ui/date-range-picker.tsx` |
| `Badge` (enhanced) | More color variants | `components/ui/badges.tsx` |
| `Alert` | Error/info display | `components/ui/alert.tsx` |
| `EmptyState` | Illustration + CTA | `components/ui/empty-state.tsx` |
| `SkeletonTable` | Table loading skeleton | `components/ui/skeleton.tsx` |
| `StudentProfileModal` | Quick-view student profile | `app/admin/components/student-profile-modal.tsx` |
| `PaymentReceipt` | PDF payment receipt | `components/payment-receipt.tsx` |
| `AdmitCardPDF` | PDF admit card | `components/admit-card-pdf.tsx` |
| `CalendarView` | Monthly calendar grid | `components/ui/calendar-view.tsx` |

## Appendix B: New API Endpoints to Create

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/enrollments/[id]/approve` | POST | Approve enrollment + auto-generate invoice |
| `/api/enrollments/[id]/suspend` | POST | Suspend enrollment |
| `/api/enrollments/[id]/complete` | POST | Mark enrollment complete |
| `/api/payments/[id]/verify` | POST | Verify payment + update invoice |
| `/api/payments/[id]/refund` | POST | Process refund |
| `/api/exams/[id]/clone` | POST | Duplicate exam |
| `/api/questions/import` | POST | Bulk import questions |
| `/api/exams/[id]/results/analytics` | GET | Exam analytics |
| `/api/reports/enrollment` | GET | Enrollment report data |
| `/api/reports/revenue` | GET | Revenue report data |
| `/api/reports/attendance` | GET | Attendance report data |
| `/api/notifications/templates` | GET/POST | Notification templates |
| `/api/notifications/scheduled` | GET/POST | Scheduled notifications |
| `/api/attendance/calendar` | GET | Calendar view data |
| `/api/students/[id]/lifecycle` | GET | Student lifecycle timeline |
| `/api/admin/audit-logs` | GET | Audit log viewer |
| `/api/reports/export/[type]` | GET | PDF report export |

## Appendix C: Database Schema Additions

```sql
-- Enrollment lifecycle
ALTER TABLE enrollments ADD COLUMN approved_at timestamp;
ALTER TABLE enrollments ADD COLUMN started_at timestamp;
ALTER TABLE enrollments ADD COLUMN completed_at timestamp;
ALTER TABLE enrollments ADD COLUMN expires_at timestamp;
ALTER TABLE enrollments ADD COLUMN suspended_reason text;
ALTER TABLE enrollments ADD COLUMN completion_percentage integer DEFAULT 0;

-- Exam enhancements
ALTER TABLE exams ADD COLUMN exam_type text DEFAULT 'model_test';
ALTER TABLE exams ADD COLUMN start_time timestamp;
ALTER TABLE exams ADD COLUMN end_time timestamp;
ALTER TABLE exams ADD COLUMN allow_review boolean DEFAULT true;
ALTER TABLE exams ADD COLUMN negative_marking boolean DEFAULT false;
ALTER TABLE exams ADD COLUMN shuffle_questions boolean DEFAULT true;
ALTER TABLE exams ADD COLUMN shuffle_options boolean DEFAULT true;

-- Question enhancements
ALTER TABLE questions ADD COLUMN difficulty text DEFAULT 'medium';
ALTER TABLE questions ADD COLUMN points integer DEFAULT 1;
ALTER TABLE questions ADD COLUMN explanation text;

-- Notification templates
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

-- Scheduled notifications
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

-- Session activity log
ALTER TABLE session ADD COLUMN ip_address text;
ALTER TABLE session ADD COLUMN user_agent text;
ALTER TABLE session ADD COLUMN last_active_at timestamp;

-- Leave requests
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

-- Course ratings
CREATE TABLE course_ratings (
  id text PRIMARY KEY,
  student_id text NOT NULL,
  course_id text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamp DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Content versioning
ALTER TABLE settings ADD COLUMN content_version integer DEFAULT 1;
ALTER TABLE settings ADD COLUMN content_draft jsonb;
ALTER TABLE settings ADD COLUMN published_at timestamp;
```

---

*This document serves as the master improvement plan for the ISC Expo LMS. Each phase should be reviewed and prioritized based on business needs and available resources.*
