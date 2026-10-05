# Production Architecture

## Domain boundaries

- `sales.ts`: checkout and sale persistence.
- `order-state.ts` / `order-service.ts`: explicit order lifecycle and immutable order events.
- `inventory-reservations.ts`: temporary stock holds, consume/release/expiry.
- `returns.ts`: return eligibility, approval and refund records.
- `support.ts`: customer/admin support tickets and messages.
- `idempotency.ts`: replay protection for mutation endpoints.
- `media.ts`: MIME/signature/size validation and media ownership records.
- `business-metrics.ts`: read-only KPI aggregation.

## Order lifecycle

`PENDING_PAYMENT → PAYMENT_REVIEW → PAID → PROCESSING → PACKED → SHIPPED → DELIVERED`

Cancellation/payment failure and return transitions are explicitly constrained by `order-state.ts`.

## Inventory invariant

Pending orders reserve stock. Paid orders consume the reservation and decrement physical stock. Cancelled/failed pending orders release the reservation without changing physical stock.

## Persistence

GitHub JSON remains the persistence adapter. Multi-file mutations use the existing tree commit mechanism and conflict retry. No UI or domain code talks directly to GitHub APIs.

## Operational endpoints

- `/api/health` — liveness.
- `/api/health/ready` — storage/schema readiness.
- `/api/admin/data-integrity` — referential and business consistency checks.

## Recovery

Run `npm run backup:data` before production migrations and `npm run migrate:data` after deployment. The migration script is idempotent and only creates missing schema files.
