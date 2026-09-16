import { ok, fail } from "@/lib/http";
import { requireRole } from "@/lib/permissions";
import { getJson, writeJson } from "@/lib/github";
import { hashPassword } from "@/lib/auth";
import type { AppUser } from "@/lib/types";

function sanitize(user: AppUser) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function GET() {
  try {
    await requireRole("ADMIN");
    const file = await getJson<AppUser[]>("users.json", []);
    return ok(file.data.map(sanitize));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireRole("ADMIN");
    const body = await req.json();
    if (!body.name || !body.phone || !body.password || String(body.password).length < 8) {
      throw new Error("VALIDATION_ERROR");
    }

    const file = await getJson<AppUser[]>("users.json", []);
    if (file.data.some((user) => user.phone === body.phone)) throw new Error("DUPLICATE_PHONE");

    const user: AppUser = {
      id: crypto.randomUUID(),
      name: body.name,
      phone: body.phone,
      role: "ADMIN",
      permissions: ["*"],
      passwordHash: hashPassword(body.password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await writeJson("users.json", [...file.data, user], `Create admin ${user.id}`, file.sha || undefined);
    return ok(sanitize(user), 201);
  } catch (error) {
    return fail(error);
  }
}
