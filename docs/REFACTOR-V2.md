# Refactor V2 — Engineering Checklist

- [x] Feature-based storefront/admin/auth/customer/supplier boundaries
- [x] Domain catalog server layer
- [x] Public catalog caching boundary
- [x] Commerce runtime moved out of root provider
- [x] `/cart` and `/checkout` grouped with a route group without changing URLs
- [x] ProductCard split into focused components
- [x] FlashSale split into focused components
- [x] Product images switched from `unoptimized` to Next Image optimization
- [x] XLSX import/export changed to on-demand dynamic import in PurchasesBrowser
- [x] Product detail static params added
- [x] Product/category metadata and structured data retained
- [x] Sitemap/robots/manifest retained
- [ ] Remaining legacy dashboard mega-pages should be decomposed feature-by-feature after runtime verification
- [ ] Run `npm ci` and `npm run check` on a network-enabled machine
