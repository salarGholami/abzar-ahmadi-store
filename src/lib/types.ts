import type { Role } from "./roles";

export type { Role };

/* -------------------------------------------------------------------------- */
/* Product                                                                     */
/* -------------------------------------------------------------------------- */

export type ProductImage = {
  id: string;
  url: string;
  path?: string;
  alt?: string;
  position: number;
  createdAt: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  title: string;
  brand: string;
  sku: string;
  category: string;
  price: number;
  discount: number;
  stock: number;
  image: string;
  images?: ProductImage[];
  supplierIds?: string[];
  purchaseCost?: number;
  description?: string;
  specs?: ProductSpec[];
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  /** Optional category image URL (public path or remote). Safe to omit. */
  image?: string | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Brand = {
  id: string;
  name: string;
  /** Optional brand logo URL. Safe to omit — UI must not crash. */
  image?: string | null;
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

/* -------------------------------------------------------------------------- */
/* Customer / Supplier                                                         */
/* -------------------------------------------------------------------------- */

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

/* -------------------------------------------------------------------------- */
/* Payments                                                                    */
/* -------------------------------------------------------------------------- */

export type PaymentStatus =
  | "PAID"
  | "PENDING_TRANSFER"
  | "PENDING_PAYMENT"
  | "PARTIAL"
  | "CANCELED";

export type Receipt = {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: string;
};

export type PaymentTransactionStatus =
  | "INITIATED"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "REFUNDED";

export type PaymentTransaction = {
  id: string;
  orderId: string;
  provider: "MANUAL_TRANSFER" | "ZARINPAL" | "IDPAY" | "NEXT_PROVIDER";
  status: PaymentTransactionStatus;
  amount: number;
  authority?: string | null;
  referenceId?: string | null;
  callbackPayload?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/* Orders                                                                      */
/* -------------------------------------------------------------------------- */

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_REVIEW"
  | "PAID"
  | "PAYMENT_FAILED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUNDED";

export type OrderEvent = {
  id: string;
  orderId: string;
  from: OrderStatus;
  to: OrderStatus;
  actorId: string;
  actorRole: Role;
  reason?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/* Shipping                                                                    */
/* -------------------------------------------------------------------------- */

export type ShippingStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED";

export type ShippingMethod =
  | "POST"
  | "TIPAX"
  | "SNAPP"
  | "COURIER"
  | "PICKUP"
  | "OTHER";

export type ShippingOption = {
  id: string;
  name: string;
  code: string;
  price: number;
  freeThreshold?: number;
  estimatedDays: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/* -------------------------------------------------------------------------- */
/* Sale                                                                        */
/* -------------------------------------------------------------------------- */

export type Sale = {
  id: string;

  customerId?: string | null;
  customerUserId?: string | null;

  buyerName?: string;
  buyerPhone?: string;

  subtotal: number;
  discount: number;
  netAmount: number;
  shippingCost?: number;
  couponCode?: string | null;

  cogs: number;
  grossProfit: number;

  paymentStatus: PaymentStatus | string;

  paymentProvider?: "MANUAL_TRANSFER" | "ZARINPAL" | "IDPAY" | "NEXT_PROVIDER";

  paymentTransactionId?: string | null;

  orderStatus?: OrderStatus;

  shippingAddress?: {
    recipientName: string;
    phone: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
  } | null;

  receiptImage?: string | null;
  receipt?: Receipt | null;

  channel?: "POS" | "ONLINE";

  shippingStatus: ShippingStatus;
  trackingCode?: string | null;
  shippingMethod?: ShippingMethod | null;
  shippingCompany?: string | null;
  shippedAt?: string | null;
  trackingUrl?: string | null;

  createdAt: string;
  updatedAt?: string;

  idempotencyKey?: string;
};

export type SaleItem = {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  purchaseCost: number;
  total: number;
};

/* -------------------------------------------------------------------------- */
/* Purchases                                                                   */
/* -------------------------------------------------------------------------- */

export type CheckDirection = "RECEIVED" | "ISSUED";

export type CheckStatus = "PENDING" | "CLEARED" | "BOUNCED";

export type CheckRecord = {
  id: string;
  number: string;
  bank: string;
  dueDate: string;
  amount: number;
  direction: CheckDirection;
  status: CheckStatus;
  relatedName?: string;
  purchaseId?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PurchasePaymentMethod = "CASH" | "CHECK";

export type Purchase = {
  id: string;
  supplierId?: string | null;
  supplierName?: string;
  subtotal: number;
  paymentMethod: PurchasePaymentMethod;
  checkId?: string | null;
  createdAt: string;
};

export type PurchaseItem = {
  id: string;
  purchaseId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  total: number;
};

/* -------------------------------------------------------------------------- */
/* Finance                                                                     */
/* -------------------------------------------------------------------------- */

export type FinanceEntryType =
  | "SALE"
  | "PURCHASE"
  | "OTHER_INCOME"
  | "OTHER_EXPENSE"
  | "REFUND";

export type FinanceEntry = {
  id: string;
  type: FinanceEntryType;
  referenceId?: string;
  amount: number;
  description?: string;
  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/* Inventory                                                                   */
/* -------------------------------------------------------------------------- */

export type InventoryMovement = {
  id: string;
  productId: string;
  quantity: number;
  reason?: string;
  updatedAt: string;
};

export type InventoryReservationStatus =
  | "ACTIVE"
  | "CONSUMED"
  | "RELEASED"
  | "EXPIRED";

export type InventoryReservation = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  status: InventoryReservationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/* Users                                                                       */
/* -------------------------------------------------------------------------- */

export type AppUser = {
  id: string;
  name: string;
  phone: string;
  role: Role;
  isOwner?: boolean;
  permissions?: string[];
  supplierId?: string;
  passwordHash?: string;
  createdAt?: string;
  updatedAt?: string;
};

/* -------------------------------------------------------------------------- */
/* Store                                                                       */
/* -------------------------------------------------------------------------- */

export type StoreSettings = {
  id: "store";
  storeName: string;
  storePhone: string;
  cardNumber: string;
  cardHolderName: string;
  lowStockThreshold: number;
};

export type StoreBanner = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonUrl?: string;
  active: boolean;
  position: number;
  startsAt?: string;
  endsAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  contentHtml?: string;
  category?: string;
  tags?: string[];
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  author?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  readingMinutes?: number;
  publishedAt?: string;
  noIndex?: boolean;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type StoreNotification = {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: "ORDER" | "SYSTEM" | "PROMOTION";
  read: boolean;
  readBy?: string[];
  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/* Media                                                                       */
/* -------------------------------------------------------------------------- */

export type MediaPurpose =
  | "PRODUCT"
  | "RECEIPT"
  | "BANNER"
  | "ARTICLE"
  | "SUPPORT"
  | "CATEGORY"
  | "BRAND";

export type MediaAsset = {
  id: string;
  filename: string;
  originalName?: string;
  mimeType: string;
  size: number;
  url: string;
  path?: string;
  purpose: MediaPurpose;
  entityId?: string;
  alt?: string;
  createdAt: string;
  updatedAt?: string;
};

/* -------------------------------------------------------------------------- */
/* Support                                                                     */
/* -------------------------------------------------------------------------- */

export type SupportTicketCategory =
  | "ORDER"
  | "PRODUCT"
  | "PAYMENT"
  | "SHIPPING"
  | "RETURN"
  | "OTHER";

export type SupportTicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type SupportTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "RESOLVED"
  | "CLOSED";

export type SupportTicket = {
  id: string;
  userId: string;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  orderId?: string | null;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SupportMessage = {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: Role;
  body: string;
  attachmentUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/* Notification Delivery                                                       */
/* -------------------------------------------------------------------------- */

export type NotificationDeliveryChannel = "IN_APP" | "EMAIL" | "SMS";

export type NotificationDeliveryStatus =
  | "QUEUED"
  | "PROCESSING"
  | "SENT"
  | "FAILED";

export type NotificationDelivery = {
  id: string;
  notificationId: string;
  channel: NotificationDeliveryChannel;
  status: NotificationDeliveryStatus;
  attempts: number;
  lastError?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/* Returns / Refunds                                                           */
/* -------------------------------------------------------------------------- */

export type ReturnRequest = {
  id: string;
  saleId: string;
  userId: string;
  reason: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "RECEIVED" | "REFUNDED";
  items?: {
    productId: string;
    quantity: number;
  }[];
  createdAt: string;
  updatedAt?: string;
};

export type RefundStatus =
  | "APPROVED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type RefundMethod = "MANUAL_TRANSFER" | "CASH" | "ORIGINAL_PAYMENT";

export type Refund = {
  id: string;
  orderId: string;
  returnId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  method: RefundMethod;
  approvedBy: string;
  referenceId?: string | null;
  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/* Idempotency                                                                */
/* -------------------------------------------------------------------------- */

export type IdempotencyStatus = "IN_PROGRESS" | "COMPLETED" | "FAILED";

export type IdempotencyRecord = {
  id: string;
  key: string;
  scope: string;
  actorId?: string | null;
  requestHash: string;
  status: IdempotencyStatus;
  response?: unknown;
  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/* Marketing / Product Interaction                                             */
/* -------------------------------------------------------------------------- */

export type Coupon = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  startsAt?: string;
  expiresAt?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  title?: string;
  body: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt?: string;
};

export type ProductQuestion = {
  id: string;
  productId: string;
  userId: string;
  question: string;
  answer?: string;
  status: "PENDING" | "ANSWERED" | "REJECTED";
  createdAt: string;
  updatedAt?: string;
};

/* -------------------------------------------------------------------------- */
/* Wishlist / Cart                                                             */
/* -------------------------------------------------------------------------- */

export type WishlistEntry = {
  userId: string;
  productIds: string[];
  updatedAt: string;
};

export type UserPreferences = {
  userId: string;
  theme?: "light" | "dark";
  readNotificationIds?: string[];
  updatedAt: string;
};

export type CartLine = {
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type PersistedCart = {
  id: string;
  ownerType: "USER" | "GUEST";
  ownerId: string;
  lines: CartLine[];
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/* Customer Events                                                             */
/* -------------------------------------------------------------------------- */

export type CustomerEventName =
  | "PAGE_VIEW"
  | "PRODUCT_VIEW"
  | "SEARCH"
  | "FILTER_APPLIED"
  | "CATEGORY_VIEW"
  | "CART_ITEM_ADDED"
  | "CART_ITEM_UPDATED"
  | "CART_ITEM_REMOVED"
  | "CART_CLEARED"
  | "CHECKOUT_STARTED"
  | "ORDER_CREATED"
  | "LOGIN"
  | "REGISTER"
  | "LOGOUT"
  | "WISHLIST_ADDED"
  | "WISHLIST_REMOVED";

export type CustomerEvent = {
  id: string;
  actorType: "USER" | "GUEST";
  actorId: string;
  name: CustomerEventName;
  path?: string;
  entityId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/* Addresses                                                                   */
/* -------------------------------------------------------------------------- */

export type CustomerAddress = {
  id: string;
  userId: string;
  title: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/* API                                                                          */
/* -------------------------------------------------------------------------- */

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
