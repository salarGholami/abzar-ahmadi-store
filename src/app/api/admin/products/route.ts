import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson, writeJson } from "@/lib/github";
import type { Product } from "@/lib/types";
import { audit } from "@/lib/audit";

function toNumber(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export async function GET() {
  try {
    await requirePermission("products.read");

    const result = await getJson<Product[]>("products.json", []);

    if (!Array.isArray(result.data)) {
      throw new Error("ساختار فایل محصولات در GitHub معتبر نیست.");
    }

    return ok(result.data);
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return fail(error);
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission("products.create");

    const body = (await req.json()) as Partial<Product>;
    const result = await getJson<Product[]>("products.json", []);
    const products = Array.isArray(result.data) ? result.data : [];

    const title = String(body.title ?? "").trim();
    const sku = String(body.sku ?? "").trim();
    const price = toNumber(body.price, NaN);
    const discount = toNumber(body.discount, 0);
    const stock = toNumber(body.stock, 0);
    const purchaseCost = toNumber(body.purchaseCost, 0);

    if (!title) throw new Error("نام محصول الزامی است.");
    if (!sku) throw new Error("SKU محصول الزامی است.");
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("قیمت محصول معتبر نیست.");
    }
    if (discount < 0 || discount > 100) {
      throw new Error("درصد تخفیف باید بین صفر تا صد باشد.");
    }
    if (stock < 0) throw new Error("موجودی نمی‌تواند منفی باشد.");
    if (purchaseCost < 0) {
      throw new Error("قیمت خرید نمی‌تواند منفی باشد.");
    }

    const duplicate = products.some(
      (product) => product.sku.trim().toLowerCase() === sku.toLowerCase(),
    );

    if (duplicate) {
      throw new Error("این SKU قبلاً ثبت شده است.");
    }

    const now = new Date().toISOString();

    const product: Product = {
      id: crypto.randomUUID(),
      title,
      brand: String(body.brand ?? "").trim(),
      sku,
      category: String(body.category ?? "").trim(),
      price,
      discount,
      stock,
      image: String(body.image ?? "").trim(),
      images: Array.isArray(body.images) ? body.images : [],
      supplierIds: Array.isArray(body.supplierIds)
        ? body.supplierIds.map(String)
        : [],
      purchaseCost,
      description: String(body.description ?? "").trim(),
      specs: Array.isArray(body.specs) ? body.specs : [],
      rating: toNumber(body.rating, 0),
      reviewCount: toNumber(body.reviewCount, 0),
      createdAt: now,
      updatedAt: now,
    };

    const next = [...products, product];

    await writeJson(
      "products.json",
      next,
      `Create product ${product.id}`,
      result.sha || undefined,
    );

    await audit("ADMIN_PRODUCT_CREATED", {
      entityType: "products",
      entityId: product.id,
    });

    return ok(product, 201);
  } catch (error) {
    console.error("[POST /api/admin/products]", error);
    return fail(error);
  }
}
