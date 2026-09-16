# ابزارینو — Construction Tools Store / ERP

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

## راه‌اندازی

`.env.local`:

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

این نسخه عمداً RBAC چندنقشی برای عملیات داخلی ندارد. تمام عملیات مدیریتی فروش، خرید، انبار، مالی، تأمین‌کننده، مشتری، محصول و دسته‌بندی توسط نقش واحد `ADMIN` انجام می‌شود. `CUSTOMER` فقط برای حساب کاربری سمت فروشگاه است.

نقش‌های `SELLER`، `ACCOUNTANT` و `WAREHOUSE` از مدل مدیریتی حذف شده‌اند. اگر رکورد قدیمی با یکی از این نقش‌ها در `users.json` وجود داشته باشد، هنگام Login به `ADMIN` نرمال می‌شود تا داده قدیمی باعث از کار افتادن پروژه نشود.

## UX جدید کاتالوگ

- مدیریت مستقل دسته‌بندی‌ها در `/dashboard/categories`
- فیلتر محصولات داشبورد بر اساس جستجو، دسته‌بندی، وضعیت موجودی و مرتب‌سازی
- فیلتر فروشگاه بر اساس دسته‌بندی، برند، موجودی، قیمت و مرتب‌سازی
- هدر فروشگاه دسته‌بندی‌ها را مستقیماً از داده مدیریت‌شده می‌خواند
- ثبت خرید دارای Product Picker واقعی با تصویر، نام، برند، SKU، دسته‌بندی و موجودی است
- هنگام ثبت خرید، نام و تصویر هر محصول قبل از ثبت نهایی قابل مشاهده است
- داشبورد شامل فروش‌های اخیر، خریدهای اخیر، هشدار موجودی و عملیات سریع است
