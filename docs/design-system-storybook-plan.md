# Design System — Storybook Implementation Plan

> **Status:** Draft — Planning only (no code changes yet)
> **Date:** 2026-08-21
> **Stack:** Next.js 16.2.6 (App Router) / Tailwind CSS 4.2.0 / shadcn `base-nova` / Base UI 1.5.0 / TypeScript 5.9
> **Author:** OpenCode (Muse Spark)

---

## 1. Executive Summary

Introduce **Storybook 9 (latest stable, CSF 3)** as the isolated workbench for the ISC Expo design system. The goal is a documented, browseable, and visually-testable catalog of all `components/ui/*`, layout primitives, and `lib/*` design tokens — consumable by frontend, design, and QA without booting the full Next.js app or a database.

The plan covers setup, taxonomy, theming, i18n, MDX foundations docs, interaction + a11y testing, CI, and deployment. No existing runtime behavior is changed; Storybook is additive.

**Out of scope for v1:** Visual regression hosting (Chromatic) as required, Figma plugin sync, full E2E inside Storybook. These are marked optional.

---

## 2. Current State Audit

### 2.1 Inventory (evidence-backed)

| Layer | Location | Count / Notes |
|-------|----------|---------------|
| **Primitive UI** | `components/ui/*` (glob) | 19 files: `button.tsx:1`, `alert.tsx:1`, `form-field.tsx`, `confirm-dialog.tsx`, `status-badge.tsx`, `stat-card.tsx`, `skeleton.tsx:1`, `data-table.tsx`, `filter-bar.tsx`, `bulk-actions.tsx`, `calendar-view.tsx`, `date-range-picker.tsx`, `chart-card.tsx`, `panel-layout.tsx`, `empty-state.tsx`, `fade-in.tsx`, `lightbox.tsx`, `info-row.tsx`, `toast.tsx` |
| **Layout / site** | `components/*` | `site-header.tsx`, `site-footer.tsx`, `section-heading.tsx`, `breadcrumb.tsx`, `navigation/*`, `sections/*` (8 sections: `hero.tsx`, `courses.tsx`, etc.), `theme-*`, `floating-whatsapp.tsx` |
| **Domain print** | `components/payment-receipt.tsx`, `app/admin/components/student-profile-modal.tsx` | Printable + modal |
| **Tokens** | `app/globals.css:64` | `:root` / `.dark` CSS variables (`--primary`, `--radius`, `--brand`, `--chart-*`, `--sidebar-*`), `@theme inline` mappings, `tw-animate-css`, `shadcn/tailwind.css`; Tailwind v4 via `@import 'tailwindcss'` (`postcss.config.mjs:1`) |
| **Design spec** | `DESIGN_REFERENCE.md:1`, `DESIGN_DELIVERY_CHECKLIST.md`, `DESIGN_IMPROVEMENTS.md` | Glassmorphism, soft shadows, radii (`rounded-2xl`), animations (`float`/`blob`/`fade-in-up`), color usage (`#2563EB` vs token `#0070F3`), dark-mode strategy |
| **Component docs** | `COMPONENTS_GUIDE.md:1` | Manual markdown catalog; source of truth for props but no live examples |
| **Config** | `components.json:1` (`style: base-nova`, `tailwind.css: app/globals.css`), `tsconfig.json:21` (`@/*`), `next.config.mjs:1` (next-intl plugin) |  |

### 2.2 Gaps (why Storybook)

- `COMPONENTS_GUIDE.md` is not interactive; props drift from actual code (`alert.tsx:7` variant vs guide) without type checking.
- Dark mode, responsive, and a11y states cannot be inspected without running `pnpm dev` + DB + auth.
- `DataTable` (`components/ui/data-table.tsx`) has 6 sub-components and sticky/sort/pagination — currently untestable in isolation.
- No visual regression or interaction tests; reuse across admin (`app/admin/components/*`) and public `sections/*` is ad-hoc.

### 2.3 Existing Tooling Fit

- `vitest.config.ts:10` uses `jsdom` + `v8` coverage — compatible with Storybook's Vitest integration.
- `eslint.config.mjs:5` uses `eslint-config-next` — Storybook ESLint addon must not conflict (ignore `.next/**`, `storybook-static/**`).
- No prior Storybook; `package.json:51` has no `@storybook/*` deps. Node `>=24.0.0` satisfies SB 9.

---

## 3. Goals & Non-Goals

### Goals

1. **Single source of docs** — every `components/ui` file has a co-located `*.stories.tsx` (CSF3) + Autodocs.
2. **Token visibility** — MDX pages render colors, spacing, radii, typography, shadows, animations from `app/globals.css:64` and `DESIGN_REFERENCE.md:1`.
3. **Theme + i18n fidelity** — stories render in `light`/`dark` and `en`/`bn` with `next-intl` stub.
4. **A11y by default** — `a11y` addon + `axe-core` (already in `package.json:55` `@axe-core/playwright`) gates PRs.
5. **Zero runtime coupling** — DB, auth, `next/navigation` mocked; stories work offline.
6. **CI-ready** — `pnpm storybook:build` artifact, lint/typecheck pass, optional Chromatic.

### Non-Goals (v1)

- Full app pages as stories (only primitives + composed layout examples).
- Chromatic / Percy mandatory — optional phase 4.
- Design-token JSON export / Style Dictionary (future phase).
- Replacing `COMPONENTS_GUIDE.md` — it becomes generated from stories later, not deleted now.

---

## 4. Decisions & Rationale

| Decision | Choice | Rationale | Alternatives considered |
|----------|--------|-----------|-------------------------|
| **Storybook version** | `storybook@^9.1` with `@storybook/nextjs` framework | Official support for Next.js 16 / RSC; built-in `next` mocking; Vite-based builder fast on Node 24 | v8 LTS — older, no 9 addons; `vite` standalone — lose Next.js specifics |
| **Builder** | `@storybook/nextjs` (webpack via Next) | Honors `next.config.mjs:1`, `tsconfig.json:21` aliases, `postcss.config.mjs:1` Tailwind v4 — no extra config | `vite` builder — needs manual alias/postcss duplication |
| **Styling** | Import `app/globals.css:1` globally via `.storybook/preview.ts` | Guarantees tokens + `tw-animate-css` match app; Tailwind v4 `@import 'tailwindcss'` works via `@tailwindcss/postcss` | CSS modules per story — drifts |
| **Addon set (v1)** | `essentials` (docs/controls/actions/viewport/backgrounds), `a11y`, `interactions`, `theming`, `viewport` | Minimal but covers docs, a11y, play functions | `pseudo-states`, `design-tokens` addon — defer |
| **Story location** | Co-located `components/ui/<name>.stories.tsx` + `stories/foundations/*.mdx` | Discoverability; `glob` search matches component; foundations separate | Central `stories/` for all — extra drift |
| **Testing** | `@storybook/test` (play functions) + keep `vitest` for unit; optional `test-runner` | Play functions test interactions (e.g., `ConfirmDialog` open/close); reuses `jsdom` | Full `playwright` inside SB — heavy |
| **i18n** | Lightweight decorator providing `NextIntlClientProvider` with `messages/en.json` | Avoids real `next-intl/plugin`; stub `useTranslations` | Full `next-intl` routing — complex |
| **Deployment** | `storybook-static/` to Vercel (`vercel --prod` separate project) or GitHub Pages | Zero infra; aligns with Vite `docs/` preview pattern | Chromatic host only — vendor lock |

---

## 5. Proposed Architecture

```
.storybook/
  main.ts              # @storybook/nextjs, addons, staticDirs: ["../public"]
  preview.ts           # import "../app/globals.css", theme + i18n decorators, parameters
  theme.ts             # brand theme (primary #0070F3 / dark variant)
  vitest.setup.ts?     # optional SB Vitest bridge
components/
  ui/
    button.tsx
    button.stories.tsx          # CSF3, meta + variants
    alert.tsx / alert.stories.tsx
    ... (one per ui file)
  sections/
    hero.stories.tsx            # composed example (optional, v2)
stories/
  foundations/
    Introduction.mdx
    Colors.mdx                  # swatches from app/globals.css:64
    Typography.mdx              # --font-sans/heading/display + hierarchy DESIGN_REFERENCE.md:211
    SpacingRadii.mdx
    ShadowsGlass.mdx            # DESIGN_REFERENCE.md:4
    Animations.mdx              # @keyframes blob/float/shimmer
    Icons.mdx                   # lucide-react
```

**CSF3 pattern (example):**

```tsx
// components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from './button'
const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: { variant: { control: 'select' }, size: { control: 'select' } },
}
export default meta
type Story = StoryObj<typeof Button>
export const AllVariants: Story = { render: () => /* grid of variants */ }
```

**Decorators in `preview.ts`:**

- Theme: read `globals.css` class `.dark`; toolbar `● light | dark` toggles `document.documentElement.classList`.
- i18n: `<NextIntlClientProvider locale={globalThis.locale}>` + toolbar `EN|BN`.
- Next.js: stub `next/navigation` (`useRouter`, `usePathname`) via `parameters.nextjs` (SB 9 feature).

---

## 6. Implementation Phases

### Phase 0 — Preparation (0.5 day)

| Task | Details | Acceptance |
|------|---------|------------|
| 0.1 Audit freeze | Confirm 19 `ui` files list via `glob`; capture `DESIGN_REFERENCE.md` token values | Checklist in PR desc |
| 0.2 Branch & deps | `git checkout -b feat/storybook`; pin `storybook@^9.1.8` | `pnpm install` clean |
| 0.3 RFC review | Share this plan in PR/Notion | 1 approver |

### Phase 1 — Bootstrap & Theming (1–2 days)

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1.1 | Init SB | `.storybook/main.ts`, `.storybook/preview.ts`, `.storybook/theme.ts` | `npx storybook@latest init --type nextjs` (skip install if manual). Configure `framework: '@storybook/nextjs'`, `addons: [a11y, docs, controls, viewport, backgrounds, interactions]`, `staticDirs: ['../public']`, `features: { experimentalRSC: true }`. |
| 1.2 | Tailwind v4 wiring | `.storybook/preview.ts` | `import '../app/globals.css'`; verify `@tailwindcss/postcss` (`postcss.config.mjs:1`) is picked up. Add `tags: ['autodocs']` globally. |
| 1.3 | Alias & TS | `.storybook/main.ts` | Ensure `tsconfig.json:21` `@/*` respected (SB does via Next plugin). Verify `next-env.d.ts` not broken. |
| 1.4 | Theme decorator | `.storybook/preview.ts`, `.storybook/manager.ts` | Toolbar `theme` (light/dark); sync to `html.classList.toggle('dark')`. Use `app/globals.css:118` `.dark` vars. Backgrounds addon matches `--background`. |
| 1.5 | Preview parameters | `.storybook/preview.ts` | `controls.matchers: { color: /(background|color)$/i, date: /Date$/i }`, `a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } }`, `viewport` with `640/768/1024`, `layout: 'centered'` default. |
| 1.6 | i18n stub | `.storybook/preview.ts`, `stories/decorators.tsx` | Provide `NextIntlClientProvider` + messages from `messages/en.json` & `bn.json`; toolbar locale. Stub `i18n/request.ts`. |
| 1.7 | Scripts | `package.json:5` | Add `storybook: "storybook dev -p 6006"`, `storybook:build: "storybook build"`, `storybook:test: "test-storybook"` (optional). |
| 1.8 | Ignores | `.gitignore`, `eslint.config.mjs:8` | Add `storybook-static/`; extend `globalIgnores` for it. |

**Exit criteria:** `pnpm storybook` boots at 6006; `pnpm storybook:build` produces `storybook-static/`; light/dark toggles tokens; `pnpm lint` + `pnpm typecheck` green.

### Phase 2 — Foundations MDX (1 day)

| # | Page | Source | Content |
|---|------|--------|---------|
| 2.1 | `Introduction.mdx` | `README.md:1`, `ARCHITECTURE.md:1` | Why Storybook, stack, `components.json:5` style `base-nova` |
| 2.2 | `Colors.mdx` | `app/globals.css:64` | Swatches for `--primary/#0070F3`, `--background`, `--chart-*`, `--sidebar-*`; light/dark table |
| 2.3 | `Typography.mdx` | `app/globals.css:7`, `DESIGN_REFERENCE.md:211` | `Hind Siliguri` + `Inter`, scale H1 `text-5xl` → meta `text-xs`, weights 400–900 |
| 2.4 | `SpacingRadii.mdx` | `app/globals.css:55`, `DESIGN_REFERENCE.md:192` | `--radius: 0.5rem` → `sm/md/lg/xl/2xl/3xl/4xl`, `rounded-*` demo |
| 2.5 | `ShadowsGlass.mdx` | `DESIGN_REFERENCE.md:4` | Glass `bg-white/40 + backdrop-blur-xl`, soft shadows `shadow-lg hover:shadow-2xl` |
| 2.6 | `Animations.mdx` | `app/globals.css:171` | `fade-in-up`, `blob` 7s, `float` 6s, `shimmer`, reduced-motion MQ |
| 2.7 | `Icons.mdx` | `package.json:40` `lucide-react` | Icon grid with search, sizing guidance |

### Phase 3 — Component Stories (3–4 days, prioritized)

**Tier 1 — Primitives (do first):**

| Component | Stories | Key controls / play |
|-----------|---------|---------------------|
| `button.tsx:1` (`cva` variants) | `Default`, `Outline`, `Ghost`, `Destructive`, `Link`, `AllSizes`, `WithIcon`, `Disabled`, `AsChild` | `variant`, `size`, `disabled`; play: click + `actions` |
| `alert.tsx:1` | `Error/Warning/Success/Info`, `WithTitle`, `Dismissible`, `NonDismissible` | `variant`, `title`, `dismissible`; play: dismiss |
| `form-field.tsx` | `Default`, `WithError`, `WithHelpText`, `Required` | `label`, `error`, `required` |
| `status-badge.tsx` | `AllStatuses`, `Sizes`, `WithoutIcon` | `status`, `size`, `showIcon`; matrix of `pending/approved/...` |
| `skeleton.tsx:1` | `Skeleton`, `StatCardSkeleton`, `TableSkeleton`, `CardSkeleton`, `DashboardSkeleton` | `rows` prop |

**Tier 2 — Interactive:**

| Component | Stories |
|-----------|---------|
| `confirm-dialog.tsx` | `Default`, `Destructive`, `Loading`, `LongDescription`; play: open → confirm/cancel |
| `data-table.tsx` | `Default`, `Sortable`, `Selectable`, `Paginated`, `StickyHeader`, `Empty`; mock 20 rows; controls `sortColumn/sortDir` |
| `filter-bar.tsx` | `WithSearch`, `WithSelect`, `MultipleFilters`, `EmptyState` |
| `bulk-actions.tsx` | `SingleAction`, `MultipleActions`, `SelectAll` |
| `empty-state.tsx` | `Default`, `WithAction`, `NoIcon` |
| `panel-layout.tsx` | `Default`, `WithHeader`, `Responsive` |

**Tier 3 — Advanced / admin:**

| Component | Stories |
|-----------|---------|
| `calendar-view.tsx` | `Default`, `WithData`, `Loading`; mock `attendanceData` |
| `date-range-picker.tsx` | `Default`, `WithPresets`, `Controlled` |
| `chart-card.tsx` | `Default`, `Loading`, `Empty`, `WithError`, `WithRecharts` (wrap small `recharts` line) |
| `stat-card.tsx` | `Default`, `WithTrend`, `Grid` |
| `info-row.tsx`, `lightbox.tsx`, `fade-in.tsx` | Simple demonstrations |

**Tier 4 — Composed / site (optional v1 stretch):**

- `section-heading.tsx`, `components/sections/hero.tsx` (mock `lib/cms` data), `site-header.tsx` with `next/navigation` stub, `payment-receipt.tsx` print story.

**Quality bar per story:**

- `tags: ['autodocs']`, `argTypes` inferred + explicit controls, `parameters.a11y` passing.
- Dark-mode snapshot (addon backgrounds or theme toggle screenshot in docs).
- Interaction test where applicable (`play` using `@storybook/test` `userEvent`).

### Phase 4 — Quality & CI (1 day)

| # | Task | Details |
|---|------|---------|
| 4.1 | A11y gating | Enable `a11y` panel; `pnpm test-storybook` (test-runner) or `vitest` addon; fail on violations |
| 4.2 | Lint/type | Verify `eslint.config.mjs` ignores `storybook-static`; `pnpm typecheck` includes `.storybook/*.ts` + `*.stories.tsx` |
| 4.3 | Build proof | `pnpm storybook:build` in CI (` .github/workflows/ci.yml` parallel job) — artifact `storybook-static` |
| 4.4 | Deploy preview | Vercel project `iscexpo-storybook` or GitHub Pages; `pnpm dlx chromatic` optional manual run |
| 4.5 | Docs index | Update `README.md:174` Project Structure + add `## Design System (Storybook)` section with `pnpm storybook` URL |

### Phase 5 — Optional Enhancements (future, not blocking)

- `@storybook/addon-designs` linking Figma
- `@chromatic-com/storybook` visual regression on PRs
- Token JSON via `style-dictionary` from `app/globals.css:64`
- MDX `COMPONENTS_GUIDE.md` auto-generated deprecation notice

---

## 7. Scripts & Config Diffs

```diff
// package.json:6 scripts
+ "storybook": "storybook dev -p 6006",
+ "storybook:build": "storybook build",
+ "storybook:test": "test-storybook" // optional

// devDependencies (indicative)
+ "@storybook/nextjs": "^9.1.8",
+ "@storybook/addon-a11y": "^9.1.8",
+ "@storybook/addon-docs": "^9.1.8",
+ "@storybook/addon-interactions": "^9.1.8",
+ "@storybook/addon-viewport": "^9.1.8",
+ "@storybook/test": "^9.1.8",
+ "storybook": "^9.1.8",
+ "eslint-plugin-storybook": "^0.12.0" // if desired

// .gitignore
+ storybook-static/

// eslint.config.mjs:8
globalIgnores(['.next/**','node_modules/**','coverage/**','playwright-report/**','test-results/**','storybook-static/**'])
```

---

## 8. Directory & Naming Conventions

- Stories co-located: `button.tsx` ↔ `button.stories.tsx` (same folder, same casing).
- Titles: `Design System/<Category>/<Component>` e.g. `Design System/Forms/FormField`, `Design System/Data/DataTable`, `Design System/Foundations/Colors`.
- MDX: `stories/foundations/*.mdx` with `title: Foundations/Colors`.
- No `*.stories.ts` — always `*.stories.tsx` (React).

---

## 9. Mocking Strategy

| Need | Approach |
|------|----------|
| `next/navigation` `useRouter`, `usePathname`, `Link` | SB 9 `parameters.nextjs.navigation` mock; provide no-op router |
| `next-intl` `useTranslations` | Wrapper decorator with `NextIntlClientProvider`; fallback identity function |
| `next/image` | SB's Nextjs framework auto-mocks to `<img>`; allow `unoptimized: true` (`next.config.mjs:7`) |
| `window`, `localStorage` (theme, toast) | `jsdom` in preview; no extra mock |
| API / DB | Never imported in stories; use static prop data |

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tailwind v4 `@import 'tailwindcss'` not processed by SB's PostCSS | Medium — styles missing | Confirm `@tailwindcss/postcss` used; import `globals.css` before any story; fallback: add `postcss` config to `.storybook/main.ts` `viteFinal` |
| RSC / `server` components fail in SB | High | Only story client components (`'use client'` like `alert.tsx:1`, `button.tsx:1`); wrap server parts as static MDX examples |
| `Base UI` `ButtonPrimitive` proxy disrupts controls | Low | Declare `render`, `nativeButton` in `argTypes` as `control: false` |
| Build time + bundle size (recharts, lucide) | Medium | Dynamic import in `chart-card` story; `lucide-react` tree-shakes; SB isolates |
| 19 stories * 4 variants = 80 stories maintenance | Medium | Autodocs generate prop tables; `AllVariants` grid reduces duplication |

---

## 11. Acceptance Criteria (DoD for v1)

- [ ] `pnpm storybook` launches on `http://localhost:6006` without DB/env.
- [ ] `pnpm storybook:build` succeeds; `storybook-static/index.html` contains branded title.
- [ ] ≥7 foundation MDX pages render with correct tokens (visual compare to `DESIGN_REFERENCE.md`).
- [ ] Tier-1 + Tier-2 stories (≥12 components) have `autodocs` + controls + a11y pass.
- [ ] Light/dark toolbar toggles `app/globals.css:64` vs `:118` vars visibly.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test -- --run` still green; `eslint.config.mjs` updated.
- [ ] CI runs `storybook:build` (separate job, cached `node_modules`).
- [ ] `README.md` + `docs/` updated; `COMPONENTS_GUIDE.md` cross-links to Storybook.

---

## 12. Timeline Estimate

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 0 Prep | 0.5 d | 0.5 d |
| 1 Bootstrap | 1.5 d | 2 d |
| 2 Foundations | 1 d | 3 d |
| 3 Component stories | 3.5 d | 6.5 d |
| 4 Quality & CI | 1 d | 7.5 d |
| **Total v1** | **~7–8 days** (1 dev) |  |

Buffer +1d for Tailwind v4 / Next.js 16 troubleshooting. Optional Phase 5 adds ~2d later.

---

## 13. Open Questions (need PO/Design)

1. Host choice: separate Vercel project vs GitHub Pages vs Chromatic-only — decision before Phase 4.4.
2. Should `components/sections/*` be documented in SB or remain app-only? Proposal: one `Sections/Hero` example, rest deferred.
3. Brand token source of truth: keep `DESIGN_REFERENCE.md:60` (`#2563EB`) vs `app/globals.css:77` (`#0070F3`) — unify before Colors MDX.
4. Accessibility target: WCAG 2.1 AA baseline (4.5:1) per `DESIGN_REFERENCE.md:229` — enforce in a11y addon?

---

## 14. References

- `package.json:27` deps, `components.json:1`, `app/globals.css:1`, `DESIGN_REFERENCE.md:1`, `COMPONENTS_GUIDE.md:1`, `ARCHITECTURE.md:1`, `PROJECT_PLAN.md:1`, `tsconfig.json:1`, `next.config.mjs:1`, `postcss.config.mjs:1`, `vitest.config.ts:1`, `eslint.config.mjs:1`, `components/ui/button.tsx:1`, `components/ui/alert.tsx:1`, `components/ui/skeleton.tsx:1`.

---

*Next step: approve this plan, then create branch `feat/storybook` and execute Phase 1.1 bootstrap.*
