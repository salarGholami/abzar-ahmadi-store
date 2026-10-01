import "server-only";

import { getSession } from "./auth";
import { batchCommit, getJson, withConflictRetry } from "./github";
import { orderStatusFromPayment, assertTransition } from "./order-state";
import type {
  FinanceEntry,
  InventoryMovement,
  OrderEvent,
  OrderStatus,
  Product,
  Refund,
  RefundMethod,
  ReturnRequest,
  Sale,
  SaleItem,
} from "./types";

type ReturnInput = {
  saleId: string;
  reason: string;
  items: { productId: string; quantity: number }[];
};

type RefundMethodInput = RefundMethod | "ORIGINAL_METHOD";

type LogRow = { id: string; action: string; entityId?: string; createdAt: string };

const now = () => new Date().toISOString();

/** A return can only hold items from sales that were actually handed to the customer. */
const RETURNABLE_STATUSES: readonly OrderStatus[] = ["SHIPPED", "DELIVERED"];

const ACTIVE_RETURN_STATUSES: readonly ReturnRequest["status"][] = ["REQUESTED", "APPROVED", "RECEIVED"];

function normalizeMethod(method: RefundMethodInput): RefundMethod {
  return method === "ORIGINAL_METHOD" ? "ORIGINAL_PAYMENT" : method;
}

function currentOrderStatus(sale: Sale): OrderStatus {
  return (sale.orderStatus ?? orderStatusFromPayment(String(sale.paymentStatus))) as OrderStatus;
}

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  if (session.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
}

function orderEvent(
  sale: Sale,
  to: OrderStatus,
  actor: { id: string; role: OrderEvent["actorRole"] },
  reason: string | null,
  metadata: Record<string, unknown>,
): OrderEvent {
  return {
    id: crypto.randomUUID(),
    orderId: sale.id,
    from: currentOrderStatus(sale),
    to,
    actorId: actor.id,
    actorRole: actor.role,
    reason,
    metadata,
    createdAt: now(),
  };
}

/** Loads every file a return transition may touch, always fresh (used inside withConflictRetry). */
async function loadState() {
  const [returnsF, salesF, itemsF, refundsF, eventsF, logsF] = await Promise.all([
    getJson<ReturnRequest[]>("returns.json", [], { cache: false }),
    getJson<Sale[]>("sales.json", [], { cache: false }),
    getJson<SaleItem[]>("sale-items.json", [], { cache: false }),
    getJson<Refund[]>("refunds.json", [], { cache: false }),
    getJson<OrderEvent[]>("order-events.json", [], { cache: false }),
    getJson<LogRow[]>("activity-logs.json", [], { cache: false }),
  ]);
  return { returnsF, salesF, itemsF, refundsF, eventsF, logsF };
}

function findReturn(returns: ReturnRequest[], id: string) {
  const request = returns.find((row) => row.id === id);
  if (!request) throw new Error("NOT_FOUND");
  return request;
}

function findSale(sales: Sale[], id: string) {
  const sale = sales.find((row) => row.id === id);
  if (!sale) throw new Error("NOT_FOUND");
  return sale;
}

export async function requestReturn(input: ReturnInput): Promise<ReturnRequest> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");

  return withConflictRetry(async () => {
    const { returnsF, salesF, itemsF, eventsF, logsF } = await loadState();
    const sale = findSale(salesF.data, input.saleId);

    if (session.role !== "ADMIN" && sale.customerUserId !== session.id) throw new Error("FORBIDDEN");

    const status = currentOrderStatus(sale);
    if (!RETURNABLE_STATUSES.includes(status)) throw new Error("INVALID_ORDER_TRANSITION");
    assertTransition(status, "RETURN_REQUESTED");

    const hasActive = returnsF.data.some(
      (row) => row.saleId === sale.id && ACTIVE_RETURN_STATUSES.includes(row.status),
    );
    if (hasActive) throw new Error("RETURN_ALREADY_REQUESTED");

    const sold = new Map<string, number>();
    for (const item of itemsF.data.filter((row) => row.saleId === sale.id)) {
      sold.set(item.productId, (sold.get(item.productId) ?? 0) + Number(item.quantity));
    }

    const requested = new Map<string, number>();
    for (const line of input.items) {
      requested.set(line.productId, (requested.get(line.productId) ?? 0) + line.quantity);
    }
    for (const [productId, quantity] of requested) {
      if (quantity > (sold.get(productId) ?? 0)) throw new Error("INVALID_RETURN_QUANTITY");
    }

    const timestamp = now();
    const request: ReturnRequest = {
      id: crypto.randomUUID(),
      saleId: sale.id,
      userId: session.id,
      reason: input.reason,
      status: "REQUESTED",
      items: [...requested].map(([productId, quantity]) => ({ productId, quantity })),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const event = orderEvent(sale, "RETURN_REQUESTED", session, input.reason, { returnId: request.id });
    const sales = salesF.data.map((row) =>
      row.id === sale.id ? { ...row, orderStatus: "RETURN_REQUESTED" as const, updatedAt: timestamp } : row,
    );

    await batchCommit([
      { path: "returns.json", data: [...returnsF.data, request], message: `Return requested ${request.id}` },
      { path: "sales.json", data: sales, message: `Order return requested ${sale.id}` },
      { path: "order-events.json", data: [...eventsF.data, event], message: `Order event ${event.id}` },
      {
        path: "activity-logs.json",
        data: [...logsF.data.slice(-4999), { id: crypto.randomUUID(), action: "RETURN_REQUESTED", entityId: request.id, createdAt: timestamp }],
        message: `Audit return ${request.id}`,
      },
    ]);

    return request;
  });
}

export async function approveReturn(id: string, amount: number, method: RefundMethodInput = "MANUAL_TRANSFER") {
  const admin = await requireAdmin();

  return withConflictRetry(async () => {
    const { returnsF, salesF, refundsF, logsF } = await loadState();
    const request = findReturn(returnsF.data, id);
    const sale = findSale(salesF.data, request.saleId);

    if (request.status !== "REQUESTED") throw new Error("INVALID_RETURN_STATE");
    if (!Number.isFinite(amount) || amount < 0 || amount > Number(sale.netAmount)) throw new Error("INVALID_REFUND_AMOUNT");

    const timestamp = now();
    const updated: ReturnRequest = { ...request, status: "APPROVED", updatedAt: timestamp };
    const refund: Refund = {
      id: crypto.randomUUID(),
      orderId: sale.id,
      returnId: request.id,
      amount,
      reason: request.reason,
      status: "APPROVED",
      method: normalizeMethod(method),
      approvedBy: admin.id,
      referenceId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await batchCommit([
      { path: "returns.json", data: returnsF.data.map((row) => (row.id === id ? updated : row)), message: `Return approved ${id}` },
      { path: "refunds.json", data: [...refundsF.data, refund], message: `Refund approved ${refund.id}` },
      {
        path: "activity-logs.json",
        data: [...logsF.data.slice(-4999), { id: crypto.randomUUID(), action: "RETURN_APPROVED", entityId: id, createdAt: timestamp }],
        message: `Audit return ${id}`,
      },
    ]);

    return updated;
  });
}

export async function receiveReturn(id: string) {
  const admin = await requireAdmin();

  return withConflictRetry(async () => {
    const { returnsF, salesF, itemsF, eventsF, logsF } = await loadState();
    const [productsF, inventoryF] = await Promise.all([
      getJson<Product[]>("products.json", [], { cache: false }),
      getJson<InventoryMovement[]>("inventory.json", [], { cache: false }),
    ]);

    const request = findReturn(returnsF.data, id);
    const sale = findSale(salesF.data, request.saleId);
    if (request.status !== "APPROVED") throw new Error("INVALID_RETURN_STATE");

    const timestamp = now();
    const lines =
      request.items && request.items.length
        ? request.items
        : itemsF.data
            .filter((row) => row.saleId === sale.id)
            .map((row) => ({ productId: row.productId, quantity: Number(row.quantity) }));

    const products = productsF.data.map((product) => {
      const quantity = lines.filter((line) => line.productId === product.id).reduce((sum, line) => sum + line.quantity, 0);
      return quantity ? { ...product, stock: Number(product.stock) + quantity, updatedAt: timestamp } : product;
    });

    const inventory = [...inventoryF.data];
    for (const line of lines) {
      const index = inventory.findIndex((row) => row.productId === line.productId);
      if (index >= 0) {
        inventory[index] = { ...inventory[index], quantity: Number(inventory[index].quantity) + line.quantity, updatedAt: timestamp };
      } else {
        inventory.push({ id: crypto.randomUUID(), productId: line.productId, quantity: line.quantity, reason: `RETURN:${request.id}`, updatedAt: timestamp });
      }
    }

    const from = currentOrderStatus(sale);
    assertTransition(from, "RETURNED");
    const event = orderEvent(sale, "RETURNED", admin, request.reason, { returnId: request.id });
    const updated: ReturnRequest = { ...request, status: "RECEIVED", updatedAt: timestamp };

    await batchCommit([
      { path: "returns.json", data: returnsF.data.map((row) => (row.id === id ? updated : row)), message: `Return received ${id}` },
      {
        path: "sales.json",
        data: salesF.data.map((row) => (row.id === sale.id ? { ...row, orderStatus: "RETURNED" as const, updatedAt: timestamp } : row)),
        message: `Order returned ${sale.id}`,
      },
      { path: "products.json", data: products, message: `Restock return ${id}` },
      { path: "inventory.json", data: inventory, message: `Inventory return ${id}` },
      { path: "order-events.json", data: [...eventsF.data, event], message: `Order event ${event.id}` },
      {
        path: "activity-logs.json",
        data: [...logsF.data.slice(-4999), { id: crypto.randomUUID(), action: "RETURN_RECEIVED", entityId: id, createdAt: timestamp }],
        message: `Audit return ${id}`,
      },
    ]);

    return updated;
  });
}

export async function completeRefund(id: string, referenceId: string | null = null) {
  const admin = await requireAdmin();

  return withConflictRetry(async () => {
    const { returnsF, salesF, refundsF, eventsF, logsF } = await loadState();
    const financeF = await getJson<FinanceEntry[]>("finance.json", [], { cache: false });

    const request = findReturn(returnsF.data, id);
    const sale = findSale(salesF.data, request.saleId);
    if (request.status !== "RECEIVED") throw new Error("INVALID_RETURN_STATE");

    const refund = refundsF.data.find((row) => row.returnId === request.id && row.status === "APPROVED");
    if (!refund) throw new Error("NOT_FOUND");

    const timestamp = now();
    assertTransition(currentOrderStatus(sale), "REFUNDED");
    const event = orderEvent(sale, "REFUNDED", admin, request.reason, { returnId: request.id, refundId: refund.id });
    const updated: ReturnRequest = { ...request, status: "REFUNDED", updatedAt: timestamp };
    const completed: Refund = { ...refund, status: "COMPLETED", referenceId: referenceId?.trim().slice(0, 100) || null, updatedAt: timestamp };
    const entry: FinanceEntry = {
      id: crypto.randomUUID(),
      type: "REFUND",
      referenceId: sale.id,
      amount: refund.amount,
      description: `استرداد مرجوعی ${request.id.slice(0, 8)}`,
      createdAt: timestamp,
    };

    await batchCommit([
      { path: "returns.json", data: returnsF.data.map((row) => (row.id === id ? updated : row)), message: `Return refunded ${id}` },
      { path: "refunds.json", data: refundsF.data.map((row) => (row.id === refund.id ? completed : row)), message: `Refund completed ${refund.id}` },
      {
        path: "sales.json",
        data: salesF.data.map((row) => (row.id === sale.id ? { ...row, orderStatus: "REFUNDED" as const, updatedAt: timestamp } : row)),
        message: `Order refunded ${sale.id}`,
      },
      { path: "finance.json", data: [...financeF.data, entry], message: `Finance refund ${refund.id}` },
      { path: "order-events.json", data: [...eventsF.data, event], message: `Order event ${event.id}` },
      {
        path: "activity-logs.json",
        data: [...logsF.data.slice(-4999), { id: crypto.randomUUID(), action: "REFUND_COMPLETED", entityId: id, createdAt: timestamp }],
        message: `Audit refund ${refund.id}`,
      },
    ]);

    return updated;
  });
}
