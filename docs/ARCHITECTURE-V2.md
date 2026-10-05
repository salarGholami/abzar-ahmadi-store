# ابزار احمدی — Architecture V2

## هدف

این نسخه ساختار پروژه را به **Feature-Based + Domain-Oriented Architecture** نزدیک می‌کند، در حالی که API contract، JSON persistence و URLهای عمومی فعلی حفظ می‌شوند.

## ساختار

```text
src/
├── app/                         # Route composition only
│   ├── (store)/                 # Public storefront shell
│   ├── (commerce)/              # Cart/checkout runtime boundary
│   ├── dashboard/               # Admin routes
│   ├── customer/                # Customer routes
│   ├── supplier/                # Supplier routes
│   └── api/                     # HTTP transport only
│
├── domains/                     # Business/domain layer
│   └── catalog/
│       ├── model/               # Catalog contracts
│       └── server/              # Catalog read services + cache
│
├── features/                    # Feature/application UI
│   ├── storefront/
│   │   ├── hooks/
│   │   └── ui/
│   │       ├── product-card/    # Card sub-components
│   │       └── flash-sale/      # Flash-sale sub-components
│   ├── admin/
│   ├── auth/
│   ├── customer/
│   ├── supplier/
│   └── portal/
│
├── shared/                      # Cross-feature UI/runtime
│   ├── ui/
│   ├── layout/
│   ├── providers/
│   ├── seo/
│   └── lib/
│
└── lib/                         # Legacy infrastructure compatibility layer
```

## Dependency rules

1. `app` owns routing and HTTP transport; business logic should not be implemented in route files.
2. `features` own user-facing workflows and feature-specific components.
3. `domains` own business concepts and server-side domain reads/writes.
4. `shared` cannot import from `features` or `domains`.
5. `shared/ui` remains data-agnostic and API-agnostic.
6. Client Components must not import server-only services.
7. `lib` is retained as a compatibility/infrastructure boundary while services are migrated into domain modules incrementally.

## Runtime boundaries

### Root
The root provider no longer mounts `CartProvider`. Dashboard, supplier and public static routes therefore do not pay for cart state/runtime.

### Store
`(store)/layout.tsx` mounts the commerce runtime because product cards and product actions require cart state.

### Commerce
`(commerce)/layout.tsx` provides the same runtime for `/cart` and `/checkout` without changing their public URLs.

## Catalog read path

```text
App Route
   ↓
Domain Service
   ↓
Repository
   ↓
GitHub JSON / local JSON fallback
```

Public catalog reads use `unstable_cache` with short TTLs. This avoids repeatedly hitting the GitHub Contents API for every public request while keeping MVP data reasonably fresh.

## Component sizing

`ProductCard` is now composition-only:

- `ProductCardImage`
- `ProductCardInfo`
- `ProductCardCartControl`

`FlashSale` is now composition-only:

- `FlashSaleHeader`
- `FlashSaleTimer`
- `FlashSaleProducts`
- `useCountdownToEndOfDay`

Large legacy dashboard/browser components remain isolated under their feature boundaries so they can be split without changing route behavior or API contracts.

## Performance rules

- Keep public pages Server Components by default.
- Keep client boundaries at interactive leaves.
- Do not mount cart/auth/dashboard runtime providers globally.
- Use `next/image` optimization for configured remote image hosts.
- Dynamically import heavy XLSX/ZXing modules only when their workflow is opened/used.
- Keep `recharts` isolated to reports.
- Keep Swiper isolated to storefront carousel components.
- Use URL search params for shareable catalog filters.
- Avoid fetching the same catalog data separately in sibling client components.

## SEO rules

Public catalog pages must provide:

- deterministic canonical URLs;
- server-generated metadata;
- product/category structured data where applicable;
- `sitemap.xml` coverage for indexable products/categories;
- `robots.txt` exclusions for private/admin/query variants;
- real `<h1>` content;
- crawlable `<a href>` internal links;
- optimized product images with meaningful alt text.

The current product detail page already exposes Product + Offer + Breadcrumb JSON-LD and the category page exposes CollectionPage + ItemList + Breadcrumb data.

## Important limitation

The supplied environment could not complete a clean `npm ci` because registry access timed out and the existing `node_modules` tree is incomplete. Therefore `npm run typecheck` could not reach project-level diagnostics; it stopped at missing installed type libraries. The source changes were checked structurally, but a final local `npm ci && npm run check` must be executed in a registry-enabled environment before production deployment.
