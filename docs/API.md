# API contract

All APIs return:
`{ success: true, data }` on success and
`{ success: false, error: { code, message } }` on failure.

Protected routes always perform:
authenticate → authorize → validate → execute → audit.

Core write endpoints:
- POST /api/admin/products
- PATCH/DELETE /api/admin/products/:id
- POST /api/admin/customers
- PATCH/DELETE /api/admin/customers/:id
- POST /api/sales/create
- POST /api/inventory/adjust
- POST /api/auth/reset-password


## Customer State

### GET /api/cart

Returns the server-authoritative cart for the authenticated user or guest cookie owner.

### POST /api/cart

Body:

```json
{
  "action": "ADD | SET | REMOVE | CLEAR",
  "productId": "product-id",
  "quantity": 1
}
```

### POST /api/events

Records an allowed business event for a user or guest.

```json
{
  "name": "PRODUCT_VIEW",
  "path": "/products/p1",
  "entityId": "p1",
  "metadata": {}
}
```

## Payment

The checkout creates a `payment-transactions.json` record through the `PaymentGateway` abstraction.

The current provider is:

```text
MANUAL_TRANSFER
```

Future providers must implement the same gateway interface.

## Endpointهای اضافه‌شده در نسخه ۲.۰

```text
GET/POST/DELETE  /api/account/addresses          آدرس‌های مشتری (POST ایدمپوتنت، DELETE?id=)
GET/PATCH        /api/account/preferences        { theme, readNotificationIds }
GET/POST         /api/wishlist                   علاقه‌مندی‌ها (POST: { productId, action? })
PATCH/DELETE     /api/admin/sales/:id            تغییر وضعیت پرداخت (اتمیک) / حذف با برگشت موجودی (ADMIN)
GET              /api/payments/callback/:provider?tx=...   بازگشت از درگاه، تأیید سرور-به-سرور
GET              /api/settings/public            شامل paymentProvider فعال
```

POST `/api/sales/create` در پاسخ برای مشتری، فیلد `payment: { provider, redirectUrl, error? }` برمی‌گرداند.
