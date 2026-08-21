# Documentation Index

Central index for ISC Expo project documentation. All design, planning, and implementation docs live under `docs/` to keep the repository root minimal (`README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`).

## Map

| Document                           | Path                                                                                 | Purpose                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| **Architecture**                   | [`ARCHITECTURE.md`](../ARCHITECTURE.md)                                              | Runtime boundaries, i18n, migration, quality gates      |
| **Project Plan**                   | [`docs/plans/project-plan.md`](./plans/project-plan.md)                              | 7-week phased delivery, status legend, migrations       |
| **Implementation Log**             | [`docs/development/implementation-log.md`](./development/implementation-log.md)      | Phased progress, quality gates, next steps              |
| **Design Reference**               | [`docs/design/reference.md`](./design/reference.md)                                  | Glassmorphism, shadows, radii, animations, tokens       |
| **Design Improvements**            | [`docs/design/improvements.md`](./design/improvements.md)                            | Component-by-component improvements, animations, specs  |
| **Design Summary**                 | [`docs/design/summary.md`](./design/summary.md)                                      | Before/after, metrics, quality results                  |
| **Delivery Checklist**             | [`docs/design/delivery-checklist.md`](./design/delivery-checklist.md)                | 100% completion verification, browser support           |
| **Components Guide**               | [`docs/guides/components.md`](./guides/components.md)                                | UI primitives (`components/ui/*`) props + usage         |
| **Design System — Storybook Plan** | [`docs/plans/design-system-storybook.md`](./plans/design-system-storybook.md)        | Storybook 10 bootstrap + foundations + stories          |
| **ISC Curriculum Seed Plan**       | [`docs/plans/isc-curriculum-seed.md`](./plans/isc-curriculum-seed.md)                | ISC categories/subjects/courses/teachers seed design    |
| **Docker Structure Plan**          | [`docs/plans/docker-structure.md`](./plans/docker-structure.md)                       | `docker/{compose,e2e,api/Dockerfile}` + `.devcontainer` |
| **LMS Admin Improvement Design**   | [`lms-admin-improvement-design.md`](./lms-admin-improvement-design.md)               | Detailed admin design spec (referenced by project plan) |
| **QA Review Report**               | [`qa-review-report.md`](./qa-review-report.md)                                       | QA audit findings                                       |
| **Structure Analysis Plan**        | [`structure-analysis-improvement-plan.md`](./structure-analysis-improvement-plan.md) | Repo structure audit (A–D phases)                       |
| **Installation**                   | [`installation.md`](./installation.md)                                               | Local install workflow, CI compat                       |
| **DB Setup**                       | [`db-setup.md`](./db-setup.md)                                                       | Drizzle / Supabase setup                                |
| **Admit Cards Plan**               | [`admit-cards-full-functionality-plan.md`](./admit-cards-full-functionality-plan.md) | Admit cards feature spec                                |

### Storybook Foundations (live)

| Foundation      | Storybook MDX                          | Source                  |
| --------------- | -------------------------------------- | ----------------------- |
| Colors          | `stories/foundations/Colors.mdx`       | `app/globals.css:64`    |
| Typography      | `stories/foundations/Typography.mdx`   | `app/globals.css:7`     |
| Spacing & Radii | `stories/foundations/SpacingRadii.mdx` | `app/globals.css:55`    |
| Shadows & Glass | `stories/foundations/ShadowsGlass.mdx` | `DESIGN_REFERENCE.md:4` |
| Animations      | `stories/foundations/Animations.mdx`   | `app/globals.css:171`   |
| Icons           | `stories/foundations/Icons.mdx`        | `lucide-react`          |

## Conventions

- **Root** keeps only entry-point docs: `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md` (+ `LICENSE` if applicable). All other documentation lives under `docs/` (see `.gitattributes: docs/** linguist-documentation`).
- **Links** are repository-root relative (e.g., `docs/design/reference.md`) or file-relative (`../lms-admin-improvement-design.md` from `docs/plans/`). Prefer root-relative for stability after moves.
- **History** preserved via `git mv` — blame/log follows renames.

## Maintenance

- Update this index when adding/removing docs in `docs/`.
- Keep `CHANGELOG.md` (Keep a Changelog) and `PROJECT_PLAN.md` / `IMPLEMENTATION_LOG.md` in sync.
- Run `pnpm format:check` before committing docs (Prettier).
