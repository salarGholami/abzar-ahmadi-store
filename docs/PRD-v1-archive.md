# PRD — ابزار احمدی | Construction Tools Commerce MVP

> نسخه: 1.0.0  
> وضعیت: MVP Production-Ready Foundation  
> آخرین بازبینی: 2026-09-29  
> پلتفرم: Next.js 16 App Router  
> UI Runtime: React 19  
> Styling: Tailwind CSS v4  
> Persistence فعلی: GitHub-backed JSON Data Store

---

## 1. خلاصه محصول

«ابزار احمدی» یک فروشگاه تخصصی ابزار و تجهیزات ساختمانی است که باید دو سطح عملیاتی داشته باشد:

1. **Storefront**
   - نمایش محصولات
   - جستجو
   - فیلتر و مرتب‌سازی
   - صفحه دسته‌بندی
   - صفحه محصول
   - سبد خرید
   - ثبت سفارش
   - احراز هویت مشتری
   - ثبت آدرس ارسال
   - پرداخت فعلی از طریق انتقال بانکی + آپلود فیش
   - مشاهده سفارش‌ها و وضعیت ارسال

2. **Admin Commerce Backoffice**
   - مدیریت محصولات
   - دسته‌بندی‌ها
   - برندها
   - مشتریان
   - تأمین‌کنندگان
   - موجودی
   - خرید
   - فروش
   - امور مالی
   - چک‌ها
   - گزارش‌ها
   - وضعیت ارسال
   - تنظیمات فروشگاه
   - کاربران مدیر
   - Audit Log
   - اعلان‌های عملیاتی

هدف MVP این است که **هیچ state مهم تجاری فقط در Front-End باقی نماند**.

---

# 2. اصل معماری

## 2.1 Source of Truth

منبع حقیقت برای stateهای تجاری:

```text
Frontend
   ↓
Next.js API Route
   ↓
Domain Service
   ↓
GitHub JSON Persistence
```

`localStorage` منبع حقیقت نیست.

برای stateهای مهم مانند:

- cart
- order
- payment
- customer
- inventory
- product
- activity
- admin mutations

داده باید از Backend خوانده و در Backend ذخیره شود.

---

# 3. تعریف «هر کاری ذخیره شود»

ذخیره کردن هر حرکت UI مانند:

- hover
- mousemove
- focus
- scroll

جزء MVP نیست.

چون این کار حجم telemetry را بدون ارزش تجاری زیاد می‌کند.

در MVP تمام **Business/User Actions** مهم ذخیره می‌شوند.

## رویدادهای مشتری

```text
PRODUCT_VIEW
SEARCH
FILTER_APPLIED
CATEGORY_VIEW
CART_ITEM_ADDED
CART_ITEM_UPDATED
CART_ITEM_REMOVED
CART_CLEARED
CHECKOUT_STARTED
ORDER_CREATED
LOGIN
REGISTER
LOGOUT
WISHLIST_ADDED
WISHLIST_REMOVED
```

ساختار:

```ts
type CustomerEvent = {
  id: string;
  actorType: "USER" | "GUEST";
  actorId: string;
  name: CustomerEventName;
  path?: string;
  entityId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
};
```

فایل:

```text
data/customer-events.json
```

---

# 4. معماری Front-End

## 4.1 App Router

ساختار فعلی حفظ می‌شود:

```text
src/
├── app/
│   ├── (store)/
│   │   ├── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── categories/
│   │   │   └── [slug]/page.tsx
│   │   └── layout.tsx
│   │
│   ├── account/
│   ├── cart/
│   ├── register/
│   │
│   ├── dashboard/
│   │
│   └── api/
│
├── components/
│   ├── auth/
│   ├── commerce/
│   ├── dashboard/
│   ├── layout/
│   └── ui/
│
└── lib/
    ├── auth.ts
    ├── analytics.ts
    ├── audit.ts
    ├── cart.ts
    ├── cart-context.tsx
    ├── data.ts
    ├── events.ts
    ├── github.ts
    ├── payments.ts
    ├── permissions.ts
    ├── repositories.ts
    ├── sales.ts
    ├── purchases.ts
    └── types.ts
```

---

# 5. Server / Client Boundary

## Server Components

تا جای ممکن این صفحات Server Component هستند:

- Homepage
- Product Detail
- Category
- Product Listing
- Dashboard Layout
- Account shell
- Sitemap
- Robots

دلایل:

- SEO
- کاهش JavaScript
- دسترسی مستقیم به Server Data
- کاهش client state

## Client Components

فقط برای تعاملات:

- Cart Provider
- Product Actions
- Product Filters
- Login/Register forms
- Dashboard interactive tables
- Modals
- Theme toggle
- Uploaders

---

# 6. Persistence Architecture

## فعلی

```text
GitHub Repository
└── data/
    ├── products.json
    ├── categories.json
    ├── brands.json
    ├── customers.json
    ├── users.json
    ├── sales.json
    ├── sale-items.json
    ├── purchases.json
    ├── purchase-items.json
    ├── inventory.json
    ├── finance.json
    ├── checks.json
    ├── quotations.json
    ├── expenses.json
    ├── incomes.json
    ├── settings.json
    ├── activity-logs.json
    ├── carts.json
    ├── customer-events.json
    └── payment-transactions.json
```

## چرا GitHub JSON؟

برای MVP فعلی:

- بدون MongoDB
- بدون PostgreSQL
- بدون VPS
- سازگار با Vercel
- قابل مشاهده
- ساده برای Demo
- قابل backup
- قابل versioning

## محدودیت

این persistence برای فروشگاه واقعی با ترافیک بالا مناسب نیست.

محدودیت‌های اصلی:

- concurrent writes
- GitHub API rate limits
- commit latency
- عدم transaction واقعی database
- عدم locking
- رشد فایل JSON
- احتمال race condition در موجودی

---

# 7. Backend Rules

تمام mutationها باید این مسیر را طی کنند:

```text
Request
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Domain Rule
 ↓
Persistence
 ↓
Audit
 ↓
Response
```

نباید Front-End مستقیماً فایل JSON را تغییر دهد.

---

# 8. Cart Architecture

سبد خرید قبلاً فقط با `localStorage` نگهداری می‌شد.

این معماری برای MVP نهایی رد شده است.

اکنون:

```text
Browser
   ↓
/api/cart
   ↓
src/lib/cart.ts
   ↓
data/carts.json
```

## Guest Cart

برای کاربر بدون Login:

```text
abzar_guest_id
```

به‌صورت HTTP-only cookie ساخته می‌شود.

Cart با این ID ذخیره می‌شود.

## Authenticated Cart

بعد از Login:

```text
ownerType = USER
ownerId = user.id
```

## Guest → User Merge

در Login/Register:

```text
Guest Cart
     ↓
Merge
     ↓
User Cart
```

در نتیجه cart کاربر از بین نمی‌رود.

---

# 9. Order Architecture

ثبت سفارش فقط با داده Client معتبر نیست.

Backend دوباره:

- محصول را پیدا می‌کند
- موجودی را بررسی می‌کند
- قیمت را از Backend می‌خواند
- discount را محاسبه می‌کند
- subtotal را محاسبه می‌کند
- COGS را محاسبه می‌کند
- gross profit را محاسبه می‌کند
- payment status را تعیین می‌کند

Client نباید بتواند:

```text
price
discount
purchaseCost
grossProfit
```

را به Backend تحمیل کند.

---

# 10. Order Data

هر سفارش شامل:

```text
Sale
├── id
├── customerUserId
├── buyerName
├── buyerPhone
├── subtotal
├── discount
├── netAmount
├── cogs
├── grossProfit
├── paymentStatus
├── paymentProvider
├── paymentTransactionId
├── shippingAddress
├── receipt
├── channel
├── shippingStatus
├── trackingCode
├── shippingMethod
├── shippingCompany
├── shippedAt
├── trackingUrl
├── createdAt
└── updatedAt
```

---

# 11. Shipping Address

برای MVP آدرس ارسال در خود سفارش snapshot می‌شود.

```ts
shippingAddress: {
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}
```

دلیل snapshot:

اگر کاربر بعداً آدرس حساب خود را تغییر دهد، آدرس سفارش قبلی نباید تغییر کند.

---

# 12. Payment Architecture

## وضعیت فعلی

درگاه واقعی هنوز فعال نیست.

روش فعلی:

```text
Customer
 ↓
ثبت سفارش
 ↓
نمایش شماره کارت
 ↓
واریز دستی
 ↓
Upload Receipt
 ↓
PENDING_TRANSFER
 ↓
Admin Review
 ↓
PAID
```

این flow فعلاً حفظ می‌شود.

---

# 13. Payment Gateway Abstraction

Payment نباید داخل Cart یا UI hard-code شود.

Interface:

```ts
interface PaymentGateway {
  initiate(input: {
    orderId: string;
    amount: number;
  }): Promise<{
    transactionId: string;
    redirectUrl: string | null;
    status: PaymentTransactionStatus;
  }>;

  verify(input: {
    transactionId: string;
    authority?: string;
    referenceId?: string;
  }): Promise<{
    success: boolean;
    referenceId?: string;
  }>;
}
```

Provider فعلی:

```text
MANUAL_TRANSFER
```

Providerهای آینده:

```text
ZARINPAL
IDPAY
NEXT_PROVIDER
```

با این معماری برای اتصال درگاه واقعی لازم نیست Cart یا Checkout بازنویسی شود.

فقط Gateway Provider اضافه می‌شود.

---

# 14. Payment Transaction

فایل:

```text
data/payment-transactions.json
```

مدل:

```ts
type PaymentTransaction = {
  id: string;
  orderId: string;
  provider:
    | "MANUAL_TRANSFER"
    | "ZARINPAL"
    | "IDPAY"
    | "NEXT_PROVIDER";
  status:
    | "INITIATED"
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "CANCELED"
    | "REFUNDED";
  amount: number;
  authority?: string | null;
  referenceId?: string | null;
  callbackPayload?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};
```

---

# 15. Idempotency

ثبت سفارش باید idempotent باشد.

برای هر Order:

```text
idempotencyKey
```

ذخیره می‌شود.

اگر همان request دوباره ارسال شود:

```text
Existing Order
```

برگردانده می‌شود و سفارش جدید ساخته نمی‌شود.

این برای:

- double click
- refresh
- network retry
- mobile connection retry

ضروری است.

---

# 16. Inventory

موجودی باید فقط در Backend تغییر کند.

Operationها:

```text
PURCHASE
SALE
MANUAL_ADJUSTMENT
RETURN
```

هر mutation باید:

1. Product Stock
2. Inventory Movement
3. Audit Log

را هماهنگ کند.

---

# 17. Finance

در MVP:

```text
SALE
PURCHASE
OTHER_INCOME
OTHER_EXPENSE
```

ثبت می‌شود.

فروش Paid:

```text
Finance Entry
type = SALE
```

خرید:

```text
Finance Entry
type = PURCHASE
```

---

# 18. Admin CRUD

CRUD عمومی باید این operationها را پشتیبانی کند:

```text
GET
POST
PATCH
DELETE
```

برای collectionهای مجاز:

```text
products
customers
suppliers
sales
sale-items
purchases
purchase-items
inventory
finance
checks
quotations
expenses
incomes
brands
categories
settings
activity-logs
```

---

# 19. Audit Log

تمام mutationهای مدیریتی مهم باید ثبت شوند.

مثال:

```text
ADMIN_ENTITY_CREATED
ADMIN_ENTITY_UPDATED
ADMIN_ENTITY_DELETED
ADMIN_PRODUCT_CREATED
ADMIN_PRODUCT_UPDATED
ADMIN_PRODUCT_DELETED
SALE_CREATED
PURCHASE_CREATED
INVENTORY_ADJUSTED
```

اطلاعات Audit:

```text
action
entityType
entityId
actorId
actorRole
metadata
createdAt
```

فایل:

```text
data/activity-logs.json
```

---

# 20. Authentication

Roles فعلی:

```text
ADMIN
CUSTOMER
```

هیچ Role اضافی برای:

- انباردار
- حسابدار
- فروشنده

در MVP وجود ندارد.

ADMIN تمام عملیات مدیریتی را انجام می‌دهد.

CUSTOMER:

```text
products.read
sales.read
sales.create
quotations.create
```

---

# 21. Customer Account

MVP Customer Account:

- Login
- Register
- Logout
- Reset Password
- Order History
- Order Detail
- Shipping Status
- Payment Status
- Profile

---

# 22. Product MVP

هر Product:

```text
id
title
brand
sku
category
price
discount
stock
image
images
purchaseCost
description
specs
rating
reviewCount
supplierIds
createdAt
updatedAt
```

---

# 23. Product Detail

صفحه Product باید شامل:

- SEO title
- SEO description
- Canonical
- Open Graph
- Product JSON-LD
- Breadcrumb
- Product Gallery
- Brand
- SKU
- Availability
- Price
- Discount
- Rating
- Specifications
- Description
- Add to Cart
- Buy Now
- Related Products

---

# 24. Category SEO

برای جلوگیری از وابستگی کامل به query parameter، مسیر SEO-friendly اضافه شده:

```text
/categories/[slug]
```

مثال:

```text
/categories/cat-6
```

هر Category:

- Metadata
- Canonical
- Description
- Product Listing
- Sitemap entry

دارد.

---

# 25. Search

Search در MVP:

```text
title
brand
sku
category
```

باید server-backed باشد و UI فقط query را مدیریت کند.

---

# 26. Filtering

فیلترهای MVP:

```text
Category
Brand
Stock
Price
Sort
```

مرتب‌سازی:

```text
popular
cheap
expensive
stock
```

---

# 27. SEO Architecture

## Metadata

Root metadata:

```text
metadataBase
title template
description
keywords
canonical
OpenGraph
robots
GoogleBot
```

## Product

Dynamic metadata:

```text
/products/[id]
```

## Category

Dynamic metadata:

```text
/categories/[slug]
```

---

# 28. Sitemap

فایل:

```text
src/app/sitemap.ts
```

شامل:

```text
/
 /products
 /categories/*
 /products/*
```

است.

محصولات بر اساس:

```text
updatedAt
```

برای `lastModified` استفاده می‌کنند.

---

# 29. Robots

فایل:

```text
src/app/robots.ts
```

Allowed:

```text
/
 /products
 /categories
```

Disallowed:

```text
/api
/account
/cart
/dashboard
```

---

# 30. Structured Data

Product JSON-LD:

```text
Product
├── name
├── sku
├── brand
├── description
├── image
├── aggregateRating
└── offers
    ├── price
    ├── priceCurrency
    └── availability
```

---

# 31. Canonical Strategy

هر صفحه indexable باید canonical خودش را داشته باشد.

مثال:

```text
/products/p1
```

canonical:

```text
/products/p1
```

Category:

```text
/categories/cat-6
```

canonical:

```text
/categories/cat-6
```

---

# 32. Indexability

Index:

```text
Homepage
Product Listing
Category
Product Detail
```

NoIndex:

```text
Cart
Account
Dashboard
Admin
API
```

---

# 33. Image SEO

هر Product Image باید:

```text
alt
width
height
```

را تا حد امکان داشته باشد.

تصاویر Product باید:

- lazy load
- responsive sizes
- optimized format
- meaningful alt
- CDN-friendly URL

داشته باشند.

---

# 34. Performance

اصول:

- Server Components first
- Client Components only where interaction is required
- `next/image`
- dynamic imports فقط برای بخش‌های سنگین
- عدم fetch تکراری
- no-store برای admin/private data
- cache مناسب برای public catalog
- کاهش client JavaScript
- جلوگیری از localStorage به‌عنوان source of truth

---

# 35. API Contract

تمام APIها:

```json
{
  "success": true,
  "data": {}
}
```

یا:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "پیام خطا"
  }
}
```

---

# 36. Core API

## Auth

```text
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/reset-password
GET  /api/auth/me
```

## Store

```text
GET /api/products
GET /api/categories
GET /api/settings/public
```

## Cart

```text
GET  /api/cart
POST /api/cart
```

Actions:

```text
ADD
SET
REMOVE
CLEAR
```

## Orders

```text
POST /api/sales/create
GET  /api/account/orders
```

## Events

```text
POST /api/events
```

## Admin

```text
GET    /api/admin/:collection
POST   /api/admin/:collection
GET    /api/admin/:collection/:id
PATCH  /api/admin/:collection/:id
DELETE /api/admin/:collection/:id
```

---

# 37. Data Consistency

برای mutationهای چند entity از:

```text
batchCommit()
```

استفاده می‌شود.

مثال Sale:

```text
sales.json
sale-items.json
products.json
inventory.json
finance.json
customers.json
activity-logs.json
```

در یک Git commit نوشته می‌شوند.

این نسبت به چند `writeJson()` مستقل بهتر است.

---

# 38. Known MVP Limitation

GitHub JSON database transaction واقعی نیست.

`batchCommit()` atomicity سطح application را تا حد مناسبی برای MVP فراهم می‌کند، اما database transaction واقعی نیست.

در ترافیک همزمان بالا ممکن است:

```text
Request A
Request B
```

هر دو موجودی یکسان را بخوانند.

برای production scale باید persistence به:

```text
PostgreSQL
```

یا یک database transaction-capable منتقل شود.

---

# 39. Migration Strategy

انتقال آینده:

```text
JSON Repository
       ↓
Repository Interface
       ↓
PostgreSQL Repository
```

Domain Service نباید مستقیماً به SQL وابسته شود.

---

# 40. MVP Scope

## Must Have

- [x] Product Catalog
- [x] Product Detail
- [x] Category
- [x] Search
- [x] Filter
- [x] Cart Persistence
- [x] Guest Cart
- [x] User Cart
- [x] Guest Cart Merge
- [x] Authentication
- [x] Order Creation
- [x] Order History
- [x] Shipping Address
- [x] Manual Transfer
- [x] Receipt Upload
- [x] Payment Transaction abstraction
- [x] Inventory
- [x] Sales
- [x] Purchases
- [x] Finance
- [x] Admin CRUD
- [x] Audit Log
- [x] Customer Events
- [x] SEO Metadata
- [x] Canonical
- [x] Sitemap
- [x] Robots
- [x] Product JSON-LD
- [x] Category SEO URLs

---

# 41. خارج از MVP

این موارد عمداً برای بعد از MVP هستند:

- Online payment gateway واقعی
- SMS OTP
- Multi-vendor
- Warehouse roles
- Accountant role
- Advanced coupon engine
- Loyalty system
- Advanced recommendation engine
- Elasticsearch
- Redis
- Real-time WebSocket
- Full CRM
- Advanced analytics warehouse
- PostgreSQL migration
- Distributed locking

---

# 42. Phase 2

## Payment

```text
ZarinPal / IDPay
```

Flow:

```text
Create Order
 ↓
Create Payment Transaction
 ↓
Gateway Initiate
 ↓
Redirect
 ↓
Callback
 ↓
Verify
 ↓
PAID
 ↓
Finance Entry
```

---

# 43. Phase 2 Customer Features

- Wishlist
- Saved Addresses
- Reviews
- Questions & Answers
- Coupons
- Recently Viewed
- Reorder
- Invoice Download

---

# 44. Phase 2 SEO

- Dedicated brand pages
- Brand/Product schema
- FAQ schema
- BreadcrumbList
- Search Console monitoring
- Internal linking strategy
- Content landing pages
- SEO category descriptions
- Index coverage monitoring

---

# 45. Security Requirements

## Environment

Secrets نباید داخل repository قرار بگیرند:

```text
GITHUB_TOKEN
AUTH_SECRET
```

باید در deployment environment باشند.

فایل‌هایی مانند:

```text
ADMIN_CREDENTIALS.txt
```

نباید حاوی credential واقعی باشند.

---

# 46. API Security

هر mutation:

```text
Authentication
Authorization
Validation
```

را enforce می‌کند.

Client نباید permission را تعیین کند.

---

# 47. Input Validation

در مرحله بعد تمام API inputها باید با Zod schema validate شوند.

Schemaهای پیشنهادی:

```text
CreateProductSchema
UpdateProductSchema
CreateSaleSchema
CreatePurchaseSchema
CartMutationSchema
RegisterSchema
LoginSchema
ShippingAddressSchema
```

---

# 48. Business Invariants

## Product

```text
price >= 0
stock >= 0
discount 0..100
sku unique
```

## Cart

```text
quantity > 0
quantity <= stock
```

## Order

```text
items.length > 0
netAmount >= 0
```

## Payment

```text
transaction.amount === order.netAmount
```

---

# 49. Admin Dashboard MVP

Dashboard باید KPIهای زیر را نمایش دهد:

```text
Sales Today
Total Revenue
Gross Profit
Orders
Pending Payments
Low Stock
```

و بخش‌های:

```text
Recent Sales
Recent Activity
Sales Trend
Payment Queue
Low Stock
Notifications
```

---

# 50. Admin Modules

```text
Dashboard
Products
Categories
Brands
Inventory
Sales
Purchases
Suppliers
Customers
Finance
Income
Expenses
Checks
Quotations
Reports
Users
Settings
Activity
Data Center
```

---

# 51. Notification Model

Notification باید business-driven باشد.

نمونه:

```text
PENDING_PAYMENT
LOW_STOCK
NEW_ORDER
SHIPMENT_PENDING
CHECK_DUE
```

نباید Notification صرفاً از UI state ساخته شود.

---

# 52. Deployment

## Required Environment Variables

```env
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=main
GITHUB_DATA_PATH=data
GITHUB_TOKEN=

AUTH_SECRET=

NEXT_PUBLIC_SITE_URL=
```

`NEXT_PUBLIC_SITE_URL` برای:

- canonical
- sitemap
- OpenGraph
- JSON-LD

ضروری است.

---

# 53. Vercel

Target deployment:

```text
Vercel
```

Backend logic:

```text
Next.js Route Handlers
Server Components
Server-only services
```

Persistence:

```text
GitHub
```

---

# 54. Production Warning

GitHub JSON فقط برای MVP / portfolio / low traffic مناسب است.

برای فروشگاه با سفارش واقعی و concurrency بالا:

```text
PostgreSQL
+
Prisma/Drizzle
+
transaction
+
row locking
```

لازم است.

این تغییر نباید API contract یا UI domain را بشکند.

---

# 55. Definition of Done

MVP زمانی کامل است که:

### Store

- کاربر بتواند محصول را ببیند.
- محصول را جستجو کند.
- فیلتر کند.
- وارد صفحه محصول شود.
- محصول را به cart اضافه کند.
- cart بعد از refresh باقی بماند.
- cart بدون login هم باقی بماند.
- بعد از login cart guest merge شود.
- checkout انجام شود.
- آدرس ارسال ثبت شود.
- فیش ثبت شود.
- سفارش ایجاد شود.

### Backend

- هیچ price مهمی از Client trusted نباشد.
- stock در Backend validate شود.
- order idempotent باشد.
- payment transaction ساخته شود.
- audit ثبت شود.
- event ثبت شود.

### Admin

- Product CRUD کار کند.
- Customer CRUD کار کند.
- Category CRUD کار کند.
- Sales مدیریت شود.
- Inventory مدیریت شود.
- Purchase ثبت شود.
- Finance ثبت شود.
- Shipping مدیریت شود.
- Activity قابل مشاهده باشد.

### SEO

- Product metadata وجود داشته باشد.
- Category metadata وجود داشته باشد.
- Canonical وجود داشته باشد.
- Sitemap وجود داشته باشد.
- Robots وجود داشته باشد.
- Product JSON-LD وجود داشته باشد.
- صفحات خصوصی noindex باشند.

---

# 56. Acceptance Criteria

## Cart Persistence

Given:

```text
User adds product
```

When:

```text
Browser refreshes
```

Then:

```text
Cart remains available from Backend.
```

---

## Guest Cart Merge

Given:

```text
Guest has 2 products
```

When:

```text
Guest registers
```

Then:

```text
Guest cart is merged into user cart.
```

---

## Order Integrity

Given:

```text
Client sends manipulated price
```

When:

```text
Order is created
```

Then:

```text
Backend ignores client price.
```

---

## Stock

Given:

```text
stock = 3
```

When:

```text
customer requests quantity = 5
```

Then:

```text
order is rejected.
```

---

## Duplicate Checkout

Given:

```text
same idempotencyKey
```

When:

```text
request is sent twice
```

Then:

```text
only one Sale exists.
```

---

## SEO

Given:

```text
Product p1
```

Then:

```text
/products/p1
```

must expose:

- title
- description
- canonical
- OpenGraph
- Product JSON-LD

---

# 57. Engineering Principles

1. Backend is the source of truth.
2. Client state is presentation state.
3. Business rules live server-side.
4. SEO-critical pages remain server-rendered.
5. Mutations require authorization.
6. Important mutations require audit.
7. Payment is provider-agnostic.
8. Inventory is server-controlled.
9. Order creation is idempotent.
10. Persistence is replaceable.
11. UI must not contain business-critical calculations.
12. No architecture rewrite without measurable technical reason.

---

# 58. Final MVP Architecture

```text
                         ┌─────────────────────┐
                         │      Next.js 16     │
                         │      App Router     │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 │                                     │
        Server Components                       Client Components
                 │                                     │
                 └──────────────────┬──────────────────┘
                                    │
                              API Route Handlers
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                  Domain Services          Auth/RBAC
                         │                     │
              ┌──────────┼──────────┐          │
              │          │          │          │
             Cart       Sales     Payment     Audit
              │          │          │          │
              └──────────┴──────────┴──────────┘
                                    │
                              GitHub Adapter
                                    │
                              GitHub Repository
                                    │
                                  data/*.json
```

---

# 59. Product Vision

نسخه MVP باید یک فروشگاه واقعی قابل Demo باشد، نه صرفاً یک UI.

معیار موفقیت:

```text
Frontend Action
      ↓
Backend Validation
      ↓
Business Logic
      ↓
Persistence
      ↓
Audit / Event
      ↓
Admin Visibility
```

این زنجیره باید برای تمام عملیات تجاری اصلی برقرار باشد.

---

# 60. بعد از MVP

اولویت مهاجرت production:

```text
1. PostgreSQL
2. Real Payment Gateway
3. Transactional Inventory
4. Redis Cache
5. Rate Limiting
6. Object Storage
7. Background Jobs
8. Search Engine
9. Advanced Analytics
```

تا قبل از رسیدن به این مرحله، معماری Front-End و API Contract نباید وابستگی مستقیم به GitHub JSON پیدا کند.
