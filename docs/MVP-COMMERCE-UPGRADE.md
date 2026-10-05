# Commerce MVP Upgrade

این نسخه روی هسته قبلی فروشگاه ابزار احمدی ساخته شده و آن را بازنویسی نکرده است.

## Added
- Account orders list/detail
- Order timeline UI
- Wishlist page
- Product compare page
- Recently viewed products
- Product reviews display
- Coupon validation and order discount application
- Shipping methods and shipping cost in checkout
- `/checkout` entry route
- Order tracking entry page
- Notifications API/page
- Admin sections for orders, coupons, reviews, returns, shipping, banners, articles and notifications
- New JSON collections/repositories
- Product compare/recent-view controls
- Basic Commerce UI polish (inputs, buttons, cards)

## Payment
درگاه واقعی عمداً فعال نشده است. Provider abstraction قبلی حفظ شده و Manual Transfer همچنان روش پیش‌فرض قابل استفاده است.

## Production notes
Before deployment, run `npm ci` and `npm run build` in an environment with registry access. Verify GitHub token permissions, private repository, `AUTH_SECRET`, and receipt storage configuration.
