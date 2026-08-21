# Docker Structure — Implementation Plan

> **Status:** Draft — Planning only
> **Date:** 2026-08-21
> **Stack:** Next.js 16 / Node 24 / pnpm 10.34.3 / Postgres 15 / Playwright 1.61.1
> **Author:** OpenCode (Muse Spark)

---

## 1. Executive Summary

Reorganize ad-hoc root Docker files into a standard `docker/` layout and add missing environments for **E2E** and **Dev Container**. Target layout (requested by `docker/{docker-compose.e2e.yml,docker-compose.yml,devcontainer,api/Dockerfile}`):

```
docker/
  docker-compose.yml          # dev (replaces root docker-compose.yml)
  docker-compose.e2e.yml      # e2e (app + db + playwright, no host webServer)
  api/Dockerfile              # production api/app image (standalone, non-root, healthcheck)
  # + devcontainer/ is actually .devcontainer/ at repo root (VS Code spec)
.devcontainer/
  devcontainer.json
  docker-compose.yml          # optional devcontainer compose
```

No runtime behavior change for Vercel prod; Docker remains for local dev, CI, and Playwright. Root `Dockerfile`/`docker-compose.yml` become deprecated (kept as symlink or removed after migration).

---

## 2. Current State Audit

| Layer | Location | Evidence | Gap |
|-------|----------|----------|-----|
| **Dockerfile** | `Dockerfile:1` (28 lines) | Multi-stage `node:24-bullseye-slim` base `pnpm install` → `pnpm build` → runner `node:24-bullseye-slim` copy `.next`+`node_modules`+`public` `pnpm start` on 3000 | No `output: standalone` (`next.config.mjs:1`), no non-root `USER`, no `HEALTHCHECK`, `bullseye-slim` (Debian) larger than `alpine`, copies full `node_modules` (not `standalone` + `pruned`) |
| **Compose (dev)** | `docker-compose.yml:1` (38 lines) | `version: '3.9'` (deprecated), services `app` (build `.`/`Dockerfile`, `pnpm dev`, `depends_on: [db]`) + `db` (`postgres:15`, `db-data` volume, `5432:5432`), env `DATABASE_URL: postgres://postgres:postgres@db:5432/postgres` `BETTER_AUTH_SECRET` default | No `redis` (app uses `@upstash/redis:1.38.0` `package.json:35` but local dev needs no Upstash), no `healthcheck` for `db`, no `profiles`, runs `pnpm dev` inside `runner` image that was built for `pnpm start` (mismatch) |
| **E2E compose** | missing | `playwright.config.ts:26` `webServer: { command: 'pnpm dev', url: 'http://localhost:3000', reuseExistingServer: !CI }` with `DATABASE_URL: postgres://user:password@localhost:5432/db` test DB | No `docker/docker-compose.e2e.yml` — CI cannot run E2E in isolated `postgres` + `app` + `playwright` without host `pnpm dev`; `playwright.config.ts:19` `baseURL: http://localhost:3000` hard-codes host |
| **DevContainer** | missing | `.vscode/mcp.json:1` exists, but no `.devcontainer/devcontainer.json` | No one-click Codespaces / VS Code Remote with Node 24 + pnpm 10.34 + Postgres forwarding; new contributors must manually `corepack enable` |
| **API Dockerfile** | missing | `app/api/*` routes (55+ files) are Next.js Route Handlers, not standalone service; no `docker/api/Dockerfile` | Requested `docker/api/Dockerfile` — interpret as production-optimized Next.js image (or slim `api` target) for `docker/docker-compose.yml` |
| **Ignore** | `.dockerignore:1` (10 lines) | `node_modules`, `.next`, `.env*`, `.DS_Store`, `coverage`, `dist` | Missing `.git`, `.turbo`, `storybook-static`, `playwright-report`, `test-results`, `*.log` |

**References:** `package.json:91` `engines node >=24.0.0`, `persistence` `pnpm-workspace.yaml:1`, `ARCHITECTURE.md:1`, `drizzle.config.ts:1` (`lib/db/migrations`), `e2e/` (5 tests), `scripts/seed-demo-admin.ts:1`.

---

## 3. Goals & Non-Goals

### Goals

1. **Standard layout:** `docker/docker-compose.yml` (dev), `docker/docker-compose.e2e.yml` (CI E2E), `docker/api/Dockerfile` (prod), `.devcontainer/devcontainer.json` (VS Code) — root `Dockerfile`/`docker-compose.yml` deprecated (symlink or removed).
2. **Dev parity:** `pnpm dev` + `postgres:15` + `redis:7-alpine` (optional, `profile: cache`) + healthchecks; mirrors `docker-compose.yml:12` `DATABASE_URL` but adds `REDIS_URL` if needed for `lib/core/rate-limit.ts`.
3. **E2E isolation:** `docker-compose.e2e` builds `app` (production `pnpm build` + `pnpm start` on 3000), `db` fresh, `playwright` service (`mcr.microsoft.com/playwright:v1.61.1-jammy`) runs `pnpm test:e2e` without host `webServer` (`playwright.config.ts:26` `reuseExistingServer: !CI`).
4. **Prod hardening:** `docker/api/Dockerfile` uses `node:24-alpine`, `output: standalone` (`next.config.mjs`), `USER nextjs`, `HEALTHCHECK CMD wget`, multi-stage with `deps` + `builder` + `runner`, `pnpm --prod --frozen-lockfile`.
5. **DevContainer:** Node 24 + pnpm 10.34.3 + `forwardPorts: [3000,5432]`, `postCreateCommand: pnpm install`, `customizations.vscode.extensions` (ms-vscode.vscode-typescript-next, bradlc.vscode-tailwindcss, esbenp.prettier-vscode, ms-playwright.playwright).
6. **CI:** `.github/workflows/ci.yml:1` adds `docker build` smoke test (optional) and `docker compose -f docker/docker-compose.e2e.yml up --exit-code-from playwright`.

### Non-Goals (v1)

- Kubernetes/Helm, separate `api` service extraction (Next.js monolith stays).
- Vercel Blob / Upstash Redis mock in Docker (keep Upstash cloud for `lib/media/storage.ts`).
- Arm64 multi-arch builds (defer).

---

## 4. Decisions & Rationale

| Decision | Choice | Rationale | Alternatives |
|----------|--------|-----------|--------------|
| **Base image** | `node:24-alpine` (3 stages: `deps`, `builder`, `runner`) | Alpine 45 MB vs `bullseye-slim` 80 MB; Node 24 matches `package.json:91` and `.nvmrc:1` `24` | `node:24-slim` — larger |
| **Next.js standalone** | Enable `output: 'standalone'` in `next.config.mjs:1` (or keep copy `.next/standalone`) | Shrinks `runner` to `standalone` + `public` + `static`; Docker `COPY` only `standalone` | Copy full `.next` + `node_modules` (current `Dockerfile:22`) — 900 MB |
| **Compose location** | `docker/docker-compose.yml` + `docker/docker-compose.e2e.yml`; root `docker-compose.yml` → symlink `docker/docker-compose.yml` for 1-release backward compat | Requested `docker/{...}` layout; keeps root clean (`docs/README.md` root minimal) | Keep both root + docker/ — drifts |
| **E2E image** | `mcr.microsoft.com/playwright:v1.61.1-jammy` (matches `@playwright/test:1.61.1` `package.json:60`) | Pre-installed browsers, no `npx playwright install` in CI | `playwright:next` — unpinned |
| **DevContainer** | `.devcontainer/devcontainer.json` (VS Code spec) + `.devcontainer/docker-compose.yml` reusing `docker/docker-compose.yml` `app` + `db` | Spec requires `.devcontainer/` at root (`https://containers.dev`); references `docker/` compose via `dockerComposeFile: ["../docker/docker-compose.yml"]` | `docker/devcontainer/` — not discovered by VS Code |
| **API Dockerfile** | `docker/api/Dockerfile` = thin wrapper `FROM` `docker/Dockerfile` target `runner` or standalone copy (same Next.js image; `api` folder for future split) | Satisfies requested `docker/api/Dockerfile` without duplicating `Dockerfile:1`; `docker/docker-compose.yml` `app` `build: { context: ., dockerfile: docker/api/Dockerfile }` | Duplicate `Dockerfile` — maintain two |
| **.dockerignore** | Extend to `.git`, `.turbo`, `storybook-static`, `playwright-report`, `coverage`, `*.log`, `.env*.local`, `.next/dev` | Reduce context from 1.3 GB to ~12 MB (`docker build` context) | Keep minimal ` .dockerignore:1` — slow builds |

---

## 5. Proposed Architecture

```
.
├── Dockerfile                          # deprecated → symlink to docker/api/Dockerfile (or removed after 1 release)
├── docker-compose.yml                  # deprecated → symlink to docker/docker-compose.yml
├── docker/
│   ├── docker-compose.yml              # dev: app (pnpm dev) + db (postgres:15) [+ redis]
│   ├── docker-compose.e2e.yml          # e2e: app (pnpm start) + db (fresh) + playwright (no webServer)
│   └── api/
│       └── Dockerfile                  # prod: node:24-alpine deps→builder→runner, standalone, USER nextjs, HEALTHCHECK
├── .devcontainer/
│   ├── devcontainer.json               # name: iscexpo, build.dockerfile: ../docker/api/Dockerfile, features: node 24 + pnpm, forwardPorts
│   └── docker-compose.yml              # (optional) extends ../docker/docker-compose.yml
└── .dockerignore                       # extended
```

**docker/docker-compose.yml (dev):**
```yaml
services:
  db:
    image: postgres:15-alpine
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U postgres"], interval: 5s, retries: 5 }
    volumes: [db-data:/var/lib/postgresql/data]
  redis:
    image: redis:7-alpine
    profiles: [cache]
  app:
    build: { context: ., dockerfile: docker/api/Dockerfile, target: dev }
    command: pnpm dev --hostname 0.0.0.0
    ports: ["3000:3000"]
    depends_on: { db: { condition: service_healthy } }
    env_file: [.env.development.local, .env]
    environment: { DATABASE_URL: postgres://postgres:postgres@db:5432/postgres, BETTER_AUTH_SECRET: supersecret... }
volumes: { db-data: {} }
```

**docker/docker-compose.e2e.yml:**
```yaml
services:
  db:
    image: postgres:15-alpine
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U postgres"], interval: 2s, retries: 10 }
  app:
    build: { context: ., dockerfile: docker/api/Dockerfile, target: runner }
    command: pnpm start
    ports: ["3000:3000"]
    depends_on: { db: { condition: service_healthy } }
    environment: { DATABASE_URL: postgres://postgres:postgres@db:5432/postgres, NODE_ENV: production }
  playwright:
    image: mcr.microsoft.com/playwright:v1.61.1-jammy
    depends_on: { app: { condition: service_started } }
    volumes: [".:/work", "/work/node_modules"]
    working_dir: /work
    command: pnpm test:e2e
    environment: { BASE_URL: http://app:3000, CI: "1" }
```

**docker/api/Dockerfile (3 stages):**
```dockerfile
# syntax=docker/dockerfile:1
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build # requires output: standalone in next.config.mjs

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]

FROM deps AS dev
CMD ["pnpm", "dev"]
```

**`.devcontainer/devcontainer.json`:**
```json
{
  "name": "iscexpo",
  "dockerComposeFile": ["../docker/docker-compose.yml"],
  "service": "app",
  "workspaceFolder": "/workspaces/iscexpo",
  "forwardPorts": [3000, 5432],
  "postCreateCommand": "pnpm install --no-frozen-lockfile && pnpm approve-builds --all",
  "customizations": { "vscode": { "extensions": ["bradlc.vscode-tailwindcss","esbenp.prettier-vscode","ms-playwright.playwright"] } }
}
```

---

## 6. Implementation Phases

### Phase 0 — Prep (0.25d)

| # | Task | Acceptance |
|---|------|------------|
| 0.1 | `docker build` context check `docker build --progress=plain .` size | Current 1.3 GB → target <50 MB after `.dockerignore` |
| 0.2 | Pin `postgres:15-alpine` vs `15` (alpine smaller) | `docker-compose.yml:26` updated |

### Phase 1 — Docker Layout (0.5d)

| # | File | Details |
|---|------|---------|
| 1.1 | `docker/api/Dockerfile` | Create 3-stage `deps`/`builder`/`runner` + `dev` target; `USER nextjs`; `HEALTHCHECK` |
| 1.2 | `docker/docker-compose.yml` | Move `docker-compose.yml:1` → `docker/docker-compose.yml` (remove `version` key, add `healthcheck`, `redis` profile, `env_file`) |
| 1.3 | Root symlink | `ln -s docker/docker-compose.yml docker-compose.yml` + `ln -s docker/api/Dockerfile Dockerfile` (or deprecate with README note) |
| 1.4 | `.dockerignore` | Extend with `.git`, `.turbo`, `storybook-static`, `playwright-report`, `coverage`, `*.log`, `.env*.local` |
| 1.5 | `next.config.mjs:1` | Add `output: 'standalone'` (if not already) for `runner` stage |

### Phase 2 — E2E Compose (0.5d)

| # | File | Details |
|---|------|---------|
| 2.1 | `docker/docker-compose.e2e.yml` | Define `db` fresh, `app` `target: runner` `pnpm start`, `playwright` `mcr.microsoft.com/playwright:v1.61.1-jammy` `pnpm test:e2e` `BASE_URL: http://app:3000` |
| 2.2 | `playwright.config.ts:26` | Keep `webServer` but when `BASE_URL=http://app:3000` (Docker), `reuseExistingServer: false` handles `docker` case; document `docker compose -f docker/docker-compose.e2e.yml up --exit-code-from playwright` |
| 2.3 | `e2e/utils` | Ensure `BASE_URL` env respected (`playwright.config.ts:19`) |

### Phase 3 — DevContainer (0.5d)

| # | File | Details |
|---|------|---------|
| 3.1 | `.devcontainer/devcontainer.json` | `name: iscexpo`, `dockerComposeFile: ../docker/docker-compose.yml`, `service: app`, `workspaceFolder`, `forwardPorts`, `postCreateCommand`, `customizations` |
| 3.2 | `.devcontainer/docker-compose.yml` (optional) | Override `app` `command: sleep infinity` for VS Code attach vs `pnpm dev` |

### Phase 4 — CI & Docs (0.5d)

| # | Task | File |
|---|------|------|
| 4.1 | Add `docker` smoke job | `.github/workflows/ci.yml:1` — `docker build -f docker/api/Dockerfile .` + `docker compose -f docker/docker-compose.yml config` |
| 4.2 | Add E2E job (optional) | `docker compose -f docker/docker-compose.e2e.yml up --abort-on-container-exit` (matrix `chromium`/`mobile`) |
| 4.3 | Update `README.md:98` Docker section | Replace `docker compose up --build` with `docker compose -f docker/docker-compose.yml up --build` + devcontainer open + E2E `docker/docker-compose.e2e.yml` |
| 4.4 | Update `docs/README.md:1` | Add `docker/*` map |
| 4.5 | Verify `pnpm build` with `output: standalone` produces `.next/standalone/server.js` | `ls .next/standalone` |

**Exit criteria:**

- `docker compose -f docker/docker-compose.yml up --build -d` → `http://localhost:3000` 200, `db` healthy
- `docker compose -f docker/docker-compose.e2e.yml up --exit-code-from playwright` → Playwright 5 tests pass (or `playwright-report` artifact)
- `devcontainer` opens in VS Code (or `devcontainer build` CLI) with Node 24 + pnpm
- `docker build -f docker/api/Dockerfile --target runner .` size <250 MB (vs 900 MB before)
- `pnpm lint`/`typecheck`/`test` still green (no runtime change)

---

## 7. File Inventory (to create/update)

| File | Action | Notes |
|------|--------|-------|
| `docker/api/Dockerfile` | **Create** | Prod 3-stage, `USER nextjs`, `HEALTHCHECK` |
| `docker/docker-compose.yml` | **Create** (move) | Dev with `healthcheck` + `redis` profile |
| `docker/docker-compose.e2e.yml` | **Create** | E2E with `playwright` service |
| `.devcontainer/devcontainer.json` | **Create** | VS Code + `docker/docker-compose.yml` |
| `.devcontainer/docker-compose.yml` | **Create** (optional) | DevContainer override |
| `Dockerfile` | **Symlink / deprecate** | `ln -s docker/api/Dockerfile` |
| `docker-compose.yml` | **Symlink / deprecate** | `ln -s docker/docker-compose.yml` |
| `.dockerignore` | **Update** | Add `.git`, `.turbo`, `storybook-static`, `playwright-report` |
| `next.config.mjs` | **Update** | `output: 'standalone'` |
| `.github/workflows/ci.yml` | **Update** | Add `docker` + `e2e` jobs |
| `README.md` | **Update** | Docker section |
| `docs/README.md` | **Update** | Docker map |

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `output: standalone` breaks `pnpm start` | High — `server.js` not found | Keep fallback `COPY .next` + `package.json` if `standalone` missing; test `pnpm build` locally |
| `alpine` missing `sharp` deps | Medium — image build fails | Install `apk add vips-dev` or use `node:24-slim` if `sharp` needed for `next/image` |
| `playwright` image `jammy` vs `alpine` mismatch (ICU) | Low — browser launch fails | Pin `mcr.microsoft.com/playwright:v1.61.1-jammy` matches `@playwright/test:1.61.1` |
| Root symlink breaks `docker build .` context | Low — `COPY . .` includes `docker/` | Use `docker build -f docker/api/Dockerfile .` (context `.` still root) |
| `DATABASE_URL` in E2E `postgres://postgres:postgres@db:5432/postgres` vs `playwright.config.ts:35` `user:password@localhost` | Medium — E2E `webServer` env mismatch | E2E compose sets `DATABASE_URL` and `BASE_URL` explicitly; `playwright.config.ts:19` respects `process.env.BASE_URL` |

---

## 9. Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 0 Prep | 0.25d | 0.25d |
| 1 Docker layout | 0.5d | 0.75d |
| 2 E2E compose | 0.5d | 1.25d |
| 3 DevContainer | 0.5d | 1.75d |
| 4 CI/docs | 0.5d | 2.25d |
| **Total** | **~2.25d** (1 dev) |  |

---

## 10. Open Questions

1. Keep root `Dockerfile`/`docker-compose.yml` as symlinks for 1 release or remove immediately? (Propose symlink + deprecation note in `README.md`.)
2. E2E `db` should be ephemeral (`tmpfs`) or `volume: db-data-e2e`? (Propose `tmpfs` for CI speed.)
3. Include `redis:7-alpine` in `docker/docker-compose.yml` as `profiles: [cache]` or always on? (Propose profile, since Upstash is cloud prod.)

---

## 11. References

- `Dockerfile:1` (28 lines), `docker-compose.yml:1` (38 lines), `.dockerignore:1`, `next.config.mjs:1`, `package.json:91` Node 24, `pnpm-workspace.yaml:1`, `playwright.config.ts:19` (`baseURL`/`webServer`), `drizzle.config.ts:1`, `ARCHITECTURE.md:1`, `.github/workflows/ci.yml:1`, `e2e/` tests, `lib/media/storage.ts` (Vercel Blob).

---

*Next step: approve layout (symlink vs remove) and `output: standalone`, then create branch `feat/docker-structure` and execute Phase 1.*
