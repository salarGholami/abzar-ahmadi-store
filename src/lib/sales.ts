import "server-only";
import { getJson, batchCommit } from "./github";
import { requirePermission } from "./permissions";
import type { Product, Sale, SaleItem, FinanceEntry, InventoryMovement, Customer } from "./types";

type CreateSaleInput = {
  saleId?: string;
  items: { productId: string; quantity: number; unitPrice?: number; purchaseCost?: number }[];
  discount?: number;
  customerId?: string | null;
  paymentStatus?: string;
  receiptImage?: string | null;
  receipt?: { id: string; url: string; fileName: string; uploadedAt: string } | null;
  channel?: "POS" | "ONLINE";
  idempotencyKey?: string;
};

export async function createSale(input: CreateSaleInput) {
  const session = await requirePermission("sales.create");
  const isCustomer = session.role === "CUSTOMER";
  const saleId = input.saleId || crypto.randomUUID();

  const [productsF, salesF, itemsF, invF, finF, customersF, logsF] = await Promise.all([
    getJson<Product[]>("products.json", []),
    getJson<Sale[]>("sales.json", []),
    getJson<SaleItem[]>("sale-items.json", []),
    getJson<InventoryMovement[]>("inventory.json", []),
    getJson<FinanceEntry[]>("finance.json", []),
    getJson<Customer[]>("customers.json", []),
    getJson<{ id: string; action: string; entityId?: string; createdAt: string }[]>("activity-logs.json", [])
  ]);

  const existing = salesF.data.find((s) => s.id === saleId);
  if (existing) return existing;
  if (!Array.isArray(input.items) || !input.items.length) throw new Error("سبد فروش خالی است");

  const items: SaleItem[] = [];
  let subtotal = 0, cogs = 0;
  for (const line of input.items) {
    const p = productsF.data.find((x) => x.id === line.productId);
    if (!p) throw new Error("PRODUCT_NOT_FOUND");
    const q = Number(line.quantity);
    if (!Number.isFinite(q) || q <= 0) throw new Error("INVALID_QUANTITY");
    if (Number(p.stock) < q) throw new Error(`موجودی ${p.title} کافی نیست`);
    const price = isCustomer
      ? Math.round(Number(p.price) * (1 - Number(p.discount || 0) / 100))
      : Number(line.unitPrice ?? Math.round(Number(p.price) * (1 - Number(p.discount || 0) / 100)));
    const cost = Number(line.purchaseCost ?? p.purchaseCost ?? 0);
    const total = price * q;
    subtotal += total; cogs += cost * q;
    items.push({ id: crypto.randomUUID(), saleId, productId: p.id, quantity: q, unitPrice: price, purchaseCost: cost, total });
  }

  const discount = isCustomer ? 0 : Number(input.discount || 0);
  const net = Math.max(0, subtotal - discount);
  if (isCustomer && !input.receiptImage) throw new Error("RECEIPT_REQUIRED");
  // receiptImage must be a hosted URL from uploadMedia(), never an inline base64
  // data URI: embedding a data URI here bloats sales.json past GitHub's 1MB
  // Contents-API inline-read limit and breaks every reader of that file.
  if (input.receiptImage && input.receiptImage.startsWith("data:")) {
    throw new Error("RECEIPT_MUST_BE_UPLOADED_URL");
  }
  const paymentStatus = isCustomer ? "PENDING_TRANSFER" : (input.paymentStatus || "PAID");

  const sale: Sale = {
    id: saleId,
    customerId: isCustomer ? null : (input.customerId || null),
    customerUserId: isCustomer ? session.id : null,
    buyerName: isCustomer ? session.name : undefined,
    buyerPhone: isCustomer ? session.phone : undefined,
    subtotal, discount, netAmount: net, cogs, grossProfit: net - cogs,
    paymentStatus,
    receiptImage: input.receiptImage || null,
    receipt: input.receipt || null,
    channel: isCustomer ? "ONLINE" : (input.channel || "POS"),
    createdAt: new Date().toISOString(),
    idempotencyKey: input.idempotencyKey || saleId
  };

  const inventory = [...invF.data];
  for (const line of items) {
    const row = inventory.find((x) => x.productId === line.productId);
    if (row) { row.quantity = Number(row.quantity) - line.quantity; row.updatedAt = new Date().toISOString(); }
    else inventory.push({ id: crypto.randomUUID(), productId: line.productId, quantity: -line.quantity, updatedAt: new Date().toISOString() });
  }
  const products = productsF.data.map((p) => {
    const i = items.find((x) => x.productId === p.id);
    return i ? { ...p, stock: Number(p.stock) - i.quantity, updatedAt: new Date().toISOString() } : p;
  });
  const finance = paymentStatus === "PAID"
    ? [...finF.data, { id: crypto.randomUUID(), type: "SALE" as const, referenceId: saleId, amount: net, createdAt: new Date().toISOString() }]
    : finF.data;
  let customers = customersF.data;
  if (sale.customerId && paymentStatus !== "PAID") {
    customers = customers.map((c) => (c.id === sale.customerId ? { ...c, balance: Number(c.balance || 0) + net } : c));
  }
  const log = { id: crypto.randomUUID(), action: "SALE_CREATED", entityId: saleId, createdAt: new Date().toISOString() };

  await batchCommit([
    { path: "sales.json", data: [...salesF.data, sale], message: `Create sale ${saleId}` },
    { path: "sale-items.json", data: [...itemsF.data, ...items], message: `Create sale items ${saleId}` },
    { path: "products.json", data: products, message: `Decrease stock ${saleId}` },
    { path: "inventory.json", data: inventory, message: `Inventory movement ${saleId}` },
    { path: "finance.json", data: finance, message: `Finance sale ${saleId}` },
    { path: "customers.json", data: customers, message: `Customer balance ${saleId}` },
    { path: "activity-logs.json", data: [...logsF.data, log], message: `Audit sale ${saleId}` }
  ]);
  return sale;
}
