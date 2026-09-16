import "server-only";
import { getSession } from "./auth";

export const permissions = {
  ADMIN: ["*"],
  CUSTOMER: ["products.read", "sales.read", "sales.create", "quotations.create"]
} as const;

export async function requirePermission(permission: string) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (session.role === "ADMIN" || session.permissions.includes("*") || session.permissions.includes(permission)) {
    return session;
  }
  throw new Error("FORBIDDEN");
}

export async function requireRole(...roles: string[]) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (!roles.includes(session.role)) throw new Error("FORBIDDEN");
  return session;
}
