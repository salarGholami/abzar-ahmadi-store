import { ok, fail } from "@/lib/http";
import { requireRole } from "@/lib/permissions";
import { getJson, writeJson } from "@/lib/github";
import { hashPassword } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import type { AppUser, Role } from "@/lib/types";

function sanitize(u: AppUser) {
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function GET() {
  try {
    await requireRole("ADMIN");
    const f = await getJson<AppUser[]>("users.json", []);
    return ok(f.data.map(sanitize));
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  try {
    await requireRole("ADMIN");
    const body = await req.json();
    if (!body.name || !body.phone || !body.password || String(body.password).length < 8) {
      throw new Error("VALIDATION_ERROR");
    }
    const role: Role = body.role || "SELLER";
    const f = await getJson<AppUser[]>("users.json", []);
    if (f.data.some((u) => u.phone === body.phone)) throw new Error("DUPLICATE_PHONE");
    const user: AppUser = {
      id: crypto.randomUUID(), name: body.name, phone: body.phone, role,
      permissions: [...(permissions[role] || permissions.SELLER)],
      passwordHash: hashPassword(body.password),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    await writeJson("users.json", [...f.data, user], `Create user ${user.id}`, f.sha || undefined);
    return ok(sanitize(user), 201);
  } catch (e) { return fail(e); }
}
