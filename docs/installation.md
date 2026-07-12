# Installation Guide

This repository uses `pnpm` with Node.js `24` and requires explicit approval for build scripts in CI and local installs.

## Prerequisites

- Node.js 24
- pnpm (via Corepack)
- A PostgreSQL database connection URL

## Install dependencies

1. Enable Corepack and install pnpm:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

2. Approve pnpm build scripts if pnpm reports ignored builds:

```bash
pnpm approve-builds --all
```

3. Install dependencies:

```bash
pnpm install --no-frozen-lockfile
```

> If you see a warning about ignored build scripts, run `pnpm approve-builds --all` first and then rerun `pnpm install --no-frozen-lockfile`.

## Environment setup

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Then update `.env.local` with your database credentials and authentication secret values.

## Run the development server

```bash
pnpm dev
```

Open the app at `http://localhost:3000`.

## Build and test

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

## Docker

A `Dockerfile` and `docker-compose.yml` are included for local development.

```bash
docker compose up --build
```

This starts the Next.js app and a local Postgres service.

To stop the environment:

```bash
docker compose down
```

## GitHub Actions CI

The repository CI uses:

- Node 24
- `corepack enable` + `corepack prepare pnpm@latest --activate`
- `pnpm approve-builds --all`
- `pnpm install --no-frozen-lockfile`
- `pnpm lint || true`
- `pnpm typecheck`
- `pnpm test -- --coverage`

This file is the authoritative install workflow for local development and CI compatibility.
