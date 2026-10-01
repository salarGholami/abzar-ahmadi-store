# MVP Refactor — 2026-09-30

## ساختار
- انتقال UI عمومی به `src/shared/ui`.
- انتقال layoutهای عمومی به `src/shared/layout`.
- انتقال commerce به `src/features/storefront/ui`.
- انتقال auth/customer/admin/supplier/portal به featureهای مستقل.
- حذف `src/components` قدیمی و اصلاح importها.

## Performance
- حذف `MobileBottomNav` از Root Layout؛ فقط Store Route Group آن را می‌گیرد.
- حذف Swiper CSS از Root Layout.
- استفاده از یک فونت Variable Vazirmatn به‌جای preload چند وزن مستقل.
- lazy loading داده‌های category در Header تا زمان باز شدن منو.
- cache کوتاه‌مدت read-only برای JSONهای GitHub با invalidation بعد از write/delete/batch commit.
- حفظ dynamic import برای XLSX و ZXing در مسیرهای سنگین.
- فعال‌سازی `optimizePackageImports` برای dependencyهای UI سنگین.

## UX
- اضافه شدن loading screen مدرن در `src/shared/ui/LoadingScreen.tsx`.
- اضافه شدن `src/app/loading.tsx` و `src/app/(store)/loading.tsx`.
- اضافه شدن global error boundary.
- پشتیبانی از `prefers-reduced-motion`.

## Validation
- importهای `@/...` بررسی ایستا شدند و import محلی گمشده‌ای باقی نمانده است.
- اجرای build در محیط فعلی ممکن نبود چون `node_modules` داخل ZIP نبود و `npm ci` به‌دلیل timeout محیط اجرا تکمیل نشد؛ بنابراین خروجی build موفق ادعا نمی‌شود.
