import "server-only";
import { getJson, withConflictRetry, batchCommit } from "./github";
import type { InventoryReservation, InventoryReservationStatus, Product, SaleItem } from "./types";

const TTL_MS = 30 * 60 * 1000;
const now = () => new Date().toISOString();

export async function reserveInventory(orderId: string, items: SaleItem[], ttlMs = TTL_MS) {
  return withConflictRetry(async () => {
    const [productsF, reservationsF] = await Promise.all([
      getJson<Product[]>("products.json", []),
      getJson<InventoryReservation[]>("inventory-reservations.json", []),
    ]);
    const active = reservationsF.data.filter(r => r.status === "ACTIVE" && new Date(r.expiresAt).getTime() > Date.now());
    for (const line of items) {
      const product = productsF.data.find(p => p.id === line.productId);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      const reserved = active.filter(r => r.productId === line.productId).reduce((sum, r) => sum + r.quantity, 0);
      if (Number(product.stock) - reserved < line.quantity) throw new Error(`موجودی ${product.title} کافی نیست`);
    }
    const created = items.map(line => ({
      id: crypto.randomUUID(), orderId, productId: line.productId, quantity: line.quantity,
      status: "ACTIVE" as const, expiresAt: new Date(Date.now() + ttlMs).toISOString(), createdAt: now(), updatedAt: now(),
    }));
    await batchCommit([{ path: "inventory-reservations.json", data: [...reservationsF.data, ...created], message: `Reserve inventory ${orderId}`, expectedSha: reservationsF.sha || undefined }]);
    return created;
  });
}

export async function consumeReservations(orderId: string) {
  return withConflictRetry(async () => {
    const [reservationsF, productsF, inventoryF] = await Promise.all([
      getJson<InventoryReservation[]>("inventory-reservations.json", []),
      getJson<Product[]>("products.json", []),
      getJson<import("./types").InventoryMovement[]>("inventory.json", []),
    ]);
    const rows = reservationsF.data.filter(r => r.orderId === orderId && r.status === "ACTIVE");
    if (!rows.length) return false;
    const timestamp = now();
    let products = [...productsF.data];
    let inventory = [...inventoryF.data];
    for (const row of rows) {
      const p = products.find(x => x.id === row.productId);
      if (!p || Number(p.stock) < row.quantity) throw new Error("INVENTORY_UNAVAILABLE");
      products = products.map(x => x.id === row.productId ? { ...x, stock: Number(x.stock) - row.quantity, updatedAt: timestamp } : x);
      const i = inventory.findIndex(x => x.productId === row.productId);
      if (i >= 0) inventory[i] = { ...inventory[i], quantity: Number(inventory[i].quantity) - row.quantity, reason: `RESERVATION_CONSUMED:${orderId}`, updatedAt: timestamp };
      else inventory.push({ id: crypto.randomUUID(), productId: row.productId, quantity: -row.quantity, reason: `RESERVATION_CONSUMED:${orderId}`, updatedAt: timestamp });
    }
    const reservations = reservationsF.data.map(r => r.orderId === orderId && r.status === "ACTIVE" ? { ...r, status: "CONSUMED" as const, updatedAt: timestamp } : r);
    await batchCommit([
      { path: "products.json", data: products, message: `Consume reservation ${orderId}`, expectedSha: productsF.sha || undefined },
      { path: "inventory.json", data: inventory, message: `Consume inventory ${orderId}`, expectedSha: inventoryF.sha || undefined },
      { path: "inventory-reservations.json", data: reservations, message: `Consume reservations ${orderId}`, expectedSha: reservationsF.sha || undefined },
    ]);
    return true;
  });
}

export async function releaseReservations(orderId: string, status: InventoryReservationStatus = "RELEASED") {
  const result = await withConflictRetry(async () => {
    const reservationsF = await getJson<InventoryReservation[]>("inventory-reservations.json", []);
    const timestamp = now();
    const reservations = reservationsF.data.map(r => r.orderId === orderId && r.status === "ACTIVE" ? { ...r, status, updatedAt: timestamp } : r);
    await batchCommit([{ path: "inventory-reservations.json", data: reservations, message: `Release reservations ${orderId}`, expectedSha: reservationsF.sha || undefined }]);
    return reservations.some((r, i) => r !== reservationsF.data[i] && r.orderId === orderId);
  });
  return result;
}

export async function expireReservations() {
  return withConflictRetry(async () => {
    const f = await getJson<InventoryReservation[]>("inventory-reservations.json", []);
    const timestamp = now();
    let changed = 0;
    const next = f.data.map(r => {
      if (r.status === "ACTIVE" && new Date(r.expiresAt).getTime() <= Date.now()) { changed++; return { ...r, status: "EXPIRED" as const, updatedAt: timestamp }; }
      return r;
    });
    if (changed) await batchCommit([{ path: "inventory-reservations.json", data: next, message: "Expire inventory reservations", expectedSha: f.sha || undefined }]);
    return changed;
  });
}
