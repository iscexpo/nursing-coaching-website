# IMPLEMENT.md - Gap Analysis & Remediation Plan

## Overview

This document tracks all identified gaps, issues, and missing features in the Cornia Nursing Coaching platform, organized by priority.

---

## P0: Critical Issues (9)

### 1. Middleware Role Bypass
**File:** `middleware.ts:8-13`
**Issue:** Only checks for session token presence, not user role
**Fix:**
```typescript
// Add role verification
const session = await getSession();
if (!session) return NextResponse.redirect('/login');
if (pathname.startsWith('/admin') && session.user.role !== 'admin' && session.user.role !== 'super-admin') {
  return NextResponse.redirect('/dashboard');
}
```

### 2. Exposed Environment Secrets
**File:** `.env.development.local`
**Issue:** Live Supabase keys, DB password, API keys on disk
**Fix:**
- Rotate all exposed credentials immediately
- Add `.env*.local` to `.gitignore` (verify it's there)
- Use Vercel environment variables for production secrets
- Never commit local env files

### 3. Content API Secret Leak
**File:** `app/api/content/route.ts:7-14`
**Issue:** Returns `paymentGatewayApiKey`, `paymentGatewaySecret`, `paymentGatewayWebhookSecret`
**Fix:**
```typescript
// Filter out sensitive fields before response
const { paymentGatewayApiKey, paymentGatewaySecret, paymentGatewayWebhookSecret, ...safeSettings } = settings;
```

### 4. Settings API Exposes Secrets to Admins
**File:** `app/api/settings/route.ts:12`
**Issue:** Any admin can read SMS/payment API keys
**Fix:**
```typescript
// Only return to super-admin, mask sensitive fields for regular admin
if (session.user.role === 'super-admin') {
  return NextResponse.json(settings);
}
// Return masked version
return NextResponse.json({
  ...settings,
  smsApiKey: '***',
  paymentGatewayApiKey: '***',
  paymentGatewaySecret: '***',
  paymentGatewayWebhookSecret: '***'
});
```

### 5. Students API Missing Role Check
**File:** `app/api/students/route.ts:11-39`
**Issue:** Any authenticated user can list all students
**Fix:**
```typescript
if (session.user.role !== 'admin' && session.user.role !== 'super-admin') {
  return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
}
```

### 6. Student Profile Enumeration
**File:** `app/api/students/[id]/route.ts:9-22`
**Issue:** Any user can read any student's profile by ID
**Fix:**
```typescript
// Students can only view their own profile
if (session.user.role === 'student' && session.user.id !== id) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

### 7. Unlimited Exam Attempts
**File:** `app/api/exam-submissions/route.ts:40-87`
**Issue:** No duplicate submission check
**Fix:**
```typescript
// Check for existing submission
const existing = await db.select().from(examSubmissions)
  .where(and(eq(examSubmissions.userId, userId), eq(examSubmissions.examId, examId)));
if (existing.length > 0) {
  return NextResponse.json({ error: 'Exam already submitted' }, { status: 400 });
}
```

### 8. Courses API Requires Auth
**File:** `app/api/courses/route.ts:8-11`
**Issue:** Public website can't list courses via API
**Fix:**
```typescript
// Make GET public or add separate public endpoint
export async function GET() {
  // Remove auth check for public listing
  const courses = await db.select().from(coursesTable).where(eq(coursesTable.isActive, true));
  return NextResponse.json(courses);
}
```

### 9. Exam Correct Answers Exposed
**File:** `app/api/exam-submissions/route.ts:57-68`
**Issue:** `correctIndex` fetched during submission for scoring
**Fix:**
```typescript
// Fetch only what's needed for scoring
const questions = await db.select({
  id: questionsTable.id,
  correctIndex: questionsTable.correctIndex
}).from(questionsTable).where(eq(questionsTable.examId, examId));
```

---

## P1: High Priority Issues (16)

### 10. In-Memory Rate Limiter
**File:** `lib/rate-limit.ts:3,25-57`
**Issue:** Ineffective in serverless, memory leak
**Fix:** Use Redis or database-backed rate limiting
```typescript
// Option 1: Redis (Upstash)
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

### 11. Media File Not Deleted
**File:** `app/api/media/[id]/route.ts:22`
**Issue:** Only DB record deleted, physical file remains
**Fix:**
```typescript
import { unlink } from 'fs/promises';
import { join } from 'path';

// After DB delete
const filePath = join(process.cwd(), 'public', 'media', filename);
await unlink(filePath).catch(() => {}); // Ignore if file doesn't exist
```

### 12. SMS Broadcast Simulated
**File:** `lib/sms.ts:47-82`
**Issue:** Returns success but doesn't send SMS
**Fix:** Integrate real SMS provider (Twilio, Nexmo, etc.)

### 13. Super-Admin Role Not Recognized
**Files:** Multiple APIs
**Issue:** `session.user.role === 'admin'` excludes super-admin
**Fix:** Create helper function
```typescript
// lib/permissions.ts
export function isAdmin(role: string): boolean {
  return role === 'admin' || role === 'super-admin';
}
```
Apply to:
- `app/api/enrollments/route.ts:22`
- `app/api/payments/route.ts:21`
- `app/api/invoices/route.ts:36`
- `app/api/exam-submissions/route.ts:21`
- `app/api/admit-cards/route.ts:21`
- `app/api/attendance/route.ts:26`

### 14. Model Test Page Hardcoded
**File:** `app/model-test/page.tsx:15-28`
**Issue:** Should be dynamic from database
**Fix:**
```typescript
// Query exams table for model tests
const schedule = await db.select().from(exams)
  .where(and(eq(exams.type, 'model-test'), eq(exams.isActive, true)))
  .orderBy(exams.scheduledAt);
```

### 15. Zero API Tests
**Issue:** No route handler tests
**Fix:** Create test files for all endpoints:
```
tests/api/
├── courses.test.ts
├── enrollments.test.ts
├── payments.test.ts
├── exams.test.ts
├── students.test.ts
├── notices.test.ts
└── ...
```

### 16. No Pagination Totals
**Issue:** Most endpoints return `{ data, page, limit }` without `total`
**Fix:**
```typescript
const [data, countResult] = await Promise.all([
  db.select().from(table).limit(limit).offset(offset),
  db.select({ count: count() }).from(table)
]);
return NextResponse.json({ data, page, limit, total: countResult[0].count });
```

### 17. No Export Functionality
**Issue:** `xlsx` installed but no export endpoints
**Fix:** Create export endpoints
```typescript
// app/api/students/export/route.ts
import * as XLSX from 'xlsx';

export async function GET() {
  const students = await db.select().from(user).where(eq(user.role, 'student'));
  const worksheet = XLSX.utils.json_to_sheet(students);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=students.xlsx'
    }
  });
}
```

### 18. Audit Writes Silently Fail
**Issue:** `void writeAudit()` swallows errors
**Fix:**
```typescript
// Add error logging
void writeAudit(event).catch(err => console.error('Audit write failed:', err));
```

### 19. Phone Validation Missing Pattern
**File:** `lib/validations.ts:127,134`
**Issue:** Only checks length, no format validation
**Fix:**
```typescript
phone: z.string().regex(/^\+?880[0-9]{10}$/, 'Invalid Bangladeshi phone number')
```

### 20. Slug Validation Missing Pattern
**File:** `lib/validations.ts:9`
**Issue:** No URL-safe character validation
**Fix:**
```typescript
slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
```

### 21. Media Delete Not Cascaded
**Issue:** Deleting course/exam doesn't clean up associated files
**Fix:** Add cleanup logic before deletion

### 22. No Bulk Notification
**File:** `app/api/notifications/route.ts:40`
**Issue:** Defaults to admin's own ID when no target
**Fix:** Add `targetUserIds` array parameter for bulk sends

### 23. Admission Status No Admin UI
**Issue:** Schema and API exist but no admin management tab
**Fix:** Create `app/admin/components/admissions-tab.tsx`

### 24. Results Tab Reuses Exams Component
**File:** `app/admin/page.tsx:230`
**Issue:** Same component as exams tab
**Fix:** Create dedicated results analysis component

### 25. Lifecycle Events No Admin View
**Issue:** Only students can view their own lifecycle events
**Fix:** Add admin endpoint with user ID filter

---

## P2: Medium Priority Issues (15)

### 26. No Security Headers
**File:** `next.config.mjs`
**Fix:**
```javascript
const nextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],
};
```

### 27. No CSRF Protection
**Fix:** Implement CSRF tokens or use SameSite cookies (Better Auth may handle this)

### 28. No API Documentation
**Fix:** Add OpenAPI/Swagger or inline JSDoc comments

### 29. Role Type Mismatch
**Files:** `lib/db/schema.ts:12` vs `lib/permissions.ts:11`
**Issue:** `teacher` role in permissions but not in schema
**Fix:** Add `teacher` to schema enum or remove from permissions

### 30. Duplicate Lifecycle Events
**File:** `app/api/enrollments/[id]/route.ts:106-112,128-133`
**Fix:** Remove duplicate write

### 31. No E2E Tests
**Fix:** Add Playwright/Cypress tests for critical flows

### 32. Type Mismatch in Exam Results
**File:** `app/api/exam-submissions/[id]/route.ts:29`
**Issue:** String/number type cast
**Fix:** Ensure `answers` key type matches question ID type

### 33. Dashboard Phone Null Display
**File:** `app/dashboard/page.tsx:140`
**Fix:** Add null check
```typescript
const welcomeParts = user.phoneNumber ? [`ফোন: ${user.phoneNumber}`] : [];
```

### 34. No Loading States for Admin Tabs
**Fix:** Add skeleton loaders for each tab component

### 35. Admin Fetches All Data on Load
**File:** `app/admin/page.tsx:89-104`
**Fix:** Implement lazy loading per tab

### 36. Environment Validation at Runtime Only
**File:** `instrumentation.ts:1-7`
**Fix:** Add build-time validation script

### 37. Database Connection No Validation
**File:** `lib/db/index.ts:5`
**Fix:** Validate `DATABASE_URL` before connecting

### 38. CI Lint Soft-Fail
**File:** `.github/workflows/ci.yml:25`
**Fix:** Remove `|| true`

### 39. No Minimum Test Coverage
**File:** `.github/workflows/ci.yml:29`
**Fix:**
```yaml
- name: Test
  run: pnpm test -- --coverage --coverage.reporter=text --coverage.lines=70
```

### 40. No NEXT_PUBLIC_SITE_URL
**File:** `lib/site-data.ts:4`
**Fix:** Add to `.env.example` and use `process.env.NEXT_PUBLIC_SITE_URL`

---

## Implementation Checklist

### Phase 1: Critical Security (Week 1)
- [ ] Fix middleware role verification
- [ ] Rotate exposed credentials
- [ ] Add admin guards to student APIs
- [ ] Remove secrets from content/settings responses
- [ ] Add exam attempt limits
- [ ] Make courses API public

### Phase 2: Core Functionality (Week 2)
- [ ] Implement Redis rate limiting
- [ ] Fix media file deletion
- [ ] Add super-admin role checks to all APIs
- [ ] Make model test page dynamic
- [ ] Add pagination totals
- [ ] Fix phone/slug validation

### Phase 3: Testing & Quality (Week 3)
- [ ] Write API route tests
- [ ] Add export functionality
- [ ] Create admissions admin tab
- [ ] Create results analysis tab
- [ ] Add security headers
- [ ] Fix CI lint/coverage

### Phase 4: Polish (Week 4)
- [ ] Add API documentation
- [ ] Add E2E tests
- [ ] Fix type mismatches
- [ ] Add loading states
- [ ] Optimize admin data fetching
- [ ] Add build-time env validation

---

## File Reference Index

| Issue | File | Line(s) |
|-------|------|---------|
| Middleware bypass | `middleware.ts` | 8-13 |
| Content API leak | `app/api/content/route.ts` | 7-14 |
| Settings secrets | `app/api/settings/route.ts` | 12 |
| Students API leak | `app/api/students/route.ts` | 11-39 |
| Student profile leak | `app/api/students/[id]/route.ts` | 9-22 |
| Unlimited exams | `app/api/exam-submissions/route.ts` | 40-87 |
| Courses API auth | `app/api/courses/route.ts` | 8-11 |
| Rate limiter | `lib/rate-limit.ts` | 3, 25-57 |
| Media file leak | `app/api/media/[id]/route.ts` | 22 |
| Super-admin bug | Multiple APIs | See #13 |
| Model test hardcoded | `app/model-test/page.tsx` | 15-28 |
| Security headers | `next.config.mjs` | - |
| Role mismatch | `lib/db/schema.ts`, `lib/permissions.ts` | 12, 11 |
| CI lint fail | `.github/workflows/ci.yml` | 25 |
| Test coverage | `.github/workflows/ci.yml` | 29 |
