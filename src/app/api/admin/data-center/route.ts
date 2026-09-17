import { ok, fail } from "@/lib/http";
import { requireRole } from "@/lib/permissions";
import { getJson } from "@/lib/github";
import type { AppUser } from "@/lib/types";

const collections = [
  "products", "categories", "brands", "customers", "suppliers", "sales", "sale-items",
  "purchases", "purchase-items", "inventory", "finance", "expenses", "incomes", "checks",
  "quotations", "quotation-items", "activity-logs", "settings"
] as const;

export async function GET() {
  try {
    await requireRole("ADMIN");

    const results = await Promise.all(
      collections.map(async (collection) => {
        const file = await getJson<Record<string, unknown>[]>(`${collection}.json`, []);
        return [collection, file.data] as const;
      })
    );

    const users = await getJson<AppUser[]>("users.json", []);
    const safeUsers = users.data.map(({ passwordHash: _passwordHash, ...user }) => user);

    return ok({
      collections: Object.fromEntries(results),
      users: safeUsers,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return fail(error);
  }
}
