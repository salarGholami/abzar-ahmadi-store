import { ok, fail } from "@/lib/http";
import { paginate, parsePagination, matchesSearch } from "@/lib/pagination";
import { getJson } from "@/lib/github";
import { requireSupplierSession } from "@/lib/supplier-scope";
import type { Product, Purchase, PurchaseItem } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { supplierId } = await requireSupplierSession();
    const [purchasesFile, itemsFile, productsFile] = await Promise.all([
      getJson<Purchase[]>("purchases.json", [], { cache: false }),
      getJson<PurchaseItem[]>("purchase-items.json", [], { cache: false }),
      getJson<Product[]>("products.json", [], { cache: false }),
    ]);
    const productMap = new Map(productsFile.data.map((p) => [p.id, p]));
    const list = purchasesFile.data
      .filter((p) => p.supplierId === supplierId)
      .map((p) => {
        const items = itemsFile.data
          .filter((i) => i.purchaseId === p.id)
          .map((i) => {
            const product = productMap.get(i.productId);
            return {
              ...i,
              productTitle: product?.title || i.productId,
              productSku: product?.sku || null,
              productImage: product?.image || null,
            };
          });
        return {
          id: p.id,
          subtotal: p.subtotal,
          paymentMethod: p.paymentMethod,
          checkId: p.checkId ?? null,
          createdAt: p.createdAt,
          items,
          itemCount: items.length,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const url = new URL(req.url);
    if (!url.searchParams.has("page") && !url.searchParams.has("pageSize")) return ok(list);
    const q = (url.searchParams.get("q") || "").trim();
    const filtered = q ? list.filter((row) => matchesSearch(row, q)) : list;
    const { page, pageSize } = parsePagination(url.searchParams);
    return ok(paginate(filtered, page, pageSize));
  } catch (e) {
    return fail(e);
  }
}