# TODO — Nursing Coaching Website

> Current audit score: **64/100**
> A strong MVP foundation exists, but the project needs structural hardening and operational maturity before it becomes enterprise-ready.

## Key objectives

1. Harden security and governance
2. Stabilize CI/CD and build reliability
3. Finish admin media/CMS support
4. Improve architecture, scalability, and observability
5. Add enterprise-grade workflows for admissions, payments, and student lifecycle

## Highest priority tasks (P0)

- [ ] Fix and stabilize CI
  - use Node 24 in `.github/workflows/ci.yml`
  - install `pnpm` reliably before dependency install
  - gate build, lint, typecheck, and tests
- [ ] Harden authentication and admin access
  - remove OTP console logging from `lib/auth.ts`
  - remove or guard dev-only seed/admin routes
  - enforce `requireAdmin()` consistently in admin APIs
- [ ] Finish audit and rate-limit coverage
  - extend audit writes to all admin mutation endpoints
  - apply rate limits to auth, public forms, admission submissions, and sensitive APIs
  - add environment validation for required secrets/config values
- [ ] Complete media library support
  - finalize upload validation, storage, and delete cleanup
  - add admin UI for media management
  - persist metadata safely in `media_files`

## In progress

- [ ] Audit logging coverage for remaining admin/student/settings/payment actions
- [ ] Consistent rate limiting across sensitive routes
- [ ] Regression tests for audit persistence and security controls
- [ ] Media library upload/delete flow and admin integration

## Short-term next actions

- [ ] Add regression tests and run `pnpm exec tsc --noEmit`
- [ ] Add caching and static-generation improvements for public pages
- [ ] Add basic SEO support:
  - `app/sitemap.ts`
  - `app/robots.ts`
  - dynamic metadata and JSON-LD
- [ ] Add file upload restrictions and validation for new media endpoints
- [ ] Refactor admin UI into smaller domain-focused panels

## Medium-term initiatives (P1)

- [ ] Build a CMS/media workflow module
- [ ] Add role-based permissions beyond admin/student
- [ ] Add admissions lifecycle workflows
- [ ] Add payment and refund reconciliation flows
- [ ] Add analytics dashboards and reporting
- [ ] Add better observability: monitoring, error tracking, and backups

## Backlog / future work (P2)

- [ ] Multi-campus and branch support
- [ ] Localization and multi-language content
- [ ] Full course/student engagement workflows
- [ ] Instructor/guardian portals
- [ ] Background jobs and queue processing
- [ ] API versioning and OpenAPI documentation
- [ ] Move media storage to object storage for production
- [ ] Enterprise CMS or headless content engine

## Notes

- Keep this file focused on action items rather than a full audit.
- Separate architecture and audit detail into companion documents when needed.
- Aim for an MVP-to-enterprise transition plan that is incremental and measurable.
