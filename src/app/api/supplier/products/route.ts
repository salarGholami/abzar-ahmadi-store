import { ok, fail } from "@/lib/http";
import { getJson } from "@/lib/github";
import { requireSupplierSession } from "@/lib/supplier-scope";
import type { Product } from "@/lib/types";

export async function GET() {
  try {
    const { supplierId } = await requireSupplierSession();
    const { data } = await getJson<Product[]>("products.json", []);
    const list = data
      .filter((p) => (p.supplierIds || []).includes(supplierId))
      .map((p) => ({
        id: p.id,
        title: p.title,
        brand: p.brand,
        sku: p.sku,
        category: p.category,
        price: p.price,
        stock: p.stock,
        image: p.image,
        purchaseCost: p.purchaseCost ?? null,
        updatedAt: p.updatedAt ?? p.createdAt ?? null,
      }))
      .sort((a, b) => a.title.localeCompare(b.title, "fa"));
    return ok(list);
  } catch (e) {
    return fail(e);
  }
}
