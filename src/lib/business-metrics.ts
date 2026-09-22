import "server-only";
import { getJson } from "./github";
import type { Product, Sale, SaleItem, Customer, InventoryReservation, ReturnRequest } from "./types";

export async function getBusinessMetrics() {
  const [sales, items, products, customers, reservations, returns] = await Promise.all([
    getJson<Sale[]>("sales.json", []), getJson<SaleItem[]>("sale-items.json", []), getJson<Product[]>("products.json", []),
    getJson<Customer[]>("customers.json", []), getJson<InventoryReservation[]>("inventory-reservations.json", []), getJson<ReturnRequest[]>("returns.json", []),
  ]);
  const paid = sales.data.filter(s => s.paymentStatus === "PAID");
  const revenue = paid.reduce((sum,s)=>sum+Number(s.netAmount||0),0);
  const grossProfit = paid.reduce((sum,s)=>sum+Number(s.grossProfit||0),0);
  const orders = sales.data.length;
  const averageOrderValue = paid.length ? Math.round(revenue / paid.length) : 0;
  const lowStock = products.data.filter(p => Number(p.stock) <= 3).length;
  const inventoryValue = products.data.reduce((sum,p)=>sum + Number(p.stock||0)*Number(p.purchaseCost||0),0);
  const activeReservations = reservations.data.filter(r=>r.status==="ACTIVE" && new Date(r.expiresAt).getTime()>Date.now()).reduce((sum,r)=>sum+r.quantity,0);
  const returnRate = orders ? Number(((returns.data.length / orders) * 100).toFixed(1)) : 0;
  const top = new Map<string, number>();
  for (const item of items.data) top.set(item.productId,(top.get(item.productId)||0)+item.quantity);
  const topProducts = [...top.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([productId,quantity])=>({productId,quantity}));
  return { revenue, grossProfit, orders, paidOrders: paid.length, averageOrderValue, lowStock, inventoryValue, activeReservations, returnRate, customerCount: customers.data.length, topProducts };
}
