import "server-only";

import { batchCommit, getJson, withConflictRetry } from "./github";
import { requirePermission } from "./permissions";
import {
  buildTransaction,
  getActivePaymentProvider,
  getPaymentGateway,
  patchTransaction,
  startOnlinePayment,
  type PaymentProvider,
} from "./payments";
import { trackServerEvent } from "./events";
import { normalizePhone } from "./phone";
import type {
  Coupon,
  Customer,
  FinanceEntry,
  InventoryMovement,
  PaymentTransaction,
  Product,
  Sale,
  SaleItem,
} from "./types";

type ShippingAddress = NonNullable<Sale["shippingAddress"]>;

type CreateSaleInput = {
  saleId?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice?: number;
    purchaseCost?: number;
  }[];
  discount?: number;
  customerId?: string | null;
  paymentStatus?: string;
  receiptImage?: string | null;
  receipt?: { id: string; url: string; fileName: string; uploadedAt: string } | null;
  channel?: "POS" | "ONLINE";
  shippingAddress?: Partial<ShippingAddress> | null;
  idempotencyKey?: string;
  couponCode?: string | null;
  shippingCost?: number;
};

type LogRow = { id: string; action: string; entityId?: string; createdAt: string };

export type SaleWithPayment = Sale & {
  payment?: { provider: PaymentProvider; redirectUrl: string | null; error?: string };
};

export const PAYMENT_STATUSES = ["PAID", "PENDING_TRANSFER", "PENDING_PAYMENT", "PARTIAL", "CANCELED"] as const;
export type SalePaymentStatus = (typeof PAYMENT_STATUSES)[number];

const now = () => new Date().toISOString();
const finalPrice = (product: Product) =>
  Math.round(Number(product.price) * (1 - Number(product.discount || 0) / 100));

/** A sale "owes" money while it is neither paid nor canceled. */
const owes = (status: string) => status !== "PAID" && status !== "CANCELED";

function isValidReceiptUrl(value: string) {
  if (value.startsWith("data:")) return false;
  if (value.startsWith("/uploads/")) return !value.includes("..");
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "raw.githubusercontent.com";
  } catch {
    return false;
  }
}

function cleanAddress(input: CreateSaleInput["shippingAddress"]): ShippingAddress {
  const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
  const address: ShippingAddress = {
    recipientName: text(input?.recipientName, 100),
    phone: normalizePhone(input?.phone),
    province: text(input?.province, 60),
    city: text(input?.city, 60),
    address: text(input?.address, 500),
    postalCode: text(input?.postalCode, 20).replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))),
  };
  if (!address.recipientName || !address.province || !address.city || !address.address) {
    throw new Error("اطلاعات کامل آدرس ارسال را وارد کنید.");
  }
  if (!address.phone) throw new Error("شماره موبایل گیرنده معتبر نیست.");
  if (!/^\d{10}$/.test(address.postalCode)) throw new Error("کد پستی باید ۱۰ رقم باشد.");
  return address;
}

export async function createSale(input: CreateSaleInput): Promise<SaleWithPayment> {
  const session = await requirePermission("sales.create");
  const isCustomer = session.role === "CUSTOMER";
  const provider: PaymentProvider = isCustomer ? getActivePaymentProvider() : "MANUAL_TRANSFER";
  const gateway = getPaymentGateway(provider);

  const saleId = typeof input.saleId === "string" && /^[0-9a-f-]{36}$/i.test(input.saleId) ? input.saleId : crypto.randomUUID();

  const result = await withConflictRetry(async () => {
    const [productsF, salesF, itemsF, invF, finF, customersF, logsF, txF, couponsF] = await Promise.all([
      getJson<Product[]>("products.json", []),
      getJson<Sale[]>("sales.json", []),
      getJson<SaleItem[]>("sale-items.json", []),
      getJson<InventoryMovement[]>("inventory.json", []),
      getJson<FinanceEntry[]>("finance.json", []),
      getJson<Customer[]>("customers.json", []),
      getJson<LogRow[]>("activity-logs.json", []),
      getJson<PaymentTransaction[]>("payment-transactions.json", []),
      getJson<Coupon[]>("coupons.json", []),
    ]);

    const existing = salesF.data.find(
      (sale) => sale.id === saleId || (input.idempotencyKey && sale.idempotencyKey === input.idempotencyKey),
    );
    if (existing) {
      // Idempotent replay: only the owner (or staff) may receive the existing order.
      if (session.role !== "ADMIN" && existing.customerUserId !== session.id) throw new Error("FORBIDDEN");
      return { sale: existing as Sale, created: false, transaction: null as PaymentTransaction | null };
    }

    if (!Array.isArray(input.items) || !input.items.length) throw new Error("سبد فروش خالی است");
    if (input.items.length > 100) throw new Error("VALIDATION_ERROR");

    // Merge duplicate lines so stock checks are accurate.
    const requested = new Map<string, { quantity: number; unitPrice?: number; purchaseCost?: number }>();
    for (const line of input.items) {
      const quantity = Number(line.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 100000) throw new Error("INVALID_QUANTITY");
      const current = requested.get(line.productId);
      if (current) current.quantity += quantity;
      else requested.set(line.productId, { quantity, unitPrice: line.unitPrice, purchaseCost: line.purchaseCost });
    }

    const items: SaleItem[] = [];
    let subtotal = 0;
    let cogs = 0;

    for (const [productId, line] of requested) {
      const product = productsF.data.find((item) => item.id === productId);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      if (Number(product.stock) < line.quantity) throw new Error(`موجودی ${product.title} کافی نیست`);

      const price = isCustomer ? finalPrice(product) : Number(line.unitPrice ?? finalPrice(product));
      if (!Number.isFinite(price) || price < 0) throw new Error("VALIDATION_ERROR");
      const cost = Number(line.purchaseCost ?? product.purchaseCost ?? 0);
      if (!Number.isFinite(cost) || cost < 0) throw new Error("INVALID_COST");

      const total = price * line.quantity;
      subtotal += total;
      cogs += cost * line.quantity;
      items.push({
        id: crypto.randomUUID(),
        saleId,
        productId: product.id,
        quantity: line.quantity,
        unitPrice: price,
        purchaseCost: cost,
        total,
      });
    }

    let discount = isCustomer ? 0 : Math.max(0, Math.min(Number(input.discount || 0) || 0, subtotal));
    let appliedCoupon: Coupon | null = null;
    if (isCustomer && input.couponCode) {
      const code = String(input.couponCode).trim().toLowerCase();
      const c = couponsF.data.find(x => x.active && x.code.toLowerCase() === code);
      const nowMs = Date.now();
      if (!c) throw new Error("کد تخفیف معتبر نیست.");
      if (c.startsAt && new Date(c.startsAt).getTime() > nowMs) throw new Error("کد تخفیف هنوز فعال نشده است.");
      if (c.expiresAt && new Date(c.expiresAt).getTime() < nowMs) throw new Error("کد تخفیف منقضی شده است.");
      if (c.usageLimit && Number(c.usedCount || 0) >= c.usageLimit) throw new Error("ظرفیت استفاده از کد تخفیف تکمیل شده است.");
      if (c.minOrderAmount && subtotal < c.minOrderAmount) throw new Error("حداقل مبلغ سفارش برای این کد رعایت نشده است.");
      discount = c.type === "PERCENT" ? Math.round(subtotal * c.value / 100) : c.value;
      if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
      discount = Math.max(0, Math.min(discount, subtotal));
      appliedCoupon = c;
    }
    const shippingCost = Math.max(0, Number(input.shippingCost || 0));
    const net = Math.max(0, subtotal - discount + shippingCost);

    let receiptImage: string | null = null;
    if (isCustomer && provider === "MANUAL_TRANSFER") {
      if (!input.receiptImage) throw new Error("RECEIPT_REQUIRED");
    }
    if (input.receiptImage) {
      if (!isValidReceiptUrl(input.receiptImage)) throw new Error("RECEIPT_MUST_BE_UPLOADED_URL");
      receiptImage = input.receiptImage;
    }

    const shippingAddress = isCustomer ? cleanAddress(input.shippingAddress) : null;

    let paymentStatus: string;
    if (isCustomer) {
      paymentStatus = provider === "MANUAL_TRANSFER" ? "PENDING_TRANSFER" : "PENDING_PAYMENT";
    } else {
      const requestedStatus = input.paymentStatus || "PAID";
      if (!(PAYMENT_STATUSES as readonly string[]).includes(requestedStatus) || requestedStatus === "CANCELED") {
        throw new Error("VALIDATION_ERROR");
      }
      paymentStatus = requestedStatus;
    }

    const customerId = isCustomer ? null : input.customerId || null;
    if (customerId && !customersF.data.some((customer) => customer.id === customerId)) {
      throw new Error("مشتری انتخاب‌شده پیدا نشد");
    }

    const transaction = isCustomer ? buildTransaction({ orderId: saleId, provider, amount: net }) : null;
    const timestamp = now();

    const sale: Sale = {
      id: saleId,
      customerId,
      customerUserId: isCustomer ? session.id : null,
      buyerName: isCustomer ? session.name : undefined,
      buyerPhone: isCustomer ? session.phone : undefined,
      subtotal,
      discount,
      netAmount: net,
      cogs,
      grossProfit: net - cogs,
      paymentStatus,
      paymentProvider: isCustomer ? provider : undefined,
      paymentTransactionId: transaction?.id ?? null,
      shippingAddress,
      receiptImage,
      receipt: receiptImage
        ? {
            id: typeof input.receipt?.id === "string" && input.receipt.id ? input.receipt.id.slice(0, 64) : crypto.randomUUID(),
            url: receiptImage,
            fileName: typeof input.receipt?.fileName === "string" ? input.receipt.fileName.slice(0, 200) : "receipt",
            uploadedAt: timestamp,
          }
        : null,
      channel: isCustomer ? "ONLINE" : input.channel || "POS",
      shippingStatus: "PENDING",
      trackingCode: null,
      shippingMethod: null,
      shippingCompany: null,
      shippedAt: null,
      trackingUrl: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      idempotencyKey: input.idempotencyKey || saleId,
    };

    const inventory = [...invF.data];
    for (const line of items) {
      const index = inventory.findIndex((row) => row.productId === line.productId);
      if (index >= 0) {
        inventory[index] = { ...inventory[index], quantity: Number(inventory[index].quantity) - line.quantity, updatedAt: timestamp };
      } else {
        inventory.push({
          id: crypto.randomUUID(),
          productId: line.productId,
          quantity: -line.quantity,
          reason: `SALE:${saleId}`,
          updatedAt: timestamp,
        });
      }
    }

    const products = productsF.data.map((product) => {
      const quantity = items.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
      return quantity ? { ...product, stock: Number(product.stock) - quantity, updatedAt: timestamp } : product;
    });

    const finance: FinanceEntry[] =
      paymentStatus === "PAID"
        ? [...finF.data, { id: crypto.randomUUID(), type: "SALE", referenceId: saleId, amount: net, createdAt: timestamp }]
        : finF.data;

    const coupons = appliedCoupon
      ? couponsF.data.map((coupon) => coupon.id === appliedCoupon!.id ? { ...coupon, usedCount: Number(coupon.usedCount || 0) + 1, updatedAt: timestamp } : coupon)
      : couponsF.data;

    const customers =
      customerId && owes(paymentStatus)
        ? customersF.data.map((customer) =>
            customer.id === customerId
              ? { ...customer, balance: Number(customer.balance || 0) + net, updatedAt: timestamp }
              : customer,
          )
        : customersF.data;

    const log: LogRow = { id: crypto.randomUUID(), action: "SALE_CREATED", entityId: saleId, createdAt: timestamp };

    await batchCommit([
      { path: "sales.json", data: [...salesF.data, sale], message: `Create sale ${saleId}` },
      { path: "sale-items.json", data: [...itemsF.data, ...items], message: `Create sale items ${saleId}` },
      { path: "products.json", data: products, message: `Decrease stock ${saleId}` },
      { path: "inventory.json", data: inventory, message: `Inventory movement ${saleId}` },
      { path: "finance.json", data: finance, message: `Finance sale ${saleId}` },
      { path: "customers.json", data: customers, message: `Customer balance ${saleId}` },
      { path: "coupons.json", data: coupons, message: `Coupon usage ${saleId}` },
      { path: "activity-logs.json", data: [...logsF.data.slice(-4999), log], message: `Audit sale ${saleId}` },
      ...(transaction
        ? [{ path: "payment-transactions.json", data: [...txF.data, transaction], message: `Payment transaction ${transaction.id}` }]
        : []),
    ]);

    return { sale, created: true, transaction };
  });

  const response: SaleWithPayment = { ...result.sale };

  if (isCustomer && result.created && result.transaction) {
    if (gateway.online) {
      try {
        const started = await startOnlinePayment({
          provider,
          orderId: result.sale.id,
          transactionId: result.transaction.id,
          amount: result.sale.netAmount,
          mobile: session.phone,
        });
        response.payment = { provider, redirectUrl: started.redirectUrl };
      } catch (error) {
        console.error("startOnlinePayment failed", error);
        response.payment = {
          provider,
          redirectUrl: null,
          error: error instanceof Error ? error.message : "شروع پرداخت انجام نشد.",
        };
      }
    } else {
      response.payment = { provider, redirectUrl: null };
    }
    await trackServerEvent("ORDER_CREATED", {
      entityId: result.sale.id,
      metadata: { amount: result.sale.netAmount, channel: "ONLINE" },
    });
  }

  return response;
}


/**
 * Changes a sale's payment status and keeps stock, finance, customer balance
 * and payment transactions consistent — in ONE atomic commit.
 */
export async function setSalePaymentStatus(
  saleId: string,
  nextStatus: string,
  options?: { referenceId?: string | null; actorLabel?: string },
): Promise<Sale> {
  if (!(PAYMENT_STATUSES as readonly string[]).includes(nextStatus)) throw new Error("VALIDATION_ERROR");

  const { sale } = await withConflictRetry(async () => {
    const [salesF, itemsF, productsF, invF, finF, customersF, logsF, txF] = await Promise.all([
      getJson<Sale[]>("sales.json", []),
      getJson<SaleItem[]>("sale-items.json", []),
      getJson<Product[]>("products.json", []),
      getJson<InventoryMovement[]>("inventory.json", []),
      getJson<FinanceEntry[]>("finance.json", []),
      getJson<Customer[]>("customers.json", []),
      getJson<LogRow[]>("activity-logs.json", []),
      getJson<PaymentTransaction[]>("payment-transactions.json", []),
    ]);

    const index = salesF.data.findIndex((item) => item.id === saleId);
    if (index < 0) throw new Error("NOT_FOUND");
    const current = salesF.data[index];
    const from = String(current.paymentStatus);
    if (from === nextStatus) return { sale: current };

    const timestamp = now();
    const saleItems = itemsF.data.filter((item) => item.saleId === saleId);
    let products = productsF.data;
    let inventory = invF.data;

    const applyStock = (direction: 1 | -1) => {
      for (const line of saleItems) {
        const product = products.find((item) => item.id === line.productId);
        if (!product) continue;
        if (direction === -1 && Number(product.stock) < line.quantity) {
          throw new Error(`موجودی ${product.title} برای فعال‌سازی مجدد سفارش کافی نیست`);
        }
      }
      products = products.map((product) => {
        const quantity = saleItems.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
        return quantity ? { ...product, stock: Number(product.stock) + direction * quantity, updatedAt: timestamp } : product;
      });
      inventory = [...inventory];
      for (const line of saleItems) {
        const rowIndex = inventory.findIndex((row) => row.productId === line.productId);
        if (rowIndex >= 0) {
          inventory[rowIndex] = { ...inventory[rowIndex], quantity: Number(inventory[rowIndex].quantity) + direction * line.quantity, updatedAt: timestamp };
        } else {
          inventory.push({ id: crypto.randomUUID(), productId: line.productId, quantity: direction * line.quantity, reason: `SALE_STATUS:${saleId}`, updatedAt: timestamp });
        }
      }
    };

    if (nextStatus === "CANCELED" && from !== "CANCELED") applyStock(1);
    if (from === "CANCELED" && nextStatus !== "CANCELED") applyStock(-1);

    let finance = finF.data;
    const hasSaleEntry = finance.some((entry) => entry.type === "SALE" && entry.referenceId === saleId);
    if (nextStatus === "PAID" && !hasSaleEntry) {
      finance = [...finance, { id: crypto.randomUUID(), type: "SALE", referenceId: saleId, amount: current.netAmount, createdAt: timestamp }];
    }
    if (from === "PAID" && nextStatus !== "PAID" && hasSaleEntry) {
      finance = finance.filter((entry) => !(entry.type === "SALE" && entry.referenceId === saleId));
    }

    let customers = customersF.data;
    const delta = (owes(nextStatus) ? 1 : 0) - (owes(from) ? 1 : 0);
    if (current.customerId && delta !== 0) {
      customers = customers.map((customer) =>
        customer.id === current.customerId
          ? { ...customer, balance: Math.max(0, Number(customer.balance || 0) + delta * current.netAmount), updatedAt: timestamp }
          : customer,
      );
    }

    const updated: Sale = {
      ...current,
      paymentStatus: nextStatus,
      shippingStatus:
        nextStatus === "CANCELED"
          ? "CANCELED"
          : from === "CANCELED"
            ? "PENDING"
            : (current.shippingStatus ?? "PENDING"),
      updatedAt: timestamp,
    };

    let transactions = txF.data;
    if (current.paymentTransactionId) {
      const txIndex = transactions.findIndex((item) => item.id === current.paymentTransactionId);
      if (txIndex >= 0) {
        const previous = transactions[txIndex];
        const status: PaymentTransaction["status"] =
          nextStatus === "PAID"
            ? "PAID"
            : nextStatus === "CANCELED"
              ? "CANCELED"
              : previous.status === "CANCELED" || previous.status === "PAID"
                ? "PENDING"
                : previous.status;
        transactions = transactions.map((item, i) =>
          i === txIndex
            ? { ...item, status, referenceId: options?.referenceId ?? item.referenceId ?? null, updatedAt: timestamp }
            : item,
        );
      }
    }

    const log: LogRow = { id: crypto.randomUUID(), action: `SALE_PAYMENT_${from}_TO_${nextStatus}`, entityId: saleId, createdAt: timestamp };

    await batchCommit([
      { path: "sales.json", data: salesF.data.map((item, i) => (i === index ? updated : item)), message: `Sale ${saleId} payment ${nextStatus}` },
      { path: "products.json", data: products, message: `Stock sync ${saleId}` },
      { path: "inventory.json", data: inventory, message: `Inventory sync ${saleId}` },
      { path: "finance.json", data: finance, message: `Finance sync ${saleId}` },
      { path: "customers.json", data: customers, message: `Customer balance sync ${saleId}` },
      { path: "payment-transactions.json", data: transactions, message: `Payment transaction sync ${saleId}` },
      { path: "activity-logs.json", data: [...logsF.data.slice(-4999), log], message: `Audit sale ${saleId}` },
    ]);

    return { sale: updated };
  });

  return sale;
}

export async function deleteSale(saleId: string) {
  await withConflictRetry(async () => {
    const [salesF, itemsF, productsF, invF, finF, customersF, logsF] = await Promise.all([
      getJson<Sale[]>("sales.json", []),
      getJson<SaleItem[]>("sale-items.json", []),
      getJson<Product[]>("products.json", []),
      getJson<InventoryMovement[]>("inventory.json", []),
      getJson<FinanceEntry[]>("finance.json", []),
      getJson<Customer[]>("customers.json", []),
      getJson<LogRow[]>("activity-logs.json", []),
    ]);

    const sale = salesF.data.find((item) => item.id === saleId);
    if (!sale) throw new Error("NOT_FOUND");

    const timestamp = now();
    const saleItems = itemsF.data.filter((item) => item.saleId === saleId);
    const status = String(sale.paymentStatus);

    let products = productsF.data;
    let inventory = invF.data;
    if (status !== "CANCELED") {
      products = products.map((product) => {
        const quantity = saleItems.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
        return quantity ? { ...product, stock: Number(product.stock) + quantity, updatedAt: timestamp } : product;
      });
      inventory = inventory.map((row) => {
        const quantity = saleItems.filter((item) => item.productId === row.productId).reduce((sum, item) => sum + item.quantity, 0);
        return quantity ? { ...row, quantity: Number(row.quantity) + quantity, updatedAt: timestamp } : row;
      });
    }

    const customers =
      sale.customerId && owes(status)
        ? customersF.data.map((customer) =>
            customer.id === sale.customerId
              ? { ...customer, balance: Math.max(0, Number(customer.balance || 0) - sale.netAmount), updatedAt: timestamp }
              : customer,
          )
        : customersF.data;

    await batchCommit([
      { path: "sales.json", data: salesF.data.filter((item) => item.id !== saleId), message: `Delete sale ${saleId}` },
      { path: "sale-items.json", data: itemsF.data.filter((item) => item.saleId !== saleId), message: `Delete sale items ${saleId}` },
      { path: "products.json", data: products, message: `Restore stock ${saleId}` },
      { path: "inventory.json", data: inventory, message: `Inventory restore ${saleId}` },
      { path: "finance.json", data: finF.data.filter((entry) => !(entry.type === "SALE" && entry.referenceId === saleId)), message: `Finance cleanup ${saleId}` },
      { path: "customers.json", data: customers, message: `Customer balance ${saleId}` },
      { path: "activity-logs.json", data: [...logsF.data.slice(-4999), { id: crypto.randomUUID(), action: "SALE_DELETED", entityId: saleId, createdAt: timestamp }], message: `Audit delete ${saleId}` },
    ]);
  });
}

/** Called by the gateway callback route. Verifies with the provider, then settles the order idempotently. */
export async function settleOnlinePayment(input: {
  transactionId: string;
  provider: PaymentProvider;
  callbackQuery: Record<string, string>;
}): Promise<{ orderId: string | null; success: boolean }> {
  const txFile = await getJson<PaymentTransaction[]>("payment-transactions.json", []);
  const transaction = txFile.data.find((item) => item.id === input.transactionId && item.provider === input.provider);
  if (!transaction) return { orderId: null, success: false };
  if (transaction.status === "PAID") return { orderId: transaction.orderId, success: true };
  if (transaction.status === "CANCELED") return { orderId: transaction.orderId, success: false };

  const gateway = getPaymentGateway(input.provider);
  const verified = await gateway.verify({
    transactionId: transaction.id,
    amount: transaction.amount,
    authority: transaction.authority,
    callbackQuery: input.callbackQuery,
  });

  if (!verified.success) {
    await patchTransaction(transaction.id, { status: "FAILED", callbackPayload: { ...input.callbackQuery } });
    return { orderId: transaction.orderId, success: false };
  }

  await setSalePaymentStatus(transaction.orderId, "PAID", { referenceId: verified.referenceId ?? null });
  await patchTransaction(transaction.id, {
    status: "PAID",
    referenceId: verified.referenceId ?? null,
    callbackPayload: { ...input.callbackQuery },
  });
  return { orderId: transaction.orderId, success: true };
}

