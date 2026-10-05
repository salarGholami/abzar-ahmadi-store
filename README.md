# ابزار احمدی

> معماری فعلی: `docs/ARCHITECTURE-V3.md`

```bash
npm ci
cp .env.example .env.local
npm run check   # lint + typecheck + build
npm run dev
```

---

# ابزار احمدی — Construction Tools Store / ERP

نسخه‌ی Full-stack Next.js با Backend داخل Route Handlerهای Next.js و persistence روی JSONهای GitHub.

## قابلیت‌های پیاده‌سازی‌شده

- GitHub REST API server-only
- JSON repository + SHA optimistic concurrency
- CRUD API برای محصولات، مشتریان، تأمین‌کنندگان، فروش، خرید، انبار، مالی، چک و...
- Authentication با session امضاشده و HttpOnly cookie
- Password hashing با Node scrypt
- RBAC و permission checks روی Route Handler
- Middleware برای محافظت Dashboard
- Audit log
- استاندارد API:
  - `{ success: true, data }`
  - `{ success: false, error: { code, message } }`
- فروش transaction-like:
  1. validation
  2. stock check
  3. calculate
  4. create sale/items
  5. decrease product stock
  6. inventory movement
  7. finance transaction
  8. customer balance
  9. audit log
  10. compensation rollback on later GitHub write failure
- Idempotency با `saleId` / `idempotencyKey`
- محاسبه COGS و Gross Profit
- Inventory adjustment
- Seed users/products
- مدیریت کامل گالری محصول در داشبورد: افزودن چند تصویر، تعیین تصویر اصلی، ویرایش متن تصویر و حذف تصویر
- تصویر دوم گالری به‌صورت خودکار در Hover کارت محصول نمایش داده می‌شود و اگر تصویر دوم نباشد، تصویر اصلی باقی می‌ماند
- Hero Slider با انتخاب تصادفی محصولات موجود
- خرید آنلاین فقط با آپلود تصویر فیش واریزی؛ رسید همراه اطلاعات سفارش برای مشتری و مدیر قابل مشاهده و نگهداری است
- ثبت خرید تأمین‌کننده در Route مستقل (`/dashboard/purchases/new`) و نمایش جزئیات در Route مستقل
- تاریخ سررسید چک به‌صورت جلالی `YYYY/MM/DD` اعتبارسنجی و ذخیره می‌شود

## راه‌اندازی

`.env.local` (نمونه آماده در `.env.local.example`):

```env
GITHUB_OWNER=salarGholami
GITHUB_REPO=Shop-construction-tools
GITHUB_BRANCH=main
GITHUB_DATA_PATH=data
GITHUB_TOKEN=YOUR_GITHUB_TOKEN
AUTH_SECRET=YOUR_LONG_RANDOM_SECRET
PASSWORD_RESET_CODE=YOUR_RESET_CODE
```

سپس:

```bash
npm install
npm run dev
```

## Seed login (فقط Development)

Admin:
- mobile: `09120000000`
- password: `Admin@123456`

Seller:
- mobile: `09121111111`
- password: `Admin@123456`

**در Production فوراً رمزها را تغییر دهید.**

## API

```text
GET/POST  /api/admin/products
PATCH/DELETE /api/admin/products/:id

GET/POST  /api/admin/customers
PATCH/DELETE /api/admin/customers/:id

POST /api/sales/create
POST /api/inventory/adjust

POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## نکته‌ی معماری GitHub JSON

GitHub Contents API تراکنش ACID چندفایلی ارائه نمی‌کند. بنابراین این پروژه قبل از commit همه‌ی فایل‌های درگیر را snapshot می‌کند و در صورت شکست writeهای بعدی، برای فایل‌های قبلاً نوشته‌شده compensation/rollback انجام می‌دهد. برای production با حجم بسیار بالا، database واقعی گزینه‌ی مناسب‌تری است.

GitHub token هیچ‌وقت به Client Component ارسال نمی‌شود.

Next.js 16 note: authentication proxy is implemented in src/proxy.ts; do not recreate src/middleware.ts.


## معماری دسترسی

مدل دسترسی داخلی اکنون بر پایه‌ی `ADMIN` با permissionهای scoped است. شماره‌ی `09120000000` تنها مالک اصلی (`isOwner`) فروشگاه است و فقط همین حساب می‌تواند مدیر جدید ایجاد کند، permission مدیران را تغییر دهد یا حساب مدیریتی را حذف کند.

مدیران بعدی همچنان `ADMIN` هستند اما `permissions` محدود دارند و هیچ‌گاه `isOwner` نمی‌شوند. APIهای مدیریتی permission را در سمت سرور بررسی می‌کنند و Sidebar فقط منوهای مجاز را نمایش می‌دهد. نقش‌های `SELLER`، `ACCOUNTANT` و `WAREHOUSE` در مدل وجود ندارند.

`SUPPLIER` فقط از مسیر `/supplier` و داده‌های scope‌شده‌ی `supplierId` استفاده می‌کند؛ `CUSTOMER` نیز فقط از مسیر `/customer` استفاده می‌کند. هر سه پنل از همان JSONهای backend مشترک تغذیه می‌شوند تا فروش، خرید، محصول، موجودی و حساب مالی بین پنل‌ها همگام بمانند.

## UX جدید کاتالوگ

- مدیریت مستقل دسته‌بندی‌ها در `/dashboard/categories`
- فیلتر محصولات داشبورد بر اساس جستجو، دسته‌بندی، وضعیت موجودی و مرتب‌سازی
- فیلتر فروشگاه بر اساس دسته‌بندی، برند، موجودی، قیمت و مرتب‌سازی
- هدر فروشگاه دسته‌بندی‌ها را مستقیماً از داده مدیریت‌شده می‌خواند
- ثبت خرید دارای Product Picker واقعی با تصویر، نام، برند، SKU، دسته‌بندی و موجودی است
- هنگام ثبت خرید، نام و تصویر هر محصول قبل از ثبت نهایی قابل مشاهده است
- داشبورد شامل فروش‌های اخیر، خریدهای اخیر، هشدار موجودی و عملیات سریع است


## Product Requirements

- [PRD کامل MVP](./docs/PRD.md)
- [API Contract](./docs/API.md)


## Commerce MVP Upgrade
این نسخه لایه Commerce را تکمیل می‌کند: سفارش‌های حساب کاربری، جزئیات و Timeline سفارش، علاقه‌مندی، مقایسه، پیگیری سفارش، Reviews/Returns/Coupons/Shipping/Banners/Articles/Notifications در داشبورد، endpointهای عمومی review/shipping/coupon و ساختار repository برای داده‌های جدید. درگاه پرداخت عمداً به Provider abstraction فعلی سپرده شده و Manual Transfer همچنان فعال است.

## Persistence & Consistency

All operational mutations are executed by Next.js Route Handlers and persist to JSON files under the configured GitHub repository. For production, configure `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `GITHUB_TOKEN`, `GITHUB_DATA_PATH=data`, and `DATA_STORAGE_MODE=github`.

Customer/supplier business profiles and login accounts are linked records. Profile mutations update both records in one Git commit. Admin account creation accepts an existing profile ID to prevent duplicate supplier/customer records.

Generic admin collections support server-side `page`, `pageSize`, and `q` parameters. Customer/supplier operational lists expose the same pagination contract. The admin Data Center also exposes a data-integrity check for broken relationships.
