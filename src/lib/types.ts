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

  // تأمین‌کننده‌های مجاز این محصول
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
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
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
  address?: string;
  createdAt?: string;
  updatedAt?: string;
};

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

export type FinanceEntryType =
  | "SALE"
  | "PURCHASE"
  | "OTHER_INCOME"
  | "OTHER_EXPENSE";

export type FinanceEntry = {
  id: string;
  type: FinanceEntryType;
  referenceId?: string;
  amount: number;
  description?: string;
  createdAt: string;
};

export type InventoryMovement = {
  id: string;
  productId: string;
  quantity: number;
  reason?: string;
  updatedAt: string;
};

export type Role = "ADMIN" | "SUPPLIER" | "CUSTOMER";

export type AppUser = {
  id: string;
  name: string;
  phone: string;
  role: Role;
  permissions?: string[];
  supplierId?: string;
  passwordHash?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreSettings = {
  id: "store";
  storeName: string;
  storePhone: string;
  cardNumber: string;
  cardHolderName: string;
  lowStockThreshold: number;
};

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


export type Coupon = { id:string; code:string; type:"PERCENT"|"FIXED"; value:number; maxDiscount?:number; minOrderAmount?:number; usageLimit?:number; usedCount?:number; startsAt?:string; expiresAt?:string; active:boolean; createdAt?:string; updatedAt?:string };
export type Review = { id:string; productId:string; userId:string; orderId:string; rating:number; title?:string; body:string; status:"PENDING"|"APPROVED"|"REJECTED"; createdAt:string; updatedAt?:string };
export type ProductQuestion = { id:string; productId:string; userId:string; question:string; answer?:string; status:"PENDING"|"ANSWERED"|"REJECTED"; createdAt:string; updatedAt?:string };
export type ReturnRequest = { id:string; saleId:string; userId:string; reason:string; status:"REQUESTED"|"APPROVED"|"REJECTED"|"RECEIVED"|"REFUNDED"; items?:{productId:string;quantity:number}[]; createdAt:string; updatedAt?:string };
export type ShippingOption = { id:string; name:string; code:string; price:number; freeThreshold?:number; estimatedDays:string; active:boolean; createdAt?:string; updatedAt?:string };
export type StoreBanner = { id:string; title:string; subtitle?:string; image:string; buttonText?:string; buttonUrl?:string; active:boolean; position:number; startsAt?:string; endsAt?:string; createdAt?:string; updatedAt?:string };
export type StoreArticle = { id:string; title:string; slug:string; excerpt?:string; content:string; image?:string; active:boolean; createdAt:string; updatedAt?:string };
export type StoreNotification = { id:string; userId?:string; title:string; message:string; type:"ORDER"|"SYSTEM"|"PROMOTION"; read:boolean; readBy?:string[]; createdAt:string };
