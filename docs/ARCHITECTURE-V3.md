# ابزار احمدی — Architecture V3

## لایه‌ها

```text
src/
├── app/                      # فقط routing و HTTP transport
│   ├── _shell/StoreShell     # Shell مشترک عمومی (Header/Footer/BottomNav/Cart runtime)
│   ├── (store)/              # صفحات عمومی: خانه، محصولات، دسته‌ها، حساب، ثبت‌نام، علاقه‌مندی...
│   ├── (commerce)/           # cart / checkout (همان Shell)
│   ├── dashboard|customer|supplier/
│   └── api/
├── domains/catalog/
│   ├── model/                # قرارداد خالص (سرور + کلاینت): catalog.types، catalog-query
│   └── server/               # catalog.service (cache+tag)، catalog-search.service (فیلتر/مرتب‌سازی/صفحه‌بندی)
├── features/storefront/ui/
│   ├── catalog/              # CatalogView و اجزای کوچک فیلتر/مرتب‌سازی/صفحه‌بندی (Server Components)
│   ├── product-card/  flash-sale/
├── shared/
│   ├── layout/header/        # HeaderLogo (server) + جزیره‌های کلاینت: Search, Cart, Account, CategoryMenu, MobileMenu
│   ├── ui/  seo/  providers/  lib/
└── lib/                      # زیرساخت (github JSON store، auth، sales...) — مهاجرت تدریجی به domains
```

## قوانین

1. `shared` هرگز از `features` یا `domains` import نمی‌کند (دسته‌ها از Shell به Header پاس داده می‌شوند).
2. لیست محصولات/دسته‌ها کاملاً سمت سرور و با `searchParams` رندر می‌شود؛ URL تنها منبع حقیقت state است.
3. Client Component فقط برای تعامل: جستجو، سبد، حساب، منوها، کنترل سبد روی کارت.
4. هر نوشتن روی `products|categories|brands|sale-items.json` تگ `catalog` را expire می‌کند.
5. تمام نوشتن‌ها از `mutateJson` (خواندن تازه + retry روی conflict) عبور می‌کنند.

## SEO

- `h1` واقعی در همهٔ صفحات لیست؛ لینک‌های `<a href>` قابل خزش برای دسته‌ها و صفحه‌بندی.
- URLهای فیلتر/مرتب‌سازی/جستجو: `noindex,follow` + `rel="nofollow"` + خارج از sitemap + disallow در robots.
- canonical قطعی، `rel=prev/next`، JSON-LD (CollectionPage/ItemList/Breadcrumb/Product)، sitemap با تصاویر.

## Performance

- Header دیگر کلاینت ۷۶KB نیست؛ لوگو با CSS (`dark:`) عوض می‌شود (بدون MutationObserver).
- لیست محصولات: به‌جای ارسال کل کاتالوگ به مرورگر، فقط ۲۰ کالای صفحهٔ جاری.
- `priority` فقط برای ۴ تصویر اول؛ لینک‌های فیلتر `prefetch={false}`.
- `next.config`: `optimizePackageImports` (زیر `experimental`)، AVIF/WebP، هدرهای امنیتی، کش immutable فونت.

## اصلاح باگ‌ها در این نسخه

- `/account`, `/register`, `/compare`, `/order-tracking`, `/wishlist` بیرون از `CommerceProvider` بودند و با `useCart must be used within CartProvider` کرش می‌کردند.
- `JsonRepository.create/update` روی دادهٔ کش‌شدهٔ قدیمی می‌نوشت و می‌توانست تغییرات هم‌زمان را پاک کند.
- `next.config.ts`: `optimizePackageImports` در سطح بالا نامعتبر بود.
- `dark:` در Tailwind v4 بدون `@custom-variant` به media-query وصل بود نه کلاس `.dark`.
- `/api/products` آرایهٔ خام می‌داد ولی compare/wishlist/recently-viewed `data` انتظار داشتند (همیشه خالی).
- `shared/ui/Button` export پیش‌فرض نداشت ولی `index.ts` آن را re-export می‌کرد.

## کارهای باقی‌مانده (به ترتیب اولویت)

بزرگ‌ترین فایل‌های داشبورد هنوز تقسیم نشده‌اند: `purchases/new` (69KB)، `products` (56KB)، `dashboard/page` (48KB)، `categories` (47KB+40KB)، `sales` (45KB×2)، `pos` (43KB)، `PurchasesBrowser` (42KB)، `CustomerOrders/Overview` (30KB/29KB)، `ProductHeroSlider` (29KB).
