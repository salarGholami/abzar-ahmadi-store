/**
 * Application roles and role routing.
 * ADMIN is the management role. The owner is a distinguished ADMIN account.
 */
export type Role = "ADMIN" | "SUPPLIER" | "CUSTOMER";
export type PublicRole = Exclude<Role, "ADMIN">;

export const PUBLIC_ROLES: readonly PublicRole[] = ["SUPPLIER", "CUSTOMER"] as const;

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/dashboard",
  SUPPLIER: "/supplier",
  CUSTOMER: "/customer",
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "مدیر فروشگاه",
  SUPPLIER: "تأمین‌کننده",
  CUSTOMER: "مشتری",
};

export function isPublicRole(value: unknown): value is PublicRole {
  return value === "SUPPLIER" || value === "CUSTOMER";
}

const PORTAL_PREFIXES = Object.values(ROLE_HOME);

function isInside(path: string, base: string) {
  return path === base || path.startsWith(`${base}/`) || path.startsWith(`${base}?`);
}

export function resolvePostLoginPath(
  requested: string | null | undefined,
  role: Role,
) {
  const home = ROLE_HOME[role];
  if (!requested) return home;

  const isLocal =
    requested.startsWith("/") &&
    !requested.startsWith("//") &&
    !requested.includes("\\");
  if (!isLocal) return home;

  const targetsPortal = PORTAL_PREFIXES.some((prefix) =>
    isInside(requested, prefix),
  );

  if (targetsPortal && !isInside(requested, home)) return home;
  return requested;
}
