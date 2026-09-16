import { ok, fail } from "@/lib/http";
import { requireRole } from "@/lib/permissions";
import { getJson, writeJson } from "@/lib/github";
import { hashPassword } from "@/lib/auth";
import type { AppUser } from "@/lib/types";

function sanitize(user: AppUser) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = await req.json();
    const file = await getJson<AppUser[]>("users.json", []);
    const index = file.data.findIndex((user) => user.id === id);
    if (index < 0) throw new Error("NOT_FOUND");

    const next = { ...file.data[index], role: "ADMIN" as const, permissions: ["*"] as string[] };
    if (body.name) next.name = body.name;
    if (body.phone) next.phone = body.phone;
    if (body.password) next.passwordHash = hashPassword(body.password);
    next.updatedAt = new Date().toISOString();

    file.data[index] = next;
    await writeJson("users.json", file.data, `Update admin ${id}`, file.sha || undefined);
    return ok(sanitize(next));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    if (session.id === id) throw new Error("CANNOT_DELETE_SELF");

    const file = await getJson<AppUser[]>("users.json", []);
    const next = file.data.filter((user) => user.id !== id);
    if (next.length === file.data.length) throw new Error("NOT_FOUND");

    await writeJson("users.json", next, `Delete admin ${id}`, file.sha || undefined);
    return ok({ id });
  } catch (error) {
    return fail(error);
  }
}
