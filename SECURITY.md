# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| `main`  | ✅        |

## Reporting a Vulnerability

**Do not** file public issues for security vulnerabilities.

Please email `security@khulnasoft.com` (or contact via `neopilotai/iscexpo` maintainers) with:

- Description, impact, and reproduction steps
- Affected commit / branch
- Suggested fix if available

We will acknowledge within 48h and coordinate a fix before public disclosure.

## Handling

- Secrets are never committed (`.gitignore` covers `.env*`, `e2e/auth.json`).
- Enable `commit.gpgsign` locally for signed commits (already set for `v0` agent).
- Dependencies are scanned via Dependabot (`.github/dependabot.yml`).
- CI does not log secrets; `ISC_AUTH_SECRET` and `DATABASE_URL` are from GitHub Secrets.
