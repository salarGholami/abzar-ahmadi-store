import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson, writeJson, batchCommit, withConflictRetry, type JsonCommit } from "@/lib/github";
import type { AppUser } from "@/lib/types";
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

    const file = await getJson<Record<string, unknown>[]>(`${collection}.json`, [], { cache: false });

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

    const updated = await withConflictRetry(async () => {
      const file = await getJson<Record<string, unknown>[]>(`${collection}.json`, [], { cache: false });
      const index = file.data.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("NOT_FOUND");

      const now = new Date().toISOString();
      const current = file.data[index];
      const merged = {
        ...current,
        ...body,
        id,
        createdAt: current.createdAt || now,
        updatedAt: now,
      };

      const normalized =
        collection === "products" ? normalizeProduct(merged as Product) : merged;

      if (collection !== "customers" && collection !== "suppliers") {
        await writeJson(
          `${collection}.json`,
          file.data.map((item, itemIndex) => itemIndex === index ? normalized : item),
          `Update ${collection}/${id}`,
          file.sha || undefined,
        );
        return normalized;
      }

      const usersFile = await getJson<AppUser[]>("users.json", [], { cache: false });
      const commits: JsonCommit[] = [{
        path: `${collection}.json`,
        data: file.data.map((item, itemIndex) => itemIndex === index ? normalized : item),
        message: `Update ${collection}/${id}`,
        expectedSha: file.sha || undefined,
      }];

      const linkedUserId =
        collection === "customers"
          ? (current.userId as string | undefined)
          : usersFile.data.find((user) => user.supplierId === id)?.id;

      if (linkedUserId) {
        commits.push({
          path: "users.json",
          data: usersFile.data.map((user) =>
            user.id === linkedUserId
              ? {
                  ...user,
                  name: String((normalized as Record<string, unknown>).name ?? user.name),
                  phone: String((normalized as Record<string, unknown>).phone ?? user.phone),
                  updatedAt: now,
                }
              : user,
          ),
          message: `Sync login profile ${collection}/${id}`,
          expectedSha: usersFile.sha || undefined,
        });
      }

      await batchCommit(commits);
      return normalized;
    });

    await audit("ADMIN_ENTITY_UPDATED", {
      entityType: collection,
      entityId: id,
    });

    return ok(updated);
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

    await withConflictRetry(async () => {
      const file = await getJson<Record<string, unknown>[]>(`${collection}.json`, [], { cache: false });
      const removed = file.data.find((item) => item.id === id);
      if (!removed) throw new Error("NOT_FOUND");

      if (collection === "customers" || collection === "suppliers") {
        const usersFile = await getJson<AppUser[]>("users.json", [], { cache: false });
        const linkedUserId =
          collection === "customers"
            ? (removed.userId as string | undefined)
            : usersFile.data.find((user) => user.supplierId === id)?.id;

        const commits: JsonCommit[] = [{
          path: `${collection}.json`,
          data: file.data.filter((item) => item.id !== id),
          message: `Delete ${collection}/${id}`,
          expectedSha: file.sha || undefined,
        }];

        if (linkedUserId) {
          commits.push({
            path: "users.json",
            data: usersFile.data.filter((user) => user.id !== linkedUserId),
            message: `Remove login for ${collection}/${id}`,
            expectedSha: usersFile.sha || undefined,
          });
        }

        await batchCommit(commits);
      } else {
        await writeJson(
          `${collection}.json`,
          file.data.filter((item) => item.id !== id),
          `Delete ${collection}/${id}`,
          file.sha || undefined,
        );
      }
    });

    await audit("ADMIN_ENTITY_DELETED", {
      entityType: collection,
      entityId: id,
    });

    return ok({ id, deleted: true });
  } catch (error) {
    return fail(error);
  }
}
