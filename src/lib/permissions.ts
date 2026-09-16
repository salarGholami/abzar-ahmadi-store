import "server-only";
import { getSession } from "./auth";

export const permissions = {
  ADMIN: ["*"],
  SELLER: [
    "products.read", "customers.read", "customers.create", "customers.update",
    "sales.read", "sales.create", "sales.update",
    "quotations.create", "inventory.read"
  ],
  ACCOUNTANT: [
    "customers.read", "suppliers.read", "sales.read", "sales.update",
    "purchases.read", "finance.read", "finance.create",
    "checks.read", "checks.create", "checks.update", "reports.read"
  ],
  WAREHOUSE: [
    "products.read", "products.create", "products.update",
    "inventory.read", "inventory.adjust",
    "purchases.read", "purchases.create", "suppliers.read", "suppliers.create",
    "checks.create"
  ],
  CUSTOMER: ["products.read", "sales.read", "sales.create", "quotations.create"]
} as const;

export async function requirePermission(permission: string) {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHENTICATED");
  if (s.role === "ADMIN" || s.permissions.includes("*") || s.permissions.includes(permission)) return s;
  throw new Error("FORBIDDEN");
}

export async function requireRole(...roles: string[]) {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHENTICATED");
  if (!roles.includes(s.role)) throw new Error("FORBIDDEN");
  return s;
}
