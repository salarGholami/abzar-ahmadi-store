import { ok, fail } from "@/lib/http";
import { requireOwner } from "@/lib/permissions";
import { getJson } from "@/lib/github";
import { normalizePhone } from "@/lib/phone";
import { isPublicRole } from "@/lib/roles";
import { createUserWithProfile, normalizeAdminPermissions } from "@/lib/user-provisioning";
import type { AppUser } from "@/lib/types";

function sanitize(user: AppUser) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export async function GET() {
  try {
    await requireOwner();

    const file = await getJson<AppUser[]>("users.json", []);

    return ok(
      file.data
        .filter((user) => user.role === "SUPPLIER" || user.role === "CUSTOMER" || user.role === "ADMIN")
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        .map(sanitize),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireOwner();

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 100) : "";
    const phone = normalizePhone(body?.phone);
    const password = typeof body?.password === "string" ? body.password : "";
    const role = typeof body?.role === "string" ? body.role.toUpperCase() : "";

    if (
      !name ||
      !phone ||
      password.length < 8 ||
      password.length > 128 ||
      (role !== "ADMIN" && !isPublicRole(role))
    ) {
      throw new Error("VALIDATION_ERROR");
    }

    const user = await createUserWithProfile({
      name,
      phone,
      password,
      role: role as "ADMIN" | "CUSTOMER" | "SUPPLIER",
      permissions: normalizeAdminPermissions(
        role as "ADMIN",
        body?.permissions,
      ),
      profileId: typeof body?.profileId === "string" ? body.profileId : undefined,
    });

    return ok(sanitize(user), 201);
  } catch (error) {
    return fail(error);
  }
}
