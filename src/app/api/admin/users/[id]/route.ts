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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = await req.json();
    const f = await getJson<AppUser[]>("users.json", []);
    const i = f.data.findIndex((x) => x.id === id);
    if (i < 0) throw new Error("NOT_FOUND");
    const next = { ...f.data[i] };
    if (body.name) next.name = body.name;
    if (body.phone) next.phone = body.phone;
    if (body.role) { next.role = body.role as Role; next.permissions = [...(permissions[body.role as Role] || permissions.SELLER)]; }
    if (body.password) next.passwordHash = hashPassword(body.password);
    next.updatedAt = new Date().toISOString();
    f.data[i] = next;
    await writeJson("users.json", f.data, `Update user ${id}`, f.sha || undefined);
    return ok(sanitize(next));
  } catch (e) { return fail(e); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    if (session.id === id) throw new Error("CANNOT_DELETE_SELF");
    const f = await getJson<AppUser[]>("users.json", []);
    const next = f.data.filter((x) => x.id !== id);
    if (next.length === f.data.length) throw new Error("NOT_FOUND");
    await writeJson("users.json", next, `Delete user ${id}`, f.sha || undefined);
    return ok({ id });
  } catch (e) { return fail(e); }
}
