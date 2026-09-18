export type ProductImage = {
  id: string;
  url: string;
  path?: string;
  alt?: string;
  position: number;
  createdAt: string;
};

export type ProductSpec = { label: string; value: string };

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
  purchaseCost?: number;
  description?: string;
  specs?: ProductSpec[];
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = { id: string; name: string; slug: string; description?: string; active?: boolean; createdAt?: string; updatedAt?: string };
export type Customer = { id: string; name: string; phone: string; address?: string; balance?: number; userId?: string; createdAt?: string; updatedAt?: string };
export type Supplier = { id: string; name: string; phone: string; address?: string; createdAt?: string; updatedAt?: string };
export type PaymentStatus = "PAID" | "PENDING_TRANSFER" | "PARTIAL" | "CANCELED";

export type Receipt = {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: string;
};

export type Sale = {
  id: string;
  customerId?: string | null;
  customerUserId?: string | null;
  buyerName?: string;
  buyerPhone?: string;
  subtotal: number;
  discount: number;
  netAmount: number;
  cogs: number;
  grossProfit: number;
  paymentStatus: PaymentStatus | string;
  receiptImage?: string | null;
  receipt?: Receipt | null;
  channel?: "POS" | "ONLINE";
  createdAt: string;
  idempotencyKey?: string;
};

export type SaleItem = { id: string; saleId: string; productId: string; quantity: number; unitPrice: number; purchaseCost: number; total: number };
export type CheckDirection = "RECEIVED" | "ISSUED";
export type CheckStatus = "PENDING" | "CLEARED" | "BOUNCED";
export type CheckRecord = { id: string; number: string; bank: string; dueDate: string; amount: number; direction: CheckDirection; status: CheckStatus; relatedName?: string; purchaseId?: string; description?: string; createdAt?: string; updatedAt?: string };
export type PurchasePaymentMethod = "CASH" | "CHECK";
export type Purchase = { id: string; supplierId?: string | null; supplierName?: string; subtotal: number; paymentMethod: PurchasePaymentMethod; checkId?: string | null; createdAt: string };
export type PurchaseItem = { id: string; purchaseId: string; productId: string; quantity: number; unitCost: number; total: number };
export type FinanceEntryType = "SALE" | "PURCHASE" | "OTHER_INCOME" | "OTHER_EXPENSE";
export type FinanceEntry = { id: string; type: FinanceEntryType; referenceId?: string; amount: number; description?: string; createdAt: string };
export type InventoryMovement = { id: string; productId: string; quantity: number; reason?: string; updatedAt: string };
export type Role = "ADMIN" | "CUSTOMER";
export type AppUser = { id: string; name: string; phone: string; role: Role; permissions?: string[]; passwordHash?: string; createdAt?: string; updatedAt?: string };
export type StoreSettings = { id: "store"; storeName: string; storePhone: string; cardNumber: string; cardHolderName: string; lowStockThreshold: number };
export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: { code: string; message: string } };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
