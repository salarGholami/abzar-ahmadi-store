import "server-only";
import { getJson, withConflictRetry, batchCommit } from "./github";
import { requirePermission } from "./permissions";
import { audit } from "./audit";
import { assertTransition, orderStatusFromPayment } from "./order-state";
import type { OrderEvent, OrderStatus, Sale } from "./types";

export async function transitionOrder(orderId: string, to: OrderStatus, reason?: string) {
  const session = await requirePermission("orders.update");
  const result = await withConflictRetry(async () => {
    const f = await getJson<Sale[]>("sales.json", []);
    const index = f.data.findIndex(x => x.id === orderId);
    if (index < 0) throw new Error("NOT_FOUND");
    const current = f.data[index];
    const from = (current.orderStatus ?? orderStatusFromPayment(String(current.paymentStatus))) as OrderStatus;
    assertTransition(from, to);
    if (from === to) return current;
    const timestamp = new Date().toISOString();
    const updated: Sale = { ...current, orderStatus: to, updatedAt: timestamp };
    const event: OrderEvent = { id: crypto.randomUUID(), orderId, from, to, actorId: session.id, actorRole: session.role, reason: reason?.trim().slice(0, 500) || null, createdAt: timestamp };
    const events = await getJson<OrderEvent[]>("order-events.json", []);
    const next = [...f.data]; next[index] = updated;
    await batchCommit([
      { path: "sales.json", data: next, message: `Order ${orderId}: ${from} -> ${to}`, expectedSha: f.sha || undefined },
      { path: "order-events.json", data: [...events.data.slice(-9999), event], message: `Order event ${orderId}` },
    ]);
    return updated;
  });
  await audit("ORDER_STATUS_CHANGED", { entityType: "ORDER", entityId: orderId, metadata: { to, reason: reason ?? null } });
  return result;
}

export async function getOrderTimeline(orderId: string) {
  const f = await getJson<OrderEvent[]>("order-events.json", []);
  return f.data.filter(x => x.orderId === orderId).sort((a,b) => a.createdAt.localeCompare(b.createdAt));
}
