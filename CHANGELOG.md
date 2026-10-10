# Changelog

## 2026-09-16 — Admin UX / Catalog / Roles overhaul

- بازطراحی کامل Shell و Sidebar داشبورد با ساختار عملیاتی‌تر.
- حذف نقش‌های داخلی `SELLER`، `ACCOUNTANT` و `WAREHOUSE`; تمام عملیات داخلی با `ADMIN` انجام می‌شود.
- اضافه شدن مدیریت مستقل دسته‌بندی‌ها.
- اضافه شدن فیلتر، مرتب‌سازی و وضعیت موجودی در مدیریت محصولات.
- اضافه شدن فیلتر دسته‌بندی، برند، موجودی و قیمت در کاتالوگ عمومی.
- هدر فروشگاه دسته‌بندی‌ها را از داده مدیریت‌شده می‌خواند.
- ثبت خرید دارای انتخابگر محصول با تصویر، نام، برند، SKU و موجودی است.
- داشبورد شامل فروش‌های اخیر، خریدهای اخیر، هشدار موجودی و عملیات سریع شده است.
- فایل `data/categories.json` به عنوان Seed اولیه دسته‌بندی‌ها اضافه شد.

# گزارش تغییرات (تکمیل پروژه)

این نسخه، اسکلت اولیه پروژه را به یک فروشگاه/ERP کارکردی تبدیل می‌کند. مهم‌ترین تغییرات:

## رفع باگ‌های زیرساختی
- یکی‌سازی منبع داده محصولات بین فروشگاه و پنل مدیریت (هر دو اکنون از GitHub می‌خوانند)
- افزودن `images.remotePatterns` در `next.config.ts`
- اصلاح `lib/http.ts` که پیام خطاهای واقعی (کمبود موجودی، اعتبارسنجی و...) را در production پنهان می‌کرد
- افزودن `data/products.json` و `data/settings.json` به دیتای اولیه ریپوی GitHub

## احراز هویت
- `/api/auth/register` (جدید) + فرم‌های ورود/ثبت‌نام/خروج/بازیابی رمز کاملاً وایرشده
- نمایش نام کاربر و دکمه خروج در هدر فروشگاه و پنل مدیریت
- فیلتر منوی پنل بر اساس نقش/دسترسی هر کاربر

## فروشگاه
- سبد خرید واقعی (Context API + localStorage) در سراسر سایت
- جریان کامل تکمیل خرید: ورود اجباری، نمایش شماره کارت فروشگاه، آپلود رسید، ثبت سفارش با وضعیت «در انتظار تایید واریز»
- جستجو/فیلتر دسته‌بندی/مرتب‌سازی واقعی در صفحه محصولات

## پنل مدیریت
- کامپوننت عمومی `CrudTable` برای مدیریت کامل (ثبت/ویرایش/حذف): مشتریان، تأمین‌کنندگان، چک‌ها، مالی، محصولات، کاربران
- انبار: فرم واقعی تعدیل موجودی
- خریدها: فرم کامل با اقلام کالا و پرداخت نقدی/چکی (`lib/purchases.ts` + `/api/purchases/create`)
- فروش‌ها: لیست، جزئیات، نمایش رسید مشتری، تغییر وضعیت پرداخت، چاپ فاکتور/پیش‌فاکتور (`/dashboard/sales/[id]/print`)
- گزارش‌ها: تجمیع داده واقعی (`/api/admin/reports/summary`) + نمودار Recharts
- تنظیمات: فرم تنظیمات فروشگاه + مدیریت کامل کاربران و نقش‌ها

## نکات مهم پیش از فروش به مشتری
1. حتماً روی سیستم خودتان اجرا کنید: `npm install && npm run build` — این محیط دسترسی شبکه نداشت و build واقعی تست نشد.
2. مقادیر `.env.local` را طبق `.env.example` تنظیم کنید (خصوصاً `GITHUB_TOKEN` و `AUTH_SECRET`).
3. رمزهای عبور کاربران seed (`Admin@123456`) را در تنظیمات → کاربران عوض کنید.
4. رسید پرداخت به‌صورت base64 داخل رکورد فروش ذخیره می‌شود؛ برای حجم بالا بهتر است به یک سرویس ذخیره‌سازی فایل جداگانه منتقل شود.
5. برای فروشگاه‌های با ترافیک بالا، طبق توضیح README، معماری «GitHub-as-DB» مناسب نیست و یک دیتابیس واقعی توصیه می‌شود.

## 2026-10-03 — Data Consistency & Pagination Hardening

- Added server-side pagination/search contract for generic admin collections.
- Added reusable RTL pagination UI.
- Customer profile updates now atomically sync `users.json` + `customers.json`.
- Supplier profile updates now atomically sync `users.json` + `suppliers.json`.
- Admin edits to customer/supplier profiles sync their linked login account.
- Admin account creation now accepts `profileId` and links to the existing business profile instead of creating duplicate supplier records.
- Account deletion unlinks the business profile instead of leaving stale foreign keys.
- Added `/api/admin/data-integrity` for detecting broken user/profile and commerce relationships.
- Added data-health status to the admin data center.
- Hardened GitHub batch writes: a stale transaction is no longer blindly replayed against a newer branch HEAD; transaction owners retry the complete read/compute/write operation.
- Inventory, purchase and shipping transactions now rebuild from fresh JSON on GitHub conflicts.
- Production storage can be enforced with `DATA_STORAGE_MODE=github`; missing GitHub storage configuration now fails explicitly instead of silently falling back to local files.

## Audit pass — returns, panels, typing

- `src/lib/returns.ts`: was a stub (imports only), which broke the build because 4 API routes import `requestReturn`, `approveReturn`, `receiveReturn`, `completeRefund`. Implemented the full flow with `withConflictRetry` + `batchCommit`: request (ownership, returnable status, quantity limits, duplicate guard) → approve (creates Refund) → receive (restock products + inventory movement) → complete refund (REFUND finance entry, order → REFUNDED). Every step writes an order event and an audit log.
- `src/lib/notification-delivery.ts`: removed `createdAt/updatedAt` from `create()` input (type error; the repository sets them).
- Supplier panel: `SupplierProducts` gets a table header, horizontal scroll container (columns were clipped on mobile) and stock badges; `SupplierNotifications` now paginated with the shared `Pagination`.
- Customer panel: wishlist paginated with the shared `Pagination`, image fallback + alt text.

## Fix — category pages empty, About image missing

- `/categories/[slug]`: Persian slugs (generated by the dashboard `makeSlug`) arrive percent-encoded in `params`, so the lookup never matched. Slug is now decoded and compared normalized (also matches by id).
- `searchCatalog`: category filter compares normalized text (ZWNJ, Arabic yeh/kaf), so renamed/edited categories still match their products.
- About page hero pointed to a non-existent `about-hero.webp`; now uses `/images/banners/about/2.webp` (also in the page metadata).


## 2.1.0 — مجله و استودیوی محتوای حرفه‌ای
- بازطراحی صفحه مجله با جست‌وجو، دسته‌بندی پویا، مرتب‌سازی، مقاله منتخب و صفحه‌بندی.
- افزودن ویرایشگر محتوای غنی و پنل اختصاصی مقاله با تنظیمات رسانه، انتشار و SEO.
- افزودن metadata پویا، Open Graph، Twitter Cards، Article JSON-LD و مسیرهای مقاله به sitemap.
- ذخیره محتوای مقاله و متادیتا از طریق API مدیریتی موجود در مخزن JSON/GitHub.
