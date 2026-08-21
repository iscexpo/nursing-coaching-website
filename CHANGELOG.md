# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Design System Storybook 10 (`b48e99e`) — foundations MDX + 15 component stories, `storybook:build` job
- Git standard structure: `.gitattributes`, `.editorconfig`, `.nvmrc`/`.node-version`, `CODEOWNERS`, PR/issue templates, `dependabot.yml`, hardened `.gitignore`, `CONTRIBUTING.md`, `SECURITY.md`

### Changed

- CI now uses `pnpm` cache and covers all branches; added `storybook` job

### Fixed

- `ShadowsGlass.mdx` MDX parse for `<15.1` → `&lt;15.1`

## [0.1.0] — 2026-08-21

- Initial LMS with auth, admin, enrollment, payments, exams, attendance, reports, i18n
