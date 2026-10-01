import "server-only";
import { getSession } from "./auth";

export const permissions = {
  ADMIN: ["*"],
  // Customers may only place orders / upload receipts. All reading of store data
  // for customers goes through dedicated, owner-scoped endpoints (e.g. /api/account/*).
  SUPPLIER: ["supplier.portal"],
  CUSTOMER: ["sales.create"]
} as const;

export async function requirePermission(permission: string) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (session.role === "ADMIN") return session;
  if (session.role === "SUPPLIER" && permission === "supplier.portal") return session;
  // Never trust permission lists stored in the cookie/user record for customers.
  if ((permissions.CUSTOMER as readonly string[]).includes(permission)) return session;
  throw new Error("FORBIDDEN");
}

export async function requireRole(...roles: string[]) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (!roles.includes(session.role)) throw new Error("FORBIDDEN");
  return session;
}
