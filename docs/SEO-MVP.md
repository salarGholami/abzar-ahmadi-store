# SEO MVP status

Existing infrastructure retained:

- `src/app/sitemap.ts`
- `src/app/robots.ts`
- catalog URL query model
- server-rendered catalog search
- cached catalog service
- product/category metadata
- shared JSON-LD component

Release checks:

- canonical URL for every indexable product/category page
- `noindex` for filtered/duplicate catalog states
- product JSON-LD contains price, availability and aggregate rating when available
- sitemap contains only canonical public URLs
- 404/redirect behavior does not emit indexable duplicate pages
