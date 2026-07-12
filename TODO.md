# Repository Audit — Nursing Coaching Website

> Score: **64/100** — a strong MVP / feature-rich institutional portal, but not yet an enterprise-grade coaching platform.

## 1. Executive Summary

This repository is not a weak project; it is a solid, well-structured MVP for a coaching institute website with student/admin workflows. The current implementation already demonstrates a credible foundation:
- A Next.js App Router application with public marketing pages, admission flow, dashboard, and admin console
- Better Auth-based authentication
- Drizzle ORM + PostgreSQL schema
- Role-based UI for student and admin experiences
- Basic CMS-like content configuration and settings persistence

However, it is not yet an enterprise coaching platform. It is closer to a "feature-rich institutional website + management portal" than to a scalable education SaaS. The biggest issues are not missing "one feature"; they are structural:
- The system lacks a true enterprise CMS and content workflow
- The admin experience is still a monolithic tabbed UI rather than an operational platform
- Security, auditability, and governance are underdeveloped
- The database model is good for MVP but insufficient for multi-campus, multi-role, analytics-driven operations
- There is no serious deployment, monitoring, backup, or CI/CD maturity
- The product is still heavily dependent on manual admin operations and lacks automation

This is a strong foundation for Phase 2 growth, but not yet investment-grade enterprise software.

---

## 1.1 Implementation Phase (updated 2026-07-12)

Tracking current security, audit, and governance work in progress.

### Completed
- [x] Audit logging foundation: `lib/db/schema.ts`, `lib/db/migrations/0005_audit_logs.sql`
- [x] Audit helper and types: `lib/audit.ts`
- [x] Route-side rate limiting helper: `lib/rate-limit.ts`
- [x] Audit log writes for `contact`, `admission`, `settings`, `students`, and `payments`
- [x] Rate limiting on auth, public form, and student creation endpoints
- [x] Basic validation: `pnpm exec tsc --noEmit`

### In progress
- [ ] Extend audit coverage to remaining admin mutation endpoints
- [ ] Enforce rate limits consistently across all sensitive API routes
- [ ] Add targeted tests for audit persistence and rate limiting behavior
- [ ] Commit and document the current implementation phase

### Priority
1. Finish audit wiring for admin/student/settings/payment actions
2. Harden rate limiting across auth and public submission routes
3. Add regression tests for the new security controls

### Backlog (not started)
- Enterprise CMS (Payload/Directus), full admissions lifecycle, payments/refunds workflows, analytics, multi-campus, client-side permission-based UI gating.

---

## 2. Architecture Review

### What is working well
- App Router is correctly used in `app`
- There is a clear split between public pages, student dashboard, and admin panel
- Server components are used for marketing pages
- Client components are used where interactive auth and panels are needed
- Middleware protects route groups in `middleware.ts`
- Auth is centralized in `auth.ts`
- DB access is centralized in `index.ts`

### Architectural strengths
- Clear route separation:
  - Public site
  - Student portal
  - Admin portal
- Reusable UI components exist in `ui`
- A content layer exists in `content-cms.ts`
- Settings persistence exists in `route.ts`

### Architectural weaknesses
- The app is still "page-centric" rather than "domain-centric." Business logic is spread across pages, components, and route handlers.
- The admin and dashboard pages behave like large feature assemblers rather than modular domain modules.
- There is no domain service layer. API logic and business rules are not well isolated.
- State management is ad hoc. Data is fetched directly per page rather than through a robust client/server data architecture.
- There is no clear boundary between "website content" and "operational data." This is a major issue for enterprise growth.
- There is no multi-tenant or multi-campus architecture yet.

### Recommended architecture
For the next stage, I recommend a layered architecture:

- **Apps**
  - `app` for the public-facing Next.js experience
  - A separate admin application or route-based admin district with stronger RBAC
  - A headless CMS service for content and management

- **Core modules**
  - Auth domain
  - Student lifecycle domain
  - Course delivery domain
  - Admissions domain
  - Payments domain
  - Communication domain
  - Analytics domain

- **Infrastructure**
  - PostgreSQL for relational data
  - Object storage for media
  - Redis for caching and queues
  - Background jobs for email/SMS/WhatsApp/webhooks
  - Observability via Sentry + OpenTelemetry

---

## 3. Folder Review

### app
This is the main application shell. It is organized well for a small-to-medium project.

Strengths:
- Clear route-level organization
- Good separation between public, auth, dashboard, admin, and api

Weaknesses:
- The api tree is large and unstructured from a domain perspective
- API routes are mixed with content routes and portal routes
- The admin and dashboard pages are too large and should be split into domain-driven modules

### components
Good component separation exists, especially for reusable UI.

Strengths:
- Shared UI elements are centralized
- Homepage sections are isolated

Weaknesses:
- There is still a lot of page-level logic embedded in sections
- Some components likely mix presentation with data-fetching concerns
- There is duplication between public data and DB-driven data

### lib
This is one of the healthier parts of the codebase.

Strengths:
- Centralized auth, validation, permissions, content, settings, DB access
- Good use of shared utilities

Weaknesses:
- The domain logic is still thin and not yet modular
- The current CMS implementation in `content-cms.ts` is too simple for enterprise needs

### scripts
Useful bootstrapping scripts exist, but they are operationally risky.

Weaknesses:
- Seed scripts can expose default credentials and create security hazards
- There are multiple admin bootstrapping paths

### tests
There is a test suite, which is positive.

Weaknesses:
- Tests appear focused on utility and validation logic, not end-to-end auth, RBAC, payment flows, or admission journeys

---

## 4. Component Review

### Public components
- `hero.tsx`: good marketing structure
- `courses.tsx`: good use of DB-backed course cards
- `faq.tsx`: good trust-building section
- `contact.tsx`: good conversion point

What is good:
- The UI is polished and consistent
- The hero section and conversion blocks are strong
- The use of the shared header/footer improves consistency

What is missing:
- No robust page-builder or section reordering
- No reusable content blocks with drag-and-drop editing
- No conversion optimization flows such as sticky CTA, social proof, urgency, lead magnets

### Admin and dashboard components
These are strong as starter dashboards but weak as enterprise management surfaces.

Problems:
- Large monolithic page components
- Too much data fetching and render logic in one file
- Limited role-based view granularity
- Weak bulk actions and workflow states
- No modular "workspaces" and "tasks"

### Reusability
The project does have reusable UI primitives, but the business logic is not abstracted enough.

---

## 5. Code Quality

### Positives
- TypeScript is used broadly
- Zod schemas are used for validation
- The codebase uses shared modules and avoids some obvious duplication
- The use of Drizzle is modern and maintainable

### Negatives
- The codebase shows signs of "prototype-to-product" growth. Several parts are functional but not fully architected.
- There is duplicated bootstrapping logic around admin creation.
- The admin page is a large client component with many responsibilities.
- There is no formal service layer for domain operations.
- Error handling is basic and inconsistent.
- The project lacks realistic domain abstractions such as:
  - admissions service
  - enrollments service
  - payments service
  - communications service
  - analytics service

### Dead code / unused code risks
- Some static data in `site-data.ts` may be redundant with DB-driven content
- Some seed scripts may become obsolete once the CMS is introduced
- The project likely needs a cleanup pass to remove legacy or redundant patterns

### Recommended code quality improvements
- Introduce domain services under `lib/services` or `lib/domain`
- Introduce request/response DTOs and mapper layers
- Add a shared API client layer
- Add form abstractions and reusable modals
- Enforce linting and formatting in CI

---

## 6. Security Review

### Current security posture
The project has a decent basis, but it is not yet enterprise-safe.

### Strengths
- Authentication is centralized through Better Auth
- Middleware protects route groups
- Role checks are present in several API routes
- Secret-like values are stored in environment variables rather than hardcoded

### Critical weaknesses
1. **OTP fallback logs OTP codes to the console in `auth.ts`**
   - Why it matters: This is a serious security and privacy issue.
   - Fix: Never log OTPs in production. Use secure notification backends only.

2. **Admin seed routes and scripts expose bootstrap credentials**
   - Evidence: `route.ts`, `seed-demo-admin.ts`
   - Why it matters: These can become attack surfaces and create credential leakage.
   - Fix: Remove seed endpoints from production builds, gate them behind explicit dev-only flags, and rotate credentials.

3. **No visible rate limiting**
   - Why it matters: Login, OTP, contact forms, and admission endpoints can be abused.
   - Fix: Add middleware-based rate limiting and per-route throttling.

4. **No clear audit trail**
   - Why it matters: You cannot trust operational workflows without logs of who changed what and when.
   - Fix: Add audit logs for admissions, payments, course changes, user role changes, settings changes, and content edits.

5. **Limited RBAC sophistication**
   - Why it matters: The current model is likely too simple for large teams and multi-campus operations.
   - Fix: Introduce fine-grained permissions such as:
     - `course.manage`
     - `payment.verify`
     - `student.view`
     - `student.export`
     - `content.publish`
     - `branch.manage`

6. **No visible CSRF protection strategy**
   - Why it matters: State-changing operations should be protected.
   - Fix: Use verified cookie/session mechanisms and strict origin checks, especially for forms and admin actions.

### Security roadmap
- Add rate limiting
- Add secure logging
- Add audit logs
- Add release-time secret scanning
- Add env validation
- Add file upload restrictions if media uploads are introduced
- Add MFA for admin accounts

---

## 7. Performance Review

### What is good
- The app uses server components where appropriate
- The layout is lightweight
- Public pages are not overburdened with client-side logic

### Major performance issues
1. **Images are explicitly unoptimized in `next.config.mjs`**
   - Why it matters: This hurts performance and Core Web Vitals.
   - Fix: Use optimized image loading with remote patterns and proper sizes.

2. **The home page is forced dynamic in `page.tsx`**
   - Why it matters: It prevents static caching and reduces performance.
   - Fix: Use SSG/ISR for course and notice data where freshness is not immediate.

3. **No visible caching strategy for APIs**
   - Why it matters: Repeated fetches and no revalidation will cause unnecessary DB load.
   - Fix: Add route-level caching, revalidation, and CDN-friendly patterns.

4. **No explicit bundle analysis or lazy loading strategy**
   - Why it matters: Admin dashboards can become heavy.
   - Fix: Use code-splitting and lazy-load large panels and charts.

### Performance recommendations
- Introduce ISR/SSG for public content
- Add image optimization and responsive images
- Use Suspense boundaries
- Add caching headers for public content
- Add database query optimization and indexes
- Add Redis for session and frequently used read models

---

## 8. SEO Review

### Current state
The project already has a good baseline for a local educational site, but it is not yet enterprise SEO-ready.

### Strengths
- Metadata is defined in `layout.tsx`
- The site uses semantic section structure and a good public page architecture

### Major SEO gaps
1. No sitemap
2. No robots file
3. No canonical tags per route
4. No schema.org markup
5. No Open Graph images
6. No dynamic metadata per course/notice/admission page
7. No breadcrumb implementation
8. No structured data for courses, FAQs, organization, local business
9. No programmatic SEO for course pages and location-based landing pages

### Recommended SEO architecture
- Add `app/sitemap.ts`
- Add `app/robots.ts`
- Add JSON-LD:
  - Organization
  - LocalBusiness
  - Course
  - FAQPage
  - BreadcrumbList
- Create dynamic metadata for:
  - each course
  - each notice
  - each exam
  - each admission category
- Add canonical URLs and hreflang if multilingual is planned

---

## 9. CMS Review

### Current verdict
The current project does not yet have a proper enterprise CMS.

### What exists today
- A lightweight content configuration system in `content-cms.ts`
- A settings table in `schema.ts`
- Some DB-backed content like courses, notices, exams, admissions

### Why this is insufficient
- It is not a real content management workflow
- There is no media library
- No page builder
- No publishing workflow
- No role-based editorial governance
- No content revision history
- No SEO management layer
- No content scheduling
- No multi-language support

### Enterprise CMS recommendation
I recommend a headless CMS layer, ideally:
- **Payload CMS** for a Next.js-native, TypeScript-first solution
- Or **Directus** if you want a faster admin UI with strong relational capabilities

### Recommended CMS modules
- Dashboard
- Role management
- Permissions
- Media library
- File manager
- SEO manager
- Page builder
- Navigation builder
- Homepage builder
- Landing page builder
- Announcement system
- Notification system
- Course management
- Teacher management
- Student management
- Gallery
- Blog
- FAQ
- Testimonials
- Events
- Popup manager
- Forms
- Leads
- Contact messages
- Email templates
- WhatsApp templates
- Banner management
- Hero slider
- Notice board
- Result publishing
- Routine
- Class schedule
- Admission circular
- Downloads
- Question bank
- Mock tests
- Study materials
- PDF library
- Video library
- Recorded classes
- Live class links
- Assignments
- Attendance
- Certificates
- ID cards
- Payments
- Invoices
- Coupons
- Referral system
- Branches
- Franchise management
- Analytics
- Activity logs
- Audit logs
- Backup/restore
- Settings
- Theme customization
- Menu builder
- Footer builder
- Widget builder
- API manager
- Webhook manager
- Localization
- Multi-language
- Multi-campus support

---

## 10. Missing Features

### Critical
- Enterprise CMS
- Real RBAC and permissions matrix
- Audit logs
- Backup/restore
- Media library and uploads
- Advanced SEO architecture
- Role-based admin workflows
- Notification engine for SMS/WhatsApp/email
- Payment reconciliation and refund workflows
- Student lifecycle and progress tracking

### High
- Online admission workflow with status tracking
- Student portal with assignments, progress, certificates
- Teacher portal
- Guardian portal
- Live class and recorded class system
- Exam analytics and leaderboards
- Lead and CRM pipeline
- Branch/franchise management
- Localization and multi-language support

### Medium
- AI tutor and question generation
- Knowledge base and support tickets
- Community/forum features
- Gamification
- Referral rewards
- Coupon system
- Course comparison/wishlist/bookmarks

### Low
- Dark mode
- Advanced animations
- Mobile app companion
- PWA support

---

## 11. Recommended Features

### Admission and student lifecycle
- Online admission
- Application status tracking
- Merit list
- Waiting list
- Document upload
- Admission counseling booking
- Fee installment planning
- Student onboarding checklist

### Learning and assessment
- Online exam with CBT
- OMR-style practice
- Quiz engine
- Leaderboards
- Study planner
- Assignment submission
- Discussion forum
- Doubt solving board
- AI tutor
- AI notes generator
- AI question generator
- AI study planner

### Communications
- SMS notifications
- WhatsApp templates
- Email automation
- Push notifications
- Parent/guardian alerts

### Payments
- SSLCommerz
- bKash
- Nagad
- Rocket
- Stripe
- Wallet
- Subscription plans
- Membership tiers
- Coupons and discounts
- Refund workflow

### Student engagement
- Certificates
- Digital verification
- Badges
- Rankings
- Achievements
- Bookmarks
- Wishlist
- Career counseling
- Live chat
- Support ticket system
- Feedback system
- Complaint system

---

## 12. Database Improvements

### Current schema strengths
- The schema in `schema.ts` is already a good foundation
- It includes users, courses, enrollments, payments, notices, exams, exam submissions, attendance, and admit cards

### Major limitations
- The schema is still centered around one institution and one campus
- It lacks many business entities needed for enterprise operations
- It uses JSONB for several fields, which is acceptable for flexibility but poor for queryability and integrity

### Recommended tables
- branches
- campuses
- batches
- course_modules
- lessons
- lesson_materials
- schedules
- classrooms
- live_class_sessions
- assignments
- submissions
- certificates
- coupons
- referrals
- transactions
- refunds
- leads
- campaigns
- communications
- templates
- media_files
- page_blocks
- posts
- comments
- testimonials
- faqs
- events
- popup_campaigns
- analytics_events
- audit_logs
- api_keys
- webhooks
- subscriptions
- memberships

### Recommended schema improvements
- Use UUIDs instead of plain text IDs
- Add soft delete columns
- Add `created_by`, `updated_by`, `deleted_at`
- Add status history tables
- Add indexes on:
  - slug
  - status
  - created_at
  - user_id
  - branch_id
  - course_id
  - payment_status
- Normalize JSONB-heavy fields into relational tables where possible

### Recommended database architecture
- PostgreSQL as primary relational store
- Object storage for media
- Redis for caching and queues
- Optional analytics warehouse later

---

## 13. API Improvements

### Current state
The API surface is functional, but it is too thin and inconsistent for enterprise use.

### What is good
- Route handlers are present under `api`
- Validation is used via `validations.ts`

### Missing API maturity
- No API versioning
- No consistent response envelope
- No pagination metadata standardization
- No rate limiting
- No idempotency keys for payments
- No webhooks
- No strong error taxonomy
- No request correlation IDs
- No API docs

### Recommended API architecture
- Version everything under `/api/v1`
- Standardize:
  - `success: true/false`
  - `data`
  - `meta`
  - `errors`
- Use shared validation and serialization
- Add pagination and filters
- Add webhook support
- Add OpenAPI/Swagger generation
- Add admin and public API keys

---

## 14. UI/UX Improvements

### Current visual profile
The project already looks modern and student-friendly. The visual architecture is good for a marketing site and an internal portal.

### What to improve
- Stronger product journey:
  - landing page
  - course selection
  - admission form
  - payment
  - onboarding
  - learning dashboard
- Better trust signals:
  - success rate
  - testimonials
  - faculty credentials
  - results
  - guarantee badges
- Better conversion CTA design:
  - sticky "Apply Now"
  - progress indicators
  - urgency
  - social proof
- Better empty states and loading skeletons
- Clear state transitions for enrollment and payment
- Better mobile experience for forms and dashboards

### Recommended UX patterns
- Multi-step admission forms
- Student progress bars
- Checklist-based onboarding
- Guided "next best action" flows
- In-app notifications and reminders
- Personalized dashboards

---

## 15. Accessibility Review

### What is good
- Some form fields have labels
- The UI uses semantic structure and accessible button patterns

### What is missing
- Full keyboard navigation testing
- Focus management
- Skip links
- ARIA labeling for nav and dynamic panels
- Contrast checks
- Screen reader announcements for form states and toast notifications
- Better handling of motion reduction preferences

### Recommended accessibility work
- Run axe or Lighthouse accessibility audits
- Ensure WCAG 2.1 AA compliance
- Improve form validation announcements
- Add focus-visible styles
- Add proper landmarks and heading hierarchy

---

## 16. Scalability Review

### Current scalability level
The current system can support a modest coaching institute well, but not yet a large multi-branch operation.

### Scalability concerns
- Monolithic admin page
- No multi-campus data model
- No queue-based background jobs
- No distributed media storage
- No strong observability
- No advanced search or reporting layer

### Recommended scaling architecture
- Split into domain modules
- Introduce queue workers for notifications
- Add object storage for files
- Introduce a proper analytics/reporting pipeline
- Add multi-tenant architecture when the number of branches grows
- Add background jobs with retries and dead-letter queues

---

## 17. DevOps Review

### Current state
The project is deployable, but it is not yet operationally mature.

### Missing maturity
- No visible CI/CD workflow
- No staging environment
- No health checks
- No production monitoring
- No error tracking
- No database backup automation
- No rollback strategy
- No secrets rotation policy
- No infrastructure-as-code

### Recommended DevOps stack
- GitHub Actions
- Vercel or Docker-based deployment
- Sentry for error monitoring
- PostHog or similar product analytics
- Database backup automation
- Scheduled health checks
- Feature flags
- Environment promotion pipeline

---

## 18. Deployment Review

### Current readiness
The application is reasonably deployable on Vercel because of the Next.js stack, but it is not yet enterprise deployment-ready.

### What to add
- Environment validation
- Production secrets management
- Database migration automation
- Backup strategy
- CDN and static asset optimization
- Health monitoring
- Alerting
- Preview deployments
- Zero-downtime deploys

### Recommended deployment architecture
- Frontend: Vercel or self-hosted Next.js
- API: same app or separate worker services
- DB: managed PostgreSQL
- Media: cloud object storage
- Queues: Redis + BullMQ or similar
- Analytics: Sentry + PostHog

---

## 19. Priority Matrix

| Priority | Area | Reason |
|---|---|---|
| P0 | Security hardening | OTP logging, admin seed exposure, lack of audit trails |
| P0 | CMS foundation | Current CMS is not enterprise-grade |
| P0 | RBAC and permission system | Current role model is too thin |
| P1 | Admissions lifecycle | Core product workflow is incomplete |
| P1 | Payments and refunds | Business-critical and sensitive |
| P1 | SEO and metadata | Essential for growth |
| P1 | Analytics and reporting | Needed for management decisions |
| P2 | AI teaching features | High differentiation but not first priority |
| P2 | Multi-campus support | Important later |
| P3 | PWA/mobile app | Nice-to-have, long-term |

---

## 20. Risk Assessment

### High-risk areas
- Security: current authentication and admin bootstrapping are not yet robust enough
- Data integrity: no strong audit or history model
- Operational risk: no backup/restore and no monitoring
- Product risk: current system could not yet support a large admissions operation without manual effort

### Medium-risk areas
- Growth risk: the platform might become hard to evolve if the admin UI remains monolithic
- Governance risk: content management will become chaotic without a proper CMS
- Compliance risk: student data handling and consent workflows are not yet formalized

### Low-risk areas
- UI polish and branding can be iterated quickly
- Marketing sections can be extended easily

---

## 21. Detailed Roadmap

### Phase 1 — Stabilize and harden
Tasks
- Replace insecure OTP logging
- Remove or restrict seed routes from production
- Add env validation
- Add rate limiting
- Add audit logs
- Add error monitoring
- Add SEO basics: sitemap, robots, metadata, schema
- Add image optimization

Dependencies
- Secure configuration
- Observability setup

Estimated time: 3–5 weeks · Difficulty: Medium · Priority: P0

### Phase 2 — Build the real operating system
Tasks
- Introduce enterprise CMS
- Build role-based admin module architecture
- Add media library
- Add page builder and content workflow
- Add forms and lead management
- Add branch/campus support
- Add reporting and analytics basics

Dependencies
- Phase 1 security hardening
- DB schema expansion

Estimated time: 6–10 weeks · Difficulty: High · Priority: P0

### Phase 3 — Expand the coaching platform
Tasks
- Online admission workflow
- Student portal
- Teacher portal
- Guardian portal
- Live class and recorded class system
- Assignments and progress tracking
- Certificates and digital verification
- Payment workflows and refunds

Dependencies
- CMS and domain modules
- Payment integration design

Estimated time: 8–12 weeks · Difficulty: High · Priority: P1

### Phase 4 — Growth and automation
Tasks
- Marketing automation
- WhatsApp/email/SMS automation
- AI tutor and question generator
- Lead scoring
- Referral system
- Gamification
- Knowledge base and support tickets

Dependencies
- Student lifecycle and communications services

Estimated time: 8–10 weeks · Difficulty: High · Priority: P1

### Phase 5 — Scale
Tasks
- Multi-campus architecture
- Localization
- API marketplace
- Analytics warehouse
- Mobile app or PWA
- Advanced search
- Background job orchestration
- Backup/restore automation

Dependencies
- Mature platform modules

Estimated time: 10–16 weeks · Difficulty: Very high · Priority: P2

---

## 22. Enterprise CMS Blueprint

### Recommended stack
- Next.js frontend
- Payload CMS or Directus as the admin/content engine
- PostgreSQL as the main data store
- Object storage for media
- Webhooks for downstream integrations

### Suggested modules
- Content: Pages, Navigation, Blocks, Templates, Media, SEO
- Marketing: Hero banners, Popups, Landing pages, Campaigns, Forms, Leads
- Operations: Courses, Teachers, Students, Admissions, Payments, Exams, Attendance, Certificates
- Governance: Roles, Permissions, Activity logs, Audit logs, Backup/restore

### Recommended data model
- pages, page_blocks, menus, media_files, roles, permissions, users, posts, categories, courses, course_modules, lessons, teachers, students, admissions, payments, invoices, notifications, banners, sliders, faqs, testimonials, events, webhooks, audit_logs

### Why this is important
Without a proper CMS, your platform will stay dependent on code-level content changes and manual operations. That is not sustainable for growth.

---

## 23. Enterprise Coaching Platform Blueprint

### Core modules
- Public website
- Admission portal
- Student dashboard
- Teacher dashboard
- Admin console
- Finance module
- Communications module
- Analytics module
- CMS module

### Business workflows
1. Visitor sees landing page
2. Visitor applies for admission
3. Lead is captured and scored
4. Admin reviews and assigns counselor
5. Student is enrolled and payment is initiated
6. Student enters learning portal
7. Teacher publishes materials and assignments
8. Student completes assessments and earns progress
9. Admin issues certificates and reports

### Recommended platform architecture
- Frontend: Next.js
- Backend/API: Next.js route handlers or tRPC
- CMS: Payload or Directus
- DB: PostgreSQL
- Queue: Redis/BullMQ
- Storage: S3-compatible object storage
- Monitoring: Sentry + logs
- Payments: gateway integrations
- Notifications: SMS/WhatsApp/email/provider layer

---

## 24. Final Score

**Score: 64/100**

### Why not higher
The project already has:
- A good Next.js foundation
- Good UI direction
- Good database beginnings
- A working auth foundation

But it still lacks:
- Enterprise CMS maturity
- Security hardening
- Governance and auditability
- Full-feature student lifecycle management
- Strong analytics and automation
- A scalable architecture for multi-campus growth

This is a strong MVP and a promising product foundation, but not yet an enterprise-grade coaching platform.

---

## 25. Top 100 Improvements

1. Replace insecure console OTP logging with secure provider-only delivery.
2. Remove or lock down admin seed routes in production.
3. Introduce env validation at startup.
4. Add rate limiting to auth and form endpoints.
5. Add audit logs for all admin changes.
6. Add soft delete support for all core tables.
7. Introduce UUID primary keys instead of plain text IDs.
8. Add `created_by` and `updated_by` columns.
9. Add status history tables for admissions and payments.
10. Add a true RBAC permissions engine.
11. Add module-level permissions such as `course.manage` and `payment.verify`.
12. Add a proper CMS layer.
13. Add a media library with upload validation.
14. Add page builder support.
15. Add content publishing workflows.
16. Add revision history for content changes.
17. Add SEO manager for pages and posts.
18. Add navigation builder.
19. Add homepage builder.
20. Add landing page builder.
21. Add announcement system.
22. Add popup manager.
23. Add forms and lead management.
24. Add lead scoring.
25. Add CRM-style pipelines.
26. Add student lifecycle tracking.
27. Add application status pages.
28. Add merit list workflow.
29. Add waiting list workflow.
30. Add document upload workflow.
31. Add online admission form wizard.
32. Add multi-step payment flow.
33. Add invoice automation.
34. Add refund workflow.
35. Add coupon and discount management.
36. Add wallet system.
37. Add subscription and membership modules.
38. Add referral rewards.
39. Add teacher portal.
40. Add guardian portal.
41. Add student dashboard with progress tracking.
42. Add assignments and submission workflow.
43. Add class schedule engine.
44. Add routine management.
45. Add live class links.
46. Add recorded class library.
47. Add attendance with QR support.
48. Add face attendance option later.
49. Add online CBT exam engine.
50. Add OMR practice mode.
51. Add leaderboards.
52. Add AI tutor.
53. Add AI question generator.
54. Add AI notes generator.
55. Add AI study planner.
56. Add discussion forum.
57. Add doubt solving module.
58. Add support ticket system.
59. Add knowledge base.
60. Add feedback and complaint workflows.
61. Add certification engine.
62. Add digital certificate verification.
63. Add badges and achievements.
64. Add bookmarks and wishlist.
65. Add course comparison.
66. Add personalized recommendations.
67. Add push notification support.
68. Add WhatsApp automation templates.
69. Add email automation templates.
70. Add SMS automation templates.
71. Add payment reminder automation.
72. Add student onboarding automation.
73. Add branch management.
74. Add franchise management.
75. Add multi-campus support.
76. Add localization support.
77. Add multilingual content.
78. Add analytics dashboards.
79. Add executive reports.
80. Add sales and conversion analytics.
81. Add attendance analytics.
82. Add exam performance dashboards.
83. Add student retention analytics.
84. Add API versioning.
85. Add OpenAPI documentation.
86. Add webhook support.
87. Add background job workers.
88. Add Redis caching.
89. Add CDN support for static assets.
90. Add image optimization pipeline.
91. Add sitemap and robots support.
92. Add JSON-LD and schema markup.
93. Add dynamic metadata for content pages.
94. Add canonical URLs.
95. Add breadcrumb navigation.
96. Add accessibility improvements.
97. Add PWA support.
98. Add mobile app roadmap.
99. Add backup and restore automation.
100. Add CI/CD and production monitoring.

---

### Next steps
This audit can be turned into a concrete implementation blueprint, including:
- a recommended folder structure for the enterprise version
- the exact database schema to introduce
- a phased backlog in GitHub issue form
- a migration plan from the current MVP into the enterprise platform
