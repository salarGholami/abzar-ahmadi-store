# CMS نقش‌ها — هم‌تراز با داشبورد مدیر

## مسیرها (بدون تداخل)
| نقش | مسیر | Shell |
|-----|------|--------|
| ADMIN | `/dashboard` | DashboardShell |
| SUPPLIER | `/supplier` | PortalShell |
| CUSTOMER | `/customer` | PortalShell |
| ورود عمومی | `/account` | صفحه لاگین فروشگاه |

صفحه `/account` فقط ورود/ثبت‌نام است. بعد از لاگین هر نقش به مسیر خودش هدایت می‌شود.

اگر از نسخهٔ قبلی پوشه‌های `/account/orders` یا `/account/addresses` مانده، آن‌ها را حذف کنید تا با مسیر جدید تداخل نداشته باشند. CMS مشتری فقط زیر `/customer` است.
