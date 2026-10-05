# Release checklist

- [ ] `AUTH_SECRET` is long/random and not the development fallback.
- [ ] `GITHUB_TOKEN` has only the repository permissions required for data/media writes.
- [ ] `CRON_SECRET` is configured and never committed.
- [ ] GitHub repository is private and mirrored to an independent backup target.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] `node scripts/smoke-test.mjs` passes against the deployed URL.
- [ ] Owner maintenance endpoint returns zero integrity issues.
- [ ] Product/customer/order critical flows are manually verified on mobile and desktop.

## Production Domain Hardening

- [ ] Run `npm run migrate:data`
- [ ] Configure GitHub storage and `AUTH_SECRET`
- [ ] Run `npm run test:domain`
- [ ] Run `npm run lint`
- [ ] Run `npm run typecheck`
- [ ] Run `npm run build`
- [ ] Verify `/api/health` and `/api/health/ready`
- [ ] Verify pending checkout creates reservations
- [ ] Verify payment consumes reservation exactly once
- [ ] Verify cancellation releases pending reservations
- [ ] Verify return approval → receive → refund
- [ ] Verify customer cannot access another customer's order/ticket
- [ ] Take a GitHub mirror backup before release
