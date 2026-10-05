# ابزار احمدی — Front-End Architecture

## Stack

- Next.js 16 — App Router
- React 19
- Tailwind CSS v4
- Axios
- TanStack Query v5
- TypeScript strict mode

## Rules

### 1. App Router is routing only

`src/app/**` owns:

- routes
- layouts
- loading/error boundaries
- route-level composition

Business logic and API calls do not belong in route UI.

### 2. Domain / Feature ownership

`src/features/<domain>/` is the client-side owner of a business domain.

Each domain follows:

```text
features/<domain>/
├── api.ts
├── hooks.ts
├── model/
└── ui/
```

- `api.ts`: the only place that knows endpoint paths and HTTP operations.
- `hooks.ts`: React Query cache/query/mutation orchestration.
- `model/`: Context and domain state.
- `ui/`: presentational and interaction components.

Current domains:

- auth
- admin
- cart
- catalog
- checkout
- customer
- reviews
- settings
- supplier
- wishlist
- analytics

### 3. Shared layer

`src/shared/` contains application-wide infrastructure:

```text
shared/
├── api/
│   ├── client.ts
│   └── query.ts
├── layout/
├── providers/
├── seo/
└── ui/
```

`shared/api/client.ts` is the only Axios client. Its base URL is:

```env
NEXT_PUBLIC_API_BASE_URL=/api
```

The production deployment can override it without changing domain code.

### 4. Server API

Next.js Route Handlers remain under:

```text
src/app/api/**
```

They are the backend boundary. Client code never calls them with `fetch()` directly.

### 5. Theme

Theme initialization happens before React hydration using the same localStorage key consumed by `ThemeProvider`.

This prevents the previous flash/delay caused by waiting for `useEffect` + mounted state.

The authenticated user's server preference is synchronized through:

```text
features/settings/api.ts
features/settings/hooks.ts
features/settings/model/ThemeProvider.tsx
```

### 6. CRUD flow

The required data flow is:

```text
UI
 ↓
domain hook
 ↓
domain api.ts
 ↓
shared/api/client.ts
 ↓
Next.js Route Handler
 ↓
repository / GitHub JSON persistence
```

Never:

```text
UI → fetch("/api/...")
```

### 7. Query invalidation

Mutations invalidate the owning domain query keys. Components do not manually synchronize duplicate local copies of server state.

### 8. Legacy cleanup

The previous duplicated `src/components/**` tree has been removed. Existing shared UI is kept only for genuinely cross-domain primitives.

## Data Consistency Contract

`users.json` is the authentication identity store. `customers.json` and `suppliers.json` are business profile stores. A linked account/profile must reference each other through `customer.userId` or `supplier.userId` / `user.supplierId`.

Cross-file mutations are treated as transactions and use `batchCommit` together with `withConflictRetry`. A GitHub conflict must rerun the complete read/compute/write operation; replaying stale JSON against a newer branch is forbidden because it can overwrite concurrent changes.

Admin collection list endpoints support `page`, `pageSize`, and `q`. Operational list UIs use server-side pagination. Public/customer/supplier reads that require fresh operational state bypass the 30-second GitHub read cache.

Production persistence is GitHub-backed JSON. Set `DATA_STORAGE_MODE=github` and the required `GITHUB_*` environment variables. Without them, production requests fail instead of writing to ephemeral local storage.
