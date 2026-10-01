import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson, writeJson } from "@/lib/github";
import { deleteMedia } from "@/lib/media";
import type { Product } from "@/lib/types";
import { audit } from "@/lib/audit";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function toNumber(value: unknown, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    await requirePermission("products.read");

    const { id } = await params;
    const result = await getJson<Product[]>("products.json", []);
    const products = Array.isArray(result.data) ? result.data : [];
    const product = products.find((item) => item.id === id);

    if (!product) throw new Error("NOT_FOUND");

    return ok(product);
  } catch (error) {
    console.error("[GET /api/admin/products/:id]", error);
    return fail(error);
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    await requirePermission("products.update");

    const { id } = await params;
    const body = (await req.json()) as Partial<Product>;
    const result = await getJson<Product[]>("products.json", []);
    const products = Array.isArray(result.data) ? result.data : [];

    const current = products.find((item) => item.id === id);
    if (!current) throw new Error("NOT_FOUND");

    const title =
      body.title !== undefined ? String(body.title).trim() : current.title;

    const sku = body.sku !== undefined ? String(body.sku).trim() : current.sku;

    if (!title) throw new Error("نام محصول الزامی است.");
    if (!sku) throw new Error("SKU محصول الزامی است.");

    const duplicate = products.some(
      (item) =>
        item.id !== id && item.sku.trim().toLowerCase() === sku.toLowerCase(),
    );

    if (duplicate) {
      throw new Error("این SKU قبلاً برای محصول دیگری ثبت شده است.");
    }

    const price =
      body.price !== undefined ? toNumber(body.price, NaN) : current.price;

    const discount =
      body.discount !== undefined
        ? toNumber(body.discount, NaN)
        : current.discount;

    const stock =
      body.stock !== undefined ? toNumber(body.stock, NaN) : current.stock;

    const purchaseCost =
      body.purchaseCost !== undefined
        ? toNumber(body.purchaseCost, NaN)
        : (current.purchaseCost ?? 0);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error("قیمت محصول معتبر نیست.");
    }
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      throw new Error("درصد تخفیف باید بین صفر تا صد باشد.");
    }
    if (!Number.isFinite(stock) || stock < 0) {
      throw new Error("موجودی محصول معتبر نیست.");
    }
    if (!Number.isFinite(purchaseCost) || purchaseCost < 0) {
      throw new Error("قیمت خرید محصول معتبر نیست.");
    }

    const updated: Product = {
      ...current,
      title,
      sku,
      brand:
        body.brand !== undefined ? String(body.brand).trim() : current.brand,
      category:
        body.category !== undefined
          ? String(body.category).trim()
          : current.category,
      price,
      discount,
      stock,
      image:
        body.image !== undefined ? String(body.image).trim() : current.image,
      purchaseCost,
      description:
        body.description !== undefined
          ? String(body.description).trim()
          : current.description,
      supplierIds:
        body.supplierIds !== undefined
          ? Array.isArray(body.supplierIds)
            ? body.supplierIds.map(String)
            : []
          : current.supplierIds,
      specs:
        body.specs !== undefined
          ? Array.isArray(body.specs)
            ? body.specs
            : []
          : current.specs,
      rating:
        body.rating !== undefined
          ? toNumber(body.rating, current.rating ?? 0)
          : current.rating,
      reviewCount:
        body.reviewCount !== undefined
          ? toNumber(body.reviewCount, current.reviewCount ?? 0)
          : current.reviewCount,
      images:
        body.images !== undefined
          ? Array.isArray(body.images)
            ? body.images
            : []
          : current.images,
      updatedAt: new Date().toISOString(),
    };

    // اگر آرایه تصاویر در درخواست ارسال شده، تصویر اصلی را هماهنگ کن.
    if (body.images !== undefined) {
      updated.image = updated.images?.[0]?.url ?? "";
    }

    const next = products.map((item) => (item.id === id ? updated : item));

    await writeJson(
      "products.json",
      next,
      `Update product ${id}`,
      result.sha || undefined,
    );

    await audit("ADMIN_PRODUCT_UPDATED", {
      entityType: "products",
      entityId: id,
    });

    return ok(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/products/:id]", error);
    return fail(error);
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    await requirePermission("products.delete");

    const { id } = await params;
    const result = await getJson<Product[]>("products.json", []);
    const products = Array.isArray(result.data) ? result.data : [];
    const product = products.find((item) => item.id === id);

    if (!product) throw new Error("NOT_FOUND");

    const next = products.filter((item) => item.id !== id);

    // ابتدا حذف محصول از داده‌های اصلی ثبت می‌شود.
    await writeJson(
      "products.json",
      next,
      `Delete product ${id}`,
      result.sha || undefined,
    );

    // خطای حذف فایل رسانه‌ای نباید حذف موفق محصول را برگرداند.
    const mediaPaths = (product.images ?? [])
      .map((image) => image.path)
      .filter((path): path is string => Boolean(path));

    await Promise.allSettled(mediaPaths.map((path) => deleteMedia(path)));

    await audit("ADMIN_PRODUCT_DELETED", {
      entityType: "products",
      entityId: id,
    });

    return ok({ id, deleted: true });
  } catch (error) {
    console.error("[DELETE /api/admin/products/:id]", error);
    return fail(error);
  }
}
