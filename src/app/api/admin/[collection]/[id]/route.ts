import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson, writeJson } from "@/lib/github";
import { normalizeProduct } from "@/lib/data";
import type { Product } from "@/lib/types";
import { audit } from "@/lib/audit";

const allowed = new Set([
  "products",
  "customers",
  "suppliers",
  "sales",
  "sale-items",
  "purchases",
  "purchase-items",
  "inventory",
  "finance",
  "checks",
  "quotations",
  "expenses",
  "incomes",
  "brands",
  "categories",
  "settings",
  "activity-logs",
  "coupons",
  "reviews",
  "questions",
  "returns",
  "shipping-methods",
  "banners",
  "articles",
  "notifications",
]);

const perms: Record<string, string> = {
  products: "products",
  customers: "customers",
  suppliers: "suppliers",
  sales: "sales",
  "sale-items": "sales",
  purchases: "purchases",
  "purchase-items": "purchases",
  inventory: "inventory",
  finance: "finance",
  checks: "finance",
  quotations: "sales",
  expenses: "finance",
  incomes: "finance",
  brands: "products",
  categories: "products",
  settings: "settings",
  "activity-logs": "settings",
  coupons: "sales",
  reviews: "products",
  questions: "products",
  returns: "sales",
  "shipping-methods": "settings",
  banners: "settings",
  articles: "settings",
  notifications: "settings",
};

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      collection: string;
    }>;
  },
) {
  try {
    const { collection } = await params;

    if (!allowed.has(collection)) {
      throw new Error("NOT_FOUND");
    }

    await requirePermission(`${perms[collection]}.read`);

    const file = await getJson<Record<string, unknown>[]>(`${collection}.json`, []);

    const data =
      collection === "products"
        ? file.data.map((item) => normalizeProduct(item as Product))
        : file.data;

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ collection: string; id: string }>;
  },
) {
  try {
    const { collection, id } = await params;
    if (!allowed.has(collection)) throw new Error("NOT_FOUND");
    await requirePermission(`${perms[collection]}.update`);

    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("VALIDATION_ERROR");
    }

    const file = await getJson<Record<string, unknown>[]>(`${collection}.json`, []);
    const index = file.data.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("NOT_FOUND");

    const now = new Date().toISOString();
    const current = file.data[index];
    const updated = {
      ...current,
      ...body,
      id,
      createdAt: current.createdAt || now,
      updatedAt: now,
    };

    const normalized =
      collection === "products" ? normalizeProduct(updated as Product) : updated;

    const next = file.data.map((item, itemIndex) =>
      itemIndex === index ? normalized : item,
    );

    await writeJson(
      `${collection}.json`,
      next,
      `Update ${collection}/${id}`,
      file.sha || undefined,
    );

    await audit("ADMIN_ENTITY_UPDATED", {
      entityType: collection,
      entityId: id,
    });

    return ok(normalized);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ collection: string; id: string }>;
  },
) {
  try {
    const { collection, id } = await params;
    if (!allowed.has(collection)) throw new Error("NOT_FOUND");
    await requirePermission(`${perms[collection]}.delete`);

    const file = await getJson<Record<string, unknown>[]>(`${collection}.json`, []);
    if (!file.data.some((item) => item.id === id)) throw new Error("NOT_FOUND");

    const next = file.data.filter((item) => item.id !== id);
    await writeJson(
      `${collection}.json`,
      next,
      `Delete ${collection}/${id}`,
      file.sha || undefined,
    );

    await audit("ADMIN_ENTITY_DELETED", {
      entityType: collection,
      entityId: id,
    });

    return ok({ id, deleted: true });
  } catch (error) {
    return fail(error);
  }
}
