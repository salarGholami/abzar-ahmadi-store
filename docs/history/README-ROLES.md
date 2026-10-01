# پنل نقش‌ها — ابزار احمدی

## مسیرها
| نقش | URL |
|-----|-----|
| مدیر | `/dashboard` |
| تأمین‌کننده | `/supplier` |
| مشتری | `/customer` |
| ورود | `/account` |

## حساب‌های دمو
| نقش | موبایل | رمز |
|-----|--------|-----|
| ADMIN | `09120000000` | `Admin@123456` |
| SUPPLIER | `09123334444` | `Supplier@123456` |
| CUSTOMER | `09389525193` | `Customer@123456` |

## اجرا
```bash
npm install
npm run dev
```

اگر خطای parallel pages دیدید:
```bash
rm -rf "src/app/account/(portal)" src/app/account/addresses src/app/account/orders src/app/account/wishlist src/app/account/notifications .next
```
