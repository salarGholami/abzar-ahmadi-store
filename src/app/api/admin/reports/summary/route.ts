import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson } from "@/lib/github";
import type { Product, Sale, SaleItem, FinanceEntry } from "@/lib/types";

export async function GET() {
  try {
    await requirePermission("reports.read");
    const [productsF, salesF, itemsF, financeF, expensesF, incomesF] = await Promise.all([
      getJson<Product[]>("products.json", []),
      getJson<Sale[]>("sales.json", []),
      getJson<SaleItem[]>("sale-items.json", []),
      getJson<FinanceEntry[]>("finance.json", []),
      getJson<{ amount: number }[]>("expenses.json", []),
      getJson<{ amount: number }[]>("incomes.json", [])
    ]);
    const products = productsF.data, sales = salesF.data, items = itemsF.data, finance = financeF.data;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const confirmedSales = sales.filter((s) => s.paymentStatus === "PAID");
    const salesThisMonth = confirmedSales.filter((s) => new Date(s.createdAt).getTime() >= monthStart);

    const totalRevenue = confirmedSales.reduce((s, x) => s + Number(x.netAmount || 0), 0);
    const totalProfit = confirmedSales.reduce((s, x) => s + Number(x.grossProfit || 0), 0);
    const revenueThisMonth = salesThisMonth.reduce((s, x) => s + Number(x.netAmount || 0), 0);

    const byDay: Record<string, number> = {};
    for (const s of confirmedSales) {
      const d = new Date(s.createdAt).toLocaleDateString("fa-IR");
      byDay[d] = (byDay[d] || 0) + Number(s.netAmount || 0);
    }
    const salesTrend = Object.entries(byDay).slice(-14).map(([date, amount]) => ({ date, amount }));

    const qtyByProduct: Record<string, number> = {};
    for (const it of items) qtyByProduct[it.productId] = (qtyByProduct[it.productId] || 0) + it.quantity;
    const topProducts = Object.entries(qtyByProduct)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([productId, qty]) => ({ title: products.find((p) => p.id === productId)?.title || productId, qty }));

    const lowStock = products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 8)
      .map((p) => ({ title: p.title, stock: p.stock, sku: p.sku }));

    const income = finance.filter((f) => ["SALE", "OTHER_INCOME"].includes(f.type)).reduce((s, f) => s + Number(f.amount || 0), 0) + incomesF.data.reduce((s, f) => s + Number(f.amount || 0), 0);
    const expense = finance.filter((f) => ["PURCHASE", "OTHER_EXPENSE"].includes(f.type)).reduce((s, f) => s + Number(f.amount || 0), 0) + expensesF.data.reduce((s, f) => s + Number(f.amount || 0), 0);

    return ok({
      totalRevenue, totalProfit, revenueThisMonth, salesCount: confirmedSales.length,
      salesTrend, topProducts, lowStock, income, expense, net: income - expense
    });
  } catch (e) { return fail(e); }
}
