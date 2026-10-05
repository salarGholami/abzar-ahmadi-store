# Production Hardening MVP

This increment preserves the existing JSON/GitHub architecture and adds production boundaries without introducing a database or payment gateway.

## Implemented

1. **Validation** — Zod contracts for login, registration and sale creation.
2. **CSRF** — same-origin enforcement for state-changing `/api/*` requests in Next 16 Proxy, with payment callbacks explicitly isolated.
3. **Security headers** — HSTS in production plus MIME, frame, referrer, permission and cross-origin headers.
4. **Observability** — request IDs and structured server logging on critical auth flows.
5. **Media security** — file-size/type checks, magic-byte validation and traversal-safe media deletion.
6. **Integrity** — reconciliation checks for orphan inventory/sale/finance records and sale subtotal mismatches.
7. **Maintenance** — owner endpoint plus `CRON_SECRET` endpoint for scheduled integrity jobs.
8. **Notifications** — persisted in-app notification service.
9. **Shipping adapter** — provider boundary with a deterministic manual MVP provider.
10. **Messaging adapter** — email/SMS provider boundary ready for an external vendor.
11. **Backup** — Git mirror backup scripts for the GitHub data repository.
12. **Smoke test** — zero-dependency HTTP smoke suite.
13. **Existing performance layer retained** — catalog caching, search normalization and pagination are already present and were not duplicated.
14. **Existing SEO layer retained** — sitemap, robots, metadata and JSON-LD are already present.
15. **Accessibility contract** — centralized checklist targeting the existing shared UI primitives.

## Required environment

```env
AUTH_SECRET=at-least-32-random-characters
GITHUB_OWNER=...
GITHUB_REPO=...
GITHUB_TOKEN=...
GITHUB_BRANCH=main
GITHUB_DATA_PATH=data
DATA_STORAGE_MODE=github
CRON_SECRET=another-random-secret
```

## Operational commands

```bash
npm run typecheck
npm run lint
npm run build
npm run dev
node scripts/smoke-test.mjs
node scripts/backup-data.mjs
```

On Windows, `scripts/backup-data.ps1` provides the same backup flow.

## Deliberately deferred external integrations

- real payment gateway
- database
- real object storage/CDN
- real SMS/email provider
- real carrier APIs
- distributed Redis rate limiting
- browser-level Playwright suite

These are external infrastructure choices, not missing domain architecture. The MVP now exposes adapter boundaries for them.
