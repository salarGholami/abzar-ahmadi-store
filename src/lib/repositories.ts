import { JsonRepository } from "./repository";

import type {
  Product,
  Customer,
  Supplier,
  Sale,
  SaleItem,
  Purchase,
  PurchaseItem,
  FinanceEntry,
  CheckRecord,
  InventoryMovement,
  AppUser,
  Category,
  Coupon,
  Review,
  ProductQuestion,
  ReturnRequest,
  ShippingOption,
  StoreBanner,
  StoreArticle,
  StoreNotification,
  MediaAsset,
  SupportTicket,
  SupportMessage,
  NotificationDelivery,
} from "./types";

import seedProducts from "@/data/seed/products.json";

/* -------------------------------------------------------------------------- */
/* Core                                                                        */
/* -------------------------------------------------------------------------- */

export const productRepo = new JsonRepository<Product>(
  "products.json",
  seedProducts as Product[],
);

export const categoryRepo = new JsonRepository<Category>("categories.json");

export const customerRepo = new JsonRepository<Customer>("customers.json");

export const supplierRepo = new JsonRepository<Supplier>("suppliers.json");

export const saleRepo = new JsonRepository<Sale>("sales.json");

export const saleItemRepo = new JsonRepository<SaleItem>("sale-items.json");

export const purchaseRepo = new JsonRepository<Purchase>("purchases.json");

export const purchaseItemRepo = new JsonRepository<PurchaseItem>(
  "purchase-items.json",
);

export const inventoryRepo = new JsonRepository<InventoryMovement>(
  "inventory.json",
);

export const financeRepo = new JsonRepository<FinanceEntry>("finance.json");

export const checkRepo = new JsonRepository<CheckRecord>("checks.json");

export const userRepo = new JsonRepository<AppUser>("users.json");

export const activityRepo = new JsonRepository<{
  id: string;
  action: string;
  entityId?: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}>("activity-logs.json");

/* -------------------------------------------------------------------------- */
/* Marketing                                                                   */
/* -------------------------------------------------------------------------- */

export const couponRepo = new JsonRepository<Coupon>("coupons.json");

export const reviewRepo = new JsonRepository<Review>("reviews.json");

export const questionRepo = new JsonRepository<ProductQuestion>(
  "questions.json",
);

export const returnRepo = new JsonRepository<ReturnRequest>("returns.json");

export const shippingOptionRepo = new JsonRepository<ShippingOption>(
  "shipping-methods.json",
);

export const bannerRepo = new JsonRepository<StoreBanner>("banners.json");

export const articleRepo = new JsonRepository<StoreArticle>("articles.json");

export const notificationRepo = new JsonRepository<StoreNotification>(
  "notifications.json",
);

/* -------------------------------------------------------------------------- */
/* Media                                                                       */
/* -------------------------------------------------------------------------- */

export const mediaAssetRepo = new JsonRepository<MediaAsset>(
  "media-assets.json",
);

/* -------------------------------------------------------------------------- */
/* Support                                                                     */
/* -------------------------------------------------------------------------- */

export const supportTicketRepo = new JsonRepository<SupportTicket>(
  "support-tickets.json",
);

export const supportMessageRepo = new JsonRepository<SupportMessage>(
  "support-messages.json",
);

/* -------------------------------------------------------------------------- */
/* Notification Delivery                                                       */
/* -------------------------------------------------------------------------- */

export const notificationDeliveryRepo =
  new JsonRepository<NotificationDelivery>("notification-deliveries.json");
