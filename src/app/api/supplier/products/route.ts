import { ok, fail } from "@/lib/http";
import { paginate, parsePagination, matchesSearch } from "@/lib/pagination";
import { getJson } from "@/lib/github";
import { requireSupplierSession } from "@/lib/supplier-scope";
import type { Product } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { supplierId } = await requireSupplierSession();
    const { data } = await getJson<Product[]>("products.json", [], { cache: false });
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

    const url = new URL(req.url);
    if (!url.searchParams.has("page") && !url.searchParams.has("pageSize") && !url.searchParams.has("q")) return ok(list);
    const q = (url.searchParams.get("q") || "").trim();
    const filtered = q ? list.filter((row) => matchesSearch(row, q)) : list;
    const { page, pageSize } = parsePagination(url.searchParams);
    return ok(paginate(filtered, page, pageSize));
  } catch (e) {
    return fail(e);
  }
}