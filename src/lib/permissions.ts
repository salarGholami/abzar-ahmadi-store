import "server-only";
import { getSession } from "./auth";

export const permissions = {
  ADMIN: ["*"],
  MANAGER: [
    "dashboard.read",
    "products",
    "customers",
    "suppliers",
    "sales",
    "purchases",
    "inventory",
    "finance",
    "reports",
    "settings",
  ],
  SUPPLIER: ["supplier.portal"],
  CUSTOMER: ["sales.create"],
} as const;

function hasPermission(granted: readonly string[], required: string) {
  if (granted.includes("*")) return true;
  return granted.some((item) => required === item || required.startsWith(`${item}.`));
}

export async function requirePermission(permission: string) {
  const session = await getSession();

  if (!session) throw new Error("UNAUTHENTICATED");

  if (session.role === "ADMIN" && hasPermission(session.permissions, permission)) {
    return session;
  }

  if (
    session.role === "SUPPLIER" &&
    permission === "supplier.portal"
  ) {
    return session;
  }

  if (
    session.role === "CUSTOMER" &&
    hasPermission(permissions.CUSTOMER, permission)
  ) {
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

export async function requireOwner() {
  const session = await getSession();

  if (!session) throw new Error("UNAUTHENTICATED");

  if (session.role !== "ADMIN" || !session.isOwner) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
