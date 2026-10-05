# معماری MVP فروشگاه ابزار احمدی

## هدف

این بازطراحی بدون تغییر قراردادهای فعلی API و داده‌های JSON، ساختار کد را به چهار لایه روشن تقسیم می‌کند:

```text
src/
├── app/                         # فقط Routing، Layout و API Route
├── features/                   # قابلیت‌های دامنه‌ای و UI مرتبط با هر قابلیت
│   ├── storefront/             # کاتالوگ، محصول، خرید و UI فروشگاه
│   ├── auth/                   # ورود، ثبت‌نام و بازیابی رمز
│   ├── customer/               # حساب مشتری
│   ├── supplier/               # پورتال تأمین‌کننده
│   ├── admin/                  # CMS / Dashboard مدیر
│   └── portal/                 # پوسته‌های مشترک پورتال‌ها
├── shared/                     # UI و Layoutهای قابل استفاده مجدد
│   ├── ui/                     # Button, Input, Modal, Pagination, Loading...
│   ├── layout/                 # Header/Footer/Navigation
│   └── seo/                    # JSON-LD و ابزارهای SEO
├── lib/                        # لایه سازگاری و سرویس‌های فعلی پروژه
└── core/                       # قراردادها و کدهای بنیادی که به دامنه خاص وابسته نیستند
```

## قانون وابستگی

- `app` می‌تواند از `features`، `shared` و `lib` استفاده کند.
- `features` می‌تواند از `shared` و `lib` استفاده کند.
- `shared` نباید به featureهای فروشگاه، admin یا supplier وابسته باشد.
- UIهای عمومی داخل `shared/ui` هیچ وابستگی به API یا داده JSON ندارند.
- ارتباط با GitHub/JSON، احراز هویت و عملیات مالی در `lib`/API باقی می‌ماند و وارد کامپوننت‌های عمومی نمی‌شود.

## الگوی نام‌گذاری

- `*Page` برای composition سطح route
- `*Card`, `*List`, `*Table`, `*Form`, `*Dialog` برای UIهای قابل ترکیب
- `*Shell` برای layoutهای دامنه‌ای
- `*Service` / `*Repository` برای منطق سرور
- UI عمومی فقط در `shared/ui`

## بهینه‌سازی‌های MVP

1. `MobileBottomNav` دیگر در Root Layout لود نمی‌شود و فقط در Store Layout قرار دارد؛ بنابراین صفحات dashboard/customer غیر فروشگاهی آن را حمل نمی‌کنند.
2. CSS مربوط به Swiper از Root Layout حذف شده و فقط جایی که واقعاً نیاز است مصرف می‌شود.
3. دریافت categoryهای Header تا زمان باز شدن منوی category به تعویق افتاده است.
4. categoryهای Header با cache مرورگر دریافت می‌شوند؛ احراز هویت همچنان بدون cache باقی می‌ماند.
5. `loading.tsx` برای Root و Store Route Group اضافه شده تا navigationهای کند بدون صفحه خالی نمایش داده نشوند.
6. `prefers-reduced-motion` رعایت شده تا انیمیشن‌ها برای کاربرانی که motion را کاهش داده‌اند مزاحم نباشد.
7. dependencyهای سنگین مثل `xlsx`، ZXing و Recharts باید فقط در routeهایی که لازم‌اند dynamic import شوند؛ کد فعلی برای XLSX/ZXing این الگو را تا حد زیادی رعایت می‌کند.

## اصل reusable بودن

کامپوننتی که برای پروژه‌های دیگر هم قابل استفاده است باید به این شکل نگه داشته شود:

```tsx
import Button from "@/shared/ui/Button";

<Button variant="primary">ذخیره</Button>
```

در مقابل، چیزی مثل `ProductCard` که مستقیماً به مدل Product و cart وابسته است در `features/storefront/ui` قرار می‌گیرد، نه `shared/ui`.

## Loading UX

دو سطح loading وجود دارد:

- `src/app/loading.tsx`: fallback عمومی برای route transitionها
- `src/app/(store)/loading.tsx`: fallback تخصصی فروشگاه
- `src/shared/ui/LoadingScreen.tsx`: کامپوننت reusable برای هر feature یا صفحه‌ای که loading مستقل نیاز دارد
