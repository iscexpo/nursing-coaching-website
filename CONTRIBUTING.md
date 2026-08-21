# Contributing to ISC Expo

Thank you for contributing! This document describes how to work with this Git repository.

## Branching

- `main` is protected — all changes via Pull Request.
- Create feature branches from `main`: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`.
- Keep branches short-lived; rebase on `main` before review.
- Vercel `v0/...` branches are ephemeral — do not branch off them for long-lived work.

## Commits

We follow **Conventional Commits**:

```
feat: add course categories CRUD
fix: handle null enrollment status
chore: bump next to 16.2.6
docs: update installation guide
```

Scopes (optional): `api`, `db`, `auth`, `ui`, `i18n`, `e2e`, `ci`.

- Use `fix:` / `feat:` for semver-relevant changes.
- Keep subjects imperative, ≤ 72 chars, no period.
- Reference issues: `Closes #123` in body.

## Quality gates (run before push)

```bash
pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm build        # or pnpm storybook:build for UI
# if i18n changed
pnpm i18n:check
# if db changed
pnpm db:verify
```

Hooks are not enforced locally — CI will fail if gates do not pass.

## Pull Requests

- Fill `PULL_REQUEST_TEMPLATE.md`.
- Keep PRs < 400 lines where possible; split large refactors.
- Require 1 approval; `CODEOWNERS` review for `/lib/db`, `/lib/auth`, `/app/api`.
- Squash-merge is default; preserve conventional title for changelog.

## Code style

- Prettier (`pnpm format:check`), ESLint (`eslint.config.mjs`), Tailwind v4 (`app/globals.css:1`).
- LF endings enforced via `.gitattributes` and `.editorconfig` (2 spaces).
- Node `24` (`package.json:engines`, `.nvmrc`).

## Secrets

Never commit `.env*`, `e2e/auth.json`, or tokens. Use `.env.example` as template and `.env.development.local` for local dev (gitignored).

## Reporting issues

Use GitHub Issue templates: Bug report / Feature request. For security, see `SECURITY.md`.

## Releases

- `CHANGELOG.md` follows Keep-a-Changelog.
- Tag releases `vX.Y.Z` off `main`; CI builds and migrates on `main` pushes.
