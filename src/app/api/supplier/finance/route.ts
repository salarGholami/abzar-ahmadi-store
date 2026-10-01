import { ok, fail } from "@/lib/http";
import { paginate, parsePagination, matchesSearch } from "@/lib/pagination";
import { getJson } from "@/lib/github";
import { requireSupplierSession } from "@/lib/supplier-scope";
import type { Purchase } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { supplierId, supplier } = await requireSupplierSession();
    const { data: purchases } = await getJson<Purchase[]>("purchases.json", [], { cache: false });
    const mine = purchases
      .filter((p) => p.supplierId === supplierId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = mine.reduce((s, p) => s + (p.subtotal || 0), 0);
    const cash = mine.filter((p) => p.paymentMethod === "CASH").reduce((s, p) => s + (p.subtotal || 0), 0);
    const check = mine.filter((p) => p.paymentMethod === "CHECK").reduce((s, p) => s + (p.subtotal || 0), 0);
    const entries = mine.map((p) => ({
      id: p.id,
      amount: p.subtotal,
      paymentMethod: p.paymentMethod,
      checkId: p.checkId ?? null,
      createdAt: p.createdAt,
      description: `خرید #${p.id.slice(0, 8)}`,
    }));

    const url = new URL(req.url);
    const hasPagination = url.searchParams.has("page") || url.searchParams.has("pageSize");
    return ok({
      supplier,
      summary: {
        totalPurchases: mine.length,
        totalAmount: total,
        cashAmount: cash,
        checkAmount: check,
      },
      ...(hasPagination ? paginate(entries, parsePagination(url.searchParams).page, parsePagination(url.searchParams).pageSize) : { entries }),
    });
  } catch (e) {
    return fail(e);
  }
}