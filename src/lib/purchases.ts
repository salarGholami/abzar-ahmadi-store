import "server-only";
import { getJson, batchCommit } from "./github";
import { requirePermission } from "./permissions";
import type { Product, Purchase, PurchaseItem, FinanceEntry, CheckRecord, InventoryMovement } from "./types";
import { normalizeJalali } from "./dates";

type CreatePurchaseInput = {
  purchaseId?: string;
  supplierId?: string | null;
  supplierName?: string;
  items: { productId: string; quantity: number; unitCost: number }[];
  paymentMethod: "CASH" | "CHECK";
  check?: { number: string; bank: string; dueDate: string };
};

export async function createPurchase(input: CreatePurchaseInput) {
  await requirePermission("purchases.create");
  const purchaseId = input.purchaseId || crypto.randomUUID();

  const [productsF, purchasesF, itemsF, invF, finF, checksF, logsF] = await Promise.all([
    getJson<Product[]>("products.json", []),
    getJson<Purchase[]>("purchases.json", []),
    getJson<PurchaseItem[]>("purchase-items.json", []),
    getJson<InventoryMovement[]>("inventory.json", []),
    getJson<FinanceEntry[]>("finance.json", []),
    getJson<CheckRecord[]>("checks.json", []),
    getJson<{ id: string; action: string; entityId?: string; createdAt: string }[]>("activity-logs.json", [])
  ]);

  if (purchasesF.data.some((p) => p.id === purchaseId)) return purchasesF.data.find((p) => p.id === purchaseId);
  if (!Array.isArray(input.items) || !input.items.length) throw new Error("اقلام خرید نمی‌تواند خالی باشد");
  if (input.paymentMethod === "CHECK" && (!input.check?.number || !input.check?.bank || !input.check?.dueDate || !normalizeJalali(input.check.dueDate))) {
    throw new Error("اطلاعات چک یا تاریخ جلالی ناقص است");
  }

  const items: PurchaseItem[] = [];
  let subtotal = 0;
  for (const line of input.items) {
    const p = productsF.data.find((x) => x.id === line.productId);
    if (!p) throw new Error("PRODUCT_NOT_FOUND");
    const q = Number(line.quantity);
    const cost = Number(line.unitCost);
    if (!Number.isFinite(q) || q <= 0) throw new Error("INVALID_QUANTITY");
    if (!Number.isFinite(cost) || cost < 0) throw new Error("INVALID_COST");
    const total = q * cost;
    subtotal += total;
    items.push({ id: crypto.randomUUID(), purchaseId, productId: p.id, quantity: q, unitCost: cost, total });
  }

  let checkId: string | null = null;
  let checks = checksF.data;
  if (input.paymentMethod === "CHECK" && input.check) {
    checkId = crypto.randomUUID();
    checks = [...checks, {
      id: checkId, number: input.check.number, bank: input.check.bank, dueDate: normalizeJalali(input.check.dueDate)!,
      amount: subtotal, direction: "ISSUED", status: "PENDING",
      relatedName: input.supplierName || "", purchaseId, description: `بابت خرید ${purchaseId}`,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }];
  }

  const purchase: Purchase = {
    id: purchaseId, supplierId: input.supplierId || null, supplierName: input.supplierName || "",
    subtotal, paymentMethod: input.paymentMethod, checkId, createdAt: new Date().toISOString()
  };

  const inventory = [...invF.data];
  for (const line of items) {
    const row = inventory.find((x) => x.productId === line.productId);
    if (row) { row.quantity = Number(row.quantity) + line.quantity; row.updatedAt = new Date().toISOString(); }
    else inventory.push({ id: crypto.randomUUID(), productId: line.productId, quantity: line.quantity, updatedAt: new Date().toISOString() });
  }
  const products = productsF.data.map((p) => {
    const i = items.find((x) => x.productId === p.id);
    return i ? { ...p, stock: Number(p.stock) + i.quantity, purchaseCost: i.unitCost, updatedAt: new Date().toISOString() } : p;
  });
  const finance = [...finF.data, { id: crypto.randomUUID(), type: "PURCHASE" as const, referenceId: purchaseId, amount: subtotal, createdAt: new Date().toISOString() }];
  const log = { id: crypto.randomUUID(), action: "PURCHASE_CREATED", entityId: purchaseId, createdAt: new Date().toISOString() };

  await batchCommit([
    { path: "purchases.json", data: [...purchasesF.data, purchase], message: `Create purchase ${purchaseId}` },
    { path: "purchase-items.json", data: [...itemsF.data, ...items], message: `Create purchase items ${purchaseId}` },
    { path: "products.json", data: products, message: `Increase stock ${purchaseId}` },
    { path: "inventory.json", data: inventory, message: `Inventory movement ${purchaseId}` },
    { path: "finance.json", data: finance, message: `Finance purchase ${purchaseId}` },
    { path: "checks.json", data: checks, message: `Check for purchase ${purchaseId}` },
    { path: "activity-logs.json", data: [...logsF.data, log], message: `Audit purchase ${purchaseId}` }
  ]);
  return purchase;
}
