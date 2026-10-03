import "server-only";

import { getJson } from "@/lib/github";
import type { Customer, FinanceEntry, InventoryMovement, Product, Sale, SaleItem, InventoryReservation, SupportTicket, ReturnRequest } from "@/lib/types";

export type IntegrityIssue = {
  code: string;
  entityId?: string;
  message: string;
};

export async function runDataIntegrityCheck(): Promise<IntegrityIssue[]> {
  const [products, inventory, sales, saleItems, finance, customers, reservations, tickets, returns] = await Promise.all([
    getJson<Product[]>("products.json", []),
    getJson<InventoryMovement[]>("inventory.json", []),
    getJson<Sale[]>("sales.json", []),
    getJson<SaleItem[]>("sale-items.json", []),
    getJson<FinanceEntry[]>("finance.json", []),
    getJson<Customer[]>("customers.json", []),
    getJson<InventoryReservation[]>("inventory-reservations.json", []),
    getJson<SupportTicket[]>("support-tickets.json", []),
    getJson<ReturnRequest[]>("returns.json", []),
  ]);

  const issues: IntegrityIssue[] = [];
  const productIds = new Set(products.data.map((p) => p.id));
  const saleIds = new Set(sales.data.map((s) => s.id));
  const customerIds = new Set(customers.data.map((c) => c.id));

  for (const row of inventory.data) {
    if (!productIds.has(row.productId)) issues.push({ code: "ORPHAN_INVENTORY", entityId: row.id, message: `Inventory references missing product ${row.productId}` });
  }
  for (const item of saleItems.data) {
    if (!saleIds.has(item.saleId)) issues.push({ code: "ORPHAN_SALE_ITEM", entityId: item.id, message: `Sale item references missing sale ${item.saleId}` });
    if (!productIds.has(item.productId)) issues.push({ code: "ORPHAN_SALE_PRODUCT", entityId: item.id, message: `Sale item references missing product ${item.productId}` });
  }
  for (const sale of sales.data) {
    if (sale.customerId && !customerIds.has(sale.customerId)) issues.push({ code: "ORPHAN_CUSTOMER", entityId: sale.id, message: `Sale references missing customer ${sale.customerId}` });
    const items = saleItems.data.filter((item) => item.saleId === sale.id);
    const calculated = items.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const expectedSubtotal = Number(sale.subtotal || 0);
    if (Math.abs(calculated - expectedSubtotal) > 1) issues.push({ code: "SALE_TOTAL_MISMATCH", entityId: sale.id, message: `Sale subtotal ${expectedSubtotal} differs from item total ${calculated}` });
  }

  const reservationOrderIds = new Set(sales.data.map(s => s.id));
  for (const reservation of reservations.data) {
    if (!reservationOrderIds.has(reservation.orderId)) issues.push({ code: "ORPHAN_RESERVATION", entityId: reservation.id, message: `Reservation references missing order ${reservation.orderId}` });
    if (reservation.quantity <= 0) issues.push({ code: "INVALID_RESERVATION", entityId: reservation.id, message: "Reservation quantity must be positive" });
  }
  for (const ticket of tickets.data) {
    if (!ticket.userId) issues.push({ code: "INVALID_SUPPORT_OWNER", entityId: ticket.id, message: "Support ticket has no owner" });
  }
  for (const request of returns.data) {
    if (!saleIds.has(request.saleId)) issues.push({ code: "ORPHAN_RETURN", entityId: request.id, message: `Return references missing sale ${request.saleId}` });
  }

  for (const entry of finance.data) {
    if (entry.type === "SALE" && entry.referenceId && !saleIds.has(entry.referenceId)) issues.push({ code: "ORPHAN_FINANCE", entityId: entry.id, message: `Finance entry references missing sale ${entry.referenceId}` });
  }

  return issues;
}
