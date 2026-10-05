# Backend Architecture

## Source of Truth

All business mutations go through Next.js Route Handlers and server-only domain services.

```text
UI → API → Service → GitHub Adapter → data/*.json
```

## Persisted Customer State

- `carts.json`
- `customer-events.json`
- `payment-transactions.json`

## Business State

- `products.json`
- `sales.json`
- `sale-items.json`
- `inventory.json`
- `purchases.json`
- `purchase-items.json`
- `finance.json`
- `customers.json`

## Audit

All critical admin mutations and core order operations write to `activity-logs.json`.

## Payment

The checkout depends on `PaymentGateway`, not on a provider-specific implementation. The current provider is `MANUAL_TRANSFER`.

A real provider should implement:

- `initiate`
- `verify`

without changing the cart or checkout domain.
