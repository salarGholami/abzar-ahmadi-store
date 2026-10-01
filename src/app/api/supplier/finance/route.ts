import { ok, fail } from "@/lib/http";
import { getJson } from "@/lib/github";
import { requireSupplierSession } from "@/lib/supplier-scope";
import type { Purchase } from "@/lib/types";

export async function GET() {
  try {
    const { supplierId, supplier } = await requireSupplierSession();
    const { data: purchases } = await getJson<Purchase[]>("purchases.json", []);
    const mine = purchases
      .filter((p) => p.supplierId === supplierId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = mine.reduce((s, p) => s + (p.subtotal || 0), 0);
    const cash = mine.filter((p) => p.paymentMethod === "CASH").reduce((s, p) => s + (p.subtotal || 0), 0);
    const check = mine.filter((p) => p.paymentMethod === "CHECK").reduce((s, p) => s + (p.subtotal || 0), 0);

    return ok({
      supplier,
      summary: {
        totalPurchases: mine.length,
        totalAmount: total,
        cashAmount: cash,
        checkAmount: check,
      },
      entries: mine.map((p) => ({
        id: p.id,
        amount: p.subtotal,
        paymentMethod: p.paymentMethod,
        checkId: p.checkId ?? null,
        createdAt: p.createdAt,
        description: `خرید #${p.id.slice(0, 8)}`,
      })),
    });
  } catch (e) {
    return fail(e);
  }
}
