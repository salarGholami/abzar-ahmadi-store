import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson, writeJson } from "@/lib/github";
import { normalizeProduct } from "@/lib/data";
import type { Product } from "@/lib/types";

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

    const file = await getJson<any[]>(`${collection}.json`, []);

    const data =
      collection === "products"
        ? file.data.map((item) => normalizeProduct(item as Product))
        : file.data;

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(
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

    await requirePermission(`${perms[collection]}.create`);

    const body = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("VALIDATION_ERROR");
    }

    const file = await getJson<any[]>(`${collection}.json`, []);

    const now = new Date().toISOString();

    const item = {
      ...body,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const normalized =
      collection === "products" ? normalizeProduct(item as Product) : item;

    await writeJson(
      `${collection}.json`,
      [...file.data, normalized],
      `Create ${collection}/${item.id}`,
      file.sha || undefined,
    );

    return ok(normalized, 201);
  } catch (error) {
    return fail(error);
  }
}
