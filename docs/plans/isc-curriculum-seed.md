# ISC Curriculum — Seed Files Implementation Plan

> **Status:** Draft — Planning only
> **Date:** 2026-08-21
> **Stack:** Next.js 16 / Drizzle 0.45.2 / PostgreSQL / TypeScript 5.9 / Node 24
> **Author:** OpenCode (Muse Spark)

---

## 1. Executive Summary

Implement idempotent, reviewable seed files for the **ISC** (`category = 'isc'` in `lib/db/schema.ts:148`) curriculum. The ISC track is the sibling of `icon` within `courses.category` and represents the HSC Science / BNMC-aligned program. Seeds will populate **course categories, subjects, ISC courses, and subject-specialist teachers** with bilingual (en/bn) metadata, enabling `pnpm db:seed:isc` to bring a fresh DB to a demo-ready state without manual Admin UI entry.

No schema migration is required — `courses` (`lib/db/schema.ts:136`), `course_categories` (`lib/db/schema.ts:384`), `subjects` (`lib/db/schema.ts:399`), and `teachers` (`lib/db/schema.ts:157`) already support the needed fields. Seed files are additive and sit alongside the existing `scripts/seed-demo-admin.ts:1`.

---

## 2. Current State Audit

| Layer               | Location                                                                                                                                                                                                         | Evidence                                                                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categories**      | `lib/db/schema.ts:384` `course_categories` (id, name, slug, description, sortOrder, isActive)                                                                                                                    | Table exists, `course_categories_is_active_idx`; no seed yet — Admin UI creates via `app/api/course-categories/route.ts:1`                                        |
| **Courses**         | `lib/db/schema.ts:136` `courses` (category `'icon'                                                                                                                                                               | 'isc'`default`'icon'`, fee, discountFee, duration, features `string[]`, schedule)                                                                                 | Category filter exists (`app/api/courses`), but no ISC-specific courses in repo; `IMPLEMENTATION_LOG.md` notes category filter tabs All/Icon/ISC done |
| **Subjects**        | `lib/db/schema.ts:399` + `0009_subjects.sql:1`                                                                                                                                                                   | 6-subject expectation in `docs/guides/components.md` and `components/ui/data-table` filters; `lib/db/migrations/0009_subjects.sql` creates table but no seed rows |
| **Teachers**        | `lib/db/schema.ts:157` (subject, designation, isActive)                                                                                                                                                          | Seed demo admin only; no subject-teacher mapping seeded                                                                                                           |
| **Exams/Questions** | `lib/db/schema.ts:411` `exams.subject` + `questions`                                                                                                                                                             | Subjects are FK-less text — seeds must keep `exams.subject` === `subjects.name` for consistency                                                                   |
| **Existing seeds**  | `scripts/seed-demo-admin.ts:1` (postgres + fetch `/api/admin/seed`), `scripts/clean-db.ts:1` (TRUNCATE cascade), `scripts/analyze-db.ts:1` (counts), `package.json:14` scripts `db:seed`, `db:clean`, `db:reset` | Pattern: `postgres` + `dotenv` `.env` + `.env.local`, `client.unsafe(statement)` for migrations, API for hashed passwords                                         |
| **Migrations**      | `lib/db/migrations/{0000..0019}:1`, `drizzle.config.ts:1`                                                                                                                                                        | 20 SQL files, journal verified via `pnpm db:verify`; no migration needed for ISC — reuse existing columns                                                         |
| **CMS / i18n**      | `lib/cms/index.ts:1` (defaultCmsContent), `messages/en.json:1`, `i18n/config.ts`                                                                                                                                 | Subjects/courses need bilingual display; follow `lib/cms/index.ts:54` default pattern                                                                             |
| **Build / QA**      | `lib/db/schema.ts:384` unique `course_categories.slug`, `subjects.name`, `courses.slug`                                                                                                                          | Seeds must use deterministic ids/slugs (`isc-physics`, `hsc-science-2026`) and `onConflictDoUpdate`                                                               |

**Gap:** No `scripts/seed/*` for ISC; fresh DB shows 0 categories/subjects/courses except manual inserts. E2E and Storybook need deterministic ISC fixtures.

---

## 3. Goals & Non-Goals

### Goals

1. **Single command** `pnpm db:seed:isc` populates ISC curriculum (categories → subjects → ISC courses → teachers) idempotently; `pnpm db:reset:isc` (clean + seed) for CI.
2. **Deterministic ids/slugs** (`isc`, `icon`, `hsc-science-2026`) so tests, Storybook, and `pnpm build` see stable fixtures.
3. **Bilingual** labels (`nameEn/nameBn`, `titleEn/titleBn`) or `messages` keys, matching `messages/en.json:1` and CMS merge pattern.
4. **Referential integrity:** `exams.subject` values drawn from seeded `subjects.name`; `teachers.subject` matches.
5. **Auditable & reviewable:** data as TypeScript constants (`scripts/data/isc/*.ts`) + orchestrator (`scripts/seed/isc/index.ts`), not opaque SQL dumps.
6. **Zero prod impact:** `--dry-run` prints diff; default run is transactional; respects `DATABASE_URL` and `NODE_ENV`.

### Non-Goals (v1)

- Question bank / exam seeds for ISC (reuse generic exam seed later; not in scope).
- New schema (join table `course_subjects`) — defer; `courses.features: string[]` stores subject list for now.
- Full media upload (images stored as `/images/*` placeholders or Vercel Blob URLs if present).
- Automatic enrollment of demo students into ISC courses (separate `seed-demo-students` task).

---

## 4. Decisions & Rationale

| Decision            | Choice                                                                                                                                           | Rationale                                                                                                                              | Alternatives                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **File layout**     | `scripts/seed/isc/{categories,subjects,courses,teachers}.ts` + `scripts/seed-isc-curriculum.ts` orchestrator + `scripts/data/isc/*.ts` constants | Mirrors `lib/db/migrations/*` modularity; easy `git mv` history; `pnpm db:seed:isc` maps 1:1 to `scripts/seed-demo-admin.ts:1` pattern | Single monolithic `seed-isc.ts` — hard to diff         |
| **Idempotency**     | Drizzle `insert().onConflictDoUpdate({ target: slug/name, set: {…} })` per table                                                                 | Allows re-run on staging without duplicate `uniqueIndex` errors (`lib/db/schema.ts:385` slug, `lib/db/schema.ts:399` name)             | `TRUNCATE` then insert — destructive                   |
| **IDs**             | Deterministic `nanoid`-like but fixed: `cat_isc`, `subj_physics`, `course_hsc_science_2026`                                                      | Stable FKs for tests; no random UUID churn                                                                                             | `gen_random_uuid()` — changes each run                 |
| **Data source**     | TypeScript constants with Zod validation (`lib/core/validations.ts`) before insert                                                               | Reviewable in PR, i18n-aware, validated like API `createCourseCategorySchema`                                                          | Raw JSON — no type safety                              |
| **Teacher linkage** | `teachers.subject` text matches `subjects.name` (FK-less)                                                                                        | Matches `lib/db/schema.ts:165` design; keep simple                                                                                     | Add FK `teacher_subjects` — migration needed           |
| **Images**          | Use existing `placehold.co`/`/images/*` or Blob placeholder; validate via `lib/media/validation.ts`                                              | No upload in seed; avoids Blob token in CI                                                                                             | Upload to Blob in seed — needs `BLOB_READ_WRITE_TOKEN` |
| **CLI**             | `pnpm db:seed:isc [--dry-run] [--force]` powered by `tsx --env-file`                                                                             | Consistent with `package.json:14` `node --experimental-strip-types` scripts; `--dry-run` for PR review                                 | `drizzle-kit push` only — no data                      |
| **Ordering**        | Categories → Subjects → Courses → Teachers (foreign-key safe)                                                                                    | `courses.category` is enum, not FK, but order aids readability; teachers last (subject must exist)                                     | Parallel inserts — race                                |

---

## 5. Proposed Architecture

```
scripts/
  seed-demo-admin.ts              # existing — keep
  seed/
    isc/
      index.ts                    # orchestrator: categories → subjects → courses → teachers (transactional)
      categories.ts               # upsert course_categories
      subjects.ts                 # upsert subjects (Bengali/English, ICT, etc.)
      courses.ts                  # upsert courses where category='isc'
      teachers.ts                 # upsert teachers (subject specialists)
  data/
    isc/
      categories.ts               # const ISC_CATEGORIES: {id,name,slug,description,sortOrder}[]
      subjects.ts                 # const ISC_SUBJECTS: {id,name,sortOrder}[]
      courses.ts                  # const ISC_COURSES: {id,slug,title,description,fee,…}[]
      teachers.ts                 # const ISC_TEACHERS: {id,name,subject,designation,…}[]
lib/db/
  seeds/
    isc.ts?                       # optional re-export for programmatic use (not required)

docs/plans/
  isc-curriculum-seed.md          # this file
```

**Data examples (trimmed):**

```ts
// scripts/data/isc/categories.ts
export const ISC_CATEGORIES = [
  {
    id: 'cat_isc',
    name: 'ISC',
    slug: 'isc',
    description: 'HSC Science / ISC track — BNMC-aligned curriculum',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'cat_icon',
    name: 'Icon',
    slug: 'icon',
    description: 'Regular Icon track',
    sortOrder: 0,
    isActive: true,
  },
] as const

// scripts/data/isc/subjects.ts — ISC curriculum (Bangladesh HSC Science)
export const ISC_SUBJECTS = [
  { id: 'subj_bn', name: 'Bangla', sortOrder: 0 },
  { id: 'subj_en', name: 'English', sortOrder: 1 },
  { id: 'subj_physics', name: 'Physics', sortOrder: 2 },
  { id: 'subj_chemistry', name: 'Chemistry', sortOrder: 3 },
  { id: 'subj_biology', name: 'Biology', sortOrder: 4 },
  { id: 'subj_math', name: 'Higher Math', sortOrder: 5 },
  { id: 'subj_ict', name: 'ICT', sortOrder: 6 },
  { id: 'subj_gk', name: 'General Knowledge', sortOrder: 7 },
] as const

// scripts/data/isc/courses.ts
export const ISC_COURSES = [
  {
    id: 'course_hsc_science_2026',
    slug: 'hsc-science-2026',
    courseCode: 'ISC-HSC-2026',
    title: 'HSC Science Regular — 2026 Batch',
    shortDescription:
      'Physics/Chemistry/Biology/Math + Bangla/English/ICT — full HSC preparation',
    description:
      'Complete HSC Science curriculum with weekly model tests, lab classes, and BNMC bridging.',
    duration: '12 months',
    fee: 24000,
    discountFee: 18000,
    category: 'isc' as const,
    maxStudents: 120,
    schedule: 'Sat–Thu 8am–11am',
    features: [
      'Physics',
      'Chemistry',
      'Biology',
      'Higher Math',
      'English',
      'Bangla',
      'ICT',
    ],
    isActive: true,
  },
  // ... 2–3 more ISC courses (e.g., "ISC Second Timer Intensive", "BNMC Admission — ISC Stream")
] as const
```

**Orchestrator sketch (`scripts/seed/isc/index.ts`):**

```ts
import { drizzle } from 'drizzle-orm/postgres-js'
import { courseCategories, subjects, courses, teachers } from '@/lib/db/schema'
import { ISC_CATEGORIES } from '../data/isc/categories'
export async function seedIsc({ dryRun = false } = {}) {
  const db = drizzle(process.env.DATABASE_URL!)
  await db.transaction(async (tx) => {
    for (const c of ISC_CATEGORIES)
      await tx
        .insert(courseCategories)
        .values(c)
        .onConflictDoUpdate({ target: courseCategories.slug, set: c })
    // ... subjects (target: subjects.name), courses (target: courses.slug), teachers (target: teachers.id)
  })
}
```

**Idempotency note:** `subjects.name` is unique (`lib/db/schema.ts:402` `uniqueIndex` not explicit but `name unique`), `courses.slug` unique (`lib/db/schema.ts:138`), `courseCategories.slug` unique (`lib/db/schema.ts:390`).

---

## 6. Implementation Phases

### Phase 0 — Research & Spec (0.5d)

| #   | Task                                                                                                                  | Output                                            |
| --- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 0.1 | Confirm ISC curriculum list with stakeholders (which subjects: Bangla/English/Physics/Chemistry/Biology/Math/ICT/GK?) | `docs/plans/isc-curriculum-seed.md` table updated |
| 0.2 | Audit `lib/db/schema.ts:384` / `scripts/seed-demo-admin.ts:1` pattern                                                 | This plan                                         |
| 0.3 | Decide fee/schedule for 3 ISC courses (align with `lib/cms/index.ts:1` or admin)                                      | Seed constants draft                              |

### Phase 1 — Scaffolding (0.5d)

| #   | Task                                                                                                                                  | Files   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1.1 | Create `scripts/data/isc/{categories,subjects,courses,teachers}.ts` with deterministic ids/slugs                                      | 4 files |
| 1.2 | Create `scripts/seed/isc/{categories,subjects,courses,teachers}.ts` upsert helpers                                                    | 4 files |
| 1.3 | Create orchestrator `scripts/seed/isc/index.ts` + CLI `scripts/seed-isc-curriculum.ts` (`--dry-run`, `--force`, `DATABASE_URL` check) | 2 files |

### Phase 2 — Seed Logic (1d)

| #   | Task                                        | Details                                                                                                                 |
| --- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Categories upsert (`courseCategories.slug`) | `onConflictDoUpdate` set `name/description/sortOrder/isActive`                                                          |
| 2.2 | Subjects upsert (`subjects.name`)           | Validate via `createSubjectSchema` (`lib/core/validations.ts`); preserve `isActive`                                     |
| 2.3 | Courses upsert (`courses.slug`)             | Map `features` to subject names, `category='isc'`, validate `fee`/`duration` (`lib/core/validations.ts` course schemas) |
| 2.4 | Teachers upsert (`teachers.id`)             | Link `subject` to seeded subjects, `isActive:true`                                                                      |

### Phase 3 — CLI & Package (0.5d)

| #   | Task                                                                                                                                                  | File           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 3.1 | Add `package.json:14` scripts: `db:seed:isc: "tsx scripts/seed-isc-curriculum.ts"`, `db:seed:isc:dry: "tsx scripts/seed-isc-curriculum.ts --dry-run"` | `package.json` |
| 3.2 | Support `NODE_ENV`, `DATABASE_URL` (`.env` + `.env.local` via `dotenv` as in `scripts/seed-demo-admin.ts:4`)                                          | CLI            |
| 3.3 | Transaction + logging (counts per table, `console.log` like `scripts/analyze-db.ts:15`)                                                               | CLI            |

### Phase 4 — Quality & Docs (0.5d)

| #   | Task                                                                                                                                                          | Acceptance                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 4.1 | `pnpm lint` + `pnpm typecheck` + `pnpm test -- --run` (update `tests/cms-content.test.ts` if subjects/courses count changes)                                  | 0 errors, 130 tests pass                         |
| 4.2 | `pnpm db:verify` (20 migrations) + `pnpm db:seed:isc --dry-run` shows diff                                                                                    | No migration drift                               |
| 4.3 | Manual run on disposable DB (`docker compose up` + `pnpm db:seed:isc`) → verify via `app/admin` Courses/Subjects/Teachers tabs + `pnpm analyze-db` row counts | ISC rows present, `course_categories.slug='isc'` |
| 4.4 | Docs: update `docs/README.md:1` index, `ARCHITECTURE.md:1` if needed, `CHANGELOG.md:1` Unreleased                                                             | Links updated                                    |

### Phase 5 — Optional Enhancements (deferred)

- Seed `exams` + `questions` for ISC subjects ( Bangla 50 Qs etc.) — separate `seed-isc-exams.ts`.
- Seed `media_files` for course images (upload via `lib/media/validation.ts`).
- Add `pnpm db:reset:isc = pnpm db:clean && pnpm db:seed:isc && pnpm db:seed` (preserves admin).

---

## 7. File Inventory (to create)

| File                             | Purpose                                                     |
| -------------------------------- | ----------------------------------------------------------- |
| `scripts/data/isc/categories.ts` | 2–3 category rows (isc/icon)                                |
| `scripts/data/isc/subjects.ts`   | 7–8 subject rows (deterministic ids)                        |
| `scripts/data/isc/courses.ts`    | 3 ISC courses (HSC 2026 Regular, Second Timer, BNMC Bridge) |
| `scripts/data/isc/teachers.ts`   | 4–6 teachers (Physics, Chemistry, Biology, Math, English)   |
| `scripts/seed/isc/categories.ts` | Drizzle upsert helper                                       |
| `scripts/seed/isc/subjects.ts`   | Upsert + validation                                         |
| `scripts/seed/isc/courses.ts`    | Upsert + fee/duration checks                                |
| `scripts/seed/isc/teachers.ts`   | Upsert + subject existence check                            |
| `scripts/seed/isc/index.ts`      | Transactional orchestrator                                  |
| `scripts/seed-isc-curriculum.ts` | CLI entry (`--dry-run`, `--force`)                          |
| `tests/seed-isc.test.ts`         | Snapshot count + idempotency (run twice, same row count)    |

Out-of-scope hidden: `scripts/seed-isc-curriculum.ts` should not import `next` server-only.

---

## 8. Validation

- **Before:** `pnpm analyze-db` shows `subjects: 0`, `courses: 0` (or legacy), `course_categories: 0`.
- **After `pnpm db:seed:isc`:** `course_categories: 2`, `subjects: 8`, `courses: 3 where category='isc'`, `teachers: 4–6`.
- **Idempotency:** Run twice → row counts unchanged, `updatedAt` refreshed.
- **Rollback:** `pnpm db:clean` truncates (see `scripts/clean-db.ts:18` list — add `course_categories, subjects, courses, teachers` to truncate or separate clean script).
- **Integration:** `app/courses` page lists ISC courses; `app/admin` Categories/Subjects show new rows; `app/exams` subject dropdown includes ISC subjects.

---

## 9. Risks & Mitigations

| Risk                                                        | Impact                                        | Mitigation                                                                                                                                                 |
| ----------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subject name mismatch (`exams.subject` free text)           | Medium — exams reference non-existent subject | Seed subjects first; add `lib/core/validations.ts` check `subject in ISC_SUBJECTS`; CI `pnpm test` asserts `subjects.name` set equals `exams.subject` enum |
| Slug collision (`courses.slug` unique)                      | Low — existing manual course with same slug   | Use prefixed slugs (`hsc-science-2026`, not `science`); `onConflictDoUpdate` merges                                                                        |
| Fee/discount inconsistency (`discountFee` > `fee`)          | Low — broken pricing                          | Validate `discountFee < fee` in seed helpers, mirror `app/admin/components/courses-tab` validation                                                         |
| Bilingual drift (`messages/en.json` vs `bn.json`)           | Low — UI shows missing keys                   | Add `en`/`bn` keys for each subject/category in `messages/` if displayed via `useTranslations`                                                             |
| `clean-db` does not truncate `subjects`/`course_categories` | Medium — leftover rows after clean            | Extend `scripts/clean-db.ts:18` or document `pnpm db:seed:isc --force` handles update not delete                                                           |
| Large seed slows CI                                         | Low — <100 rows                               | No issue; seed <1s                                                                                                                                         |

---

## 10. Timeline Estimate

| Phase         | Duration            | Cumulative |
| ------------- | ------------------- | ---------- |
| 0 Research    | 0.5d                | 0.5d       |
| 1 Scaffolding | 0.5d                | 1.0d       |
| 2 Seed logic  | 1.0d                | 2.0d       |
| 3 CLI/package | 0.5d                | 2.5d       |
| 4 QA/docs     | 0.5d                | 3.0d       |
| **Total v1**  | **~3 days** (1 dev) |            |

Buffer +0.5d for stakeholder confirmation on subject list/fees.

---

## 11. Open Questions (PO)

1. Confirm final ISC subject list — is `Higher Math` vs `General Math`? Include `General Knowledge`?
2. Fee schedule for ISC 2026 batches — `24000/18000` vs existing `courses.fee` examples (`lib/db/schema.ts:143` `integer`)?
3. Whether to seed BNMC-specific `courseCategories` (`slug: 'bnmc'`) or keep only `isc`/`icon`?
4. Teacher photos — placeholder `/images/teacher-*.png` or real upload via `lib/media/validation.ts`?

---

## 12. References

- `lib/db/schema.ts:136` `courses` (category `'icon'|'isc'`), `lib/db/schema.ts:384` `course_categories`, `lib/db/schema.ts:399` `subjects`, `lib/db/schema.ts:157` `teachers`
- `lib/db/migrations/0009_subjects.sql:1`, `lib/db/migrations/0004_teachers.sql:1`, `drizzle.config.ts:1`
- `scripts/seed-demo-admin.ts:1` (pattern), `scripts/clean-db.ts:1` (truncate list), `scripts/analyze-db.ts:15` (row counts), `package.json:14` scripts, `vitest.config.ts:1`
- `docs/plans/project-plan.md:1`, `docs/development/implementation-log.md:1`, `ARCHITECTURE.md:1`, `lib/cms/index.ts:1`, `lib/core/validations.ts`

---

_Next step: approve subject/course list, then create branch `feat/isc-seed` and execute Phase 1 scaffolding._
