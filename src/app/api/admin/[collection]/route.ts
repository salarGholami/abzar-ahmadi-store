import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson, writeJson, withConflictRetry } from "@/lib/github";
import { normalizeProduct } from "@/lib/data";
import type { Product } from "@/lib/types";
import { audit } from "@/lib/audit";
import { matchesSearch, paginate, parsePagination } from "@/lib/pagination";

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
  "coupons", "reviews", "questions", "returns", "shipping-methods", "banners", "articles", "notifications",
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
  coupons: "sales", reviews: "products", questions: "products", returns: "sales", "shipping-methods": "settings", banners: "settings", articles: "settings", notifications: "settings",
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

    const file = await getJson<Record<string, unknown>[]>(`${collection}.json`, [], {
      cache: false,
    });

    const data =
      collection === "products"
        ? file.data.map((item) => normalizeProduct(item as Product))
        : file.data;

    const url = new URL(req.url);
    const hasPagination = url.searchParams.has("page") || url.searchParams.has("pageSize");
    if (!hasPagination) {
      return ok(data);
    }

    const search = url.searchParams.get("q") || "";
    const filtered = search
      ? data.filter((row) => matchesSearch(row, search))
      : data;
    const { page, pageSize } = parsePagination(url.searchParams);
    return ok(paginate(filtered, page, pageSize));
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

    const normalized = await withConflictRetry(async () => {
      const file = await getJson<Record<string, unknown>[]>(`${collection}.json`, [], { cache: false });
      const now = new Date().toISOString();
      const item = {
        ...body,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      const value =
        collection === "products" ? normalizeProduct(item as Product) : item;

      await writeJson(
        `${collection}.json`,
        [...file.data, value],
        `Create ${collection}/${item.id}`,
        file.sha || undefined,
      );
      return value;
    });

    await audit("ADMIN_ENTITY_CREATED", {
      entityType: collection,
      entityId: normalized.id,
    });

    return ok(normalized, 201);
  } catch (error) {
    return fail(error);
  }
}
