import { ok, fail } from "@/lib/http";
import { getJson } from "@/lib/github";
import { requireSupplierSession } from "@/lib/supplier-scope";
import type { Product, Purchase, PurchaseItem } from "@/lib/types";

export async function GET() {
  try {
    const { supplierId, supplier } = await requireSupplierSession();

    const [productsFile, purchasesFile, itemsFile] = await Promise.all([
      getJson<Product[]>("products.json", []),
      getJson<Purchase[]>("purchases.json", []),
      getJson<PurchaseItem[]>("purchase-items.json", []),
    ]);

    const myProducts = productsFile.data.filter((p) => (p.supplierIds || []).includes(supplierId));
    const myPurchases = purchasesFile.data
      .filter((p) => p.supplierId === supplierId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const purchaseIds = new Set(myPurchases.map((p) => p.id));
    const myItems = itemsFile.data.filter((i) => purchaseIds.has(i.purchaseId));
    const totalPurchaseAmount = myPurchases.reduce((s, p) => s + (p.subtotal || 0), 0);
    const totalUnits = myItems.reduce((s, i) => s + (i.quantity || 0), 0);

    return ok({
      supplier,
      stats: {
        productCount: myProducts.length,
        orderCount: myPurchases.length,
        totalPurchaseAmount,
        totalUnits,
      },
      recentOrders: myPurchases.slice(0, 5).map((p) => ({
        id: p.id,
        subtotal: p.subtotal,
        paymentMethod: p.paymentMethod,
        createdAt: p.createdAt,
        itemCount: myItems.filter((i) => i.purchaseId === p.id).length,
      })),
    });
  } catch (e) {
    return fail(e);
  }
}
