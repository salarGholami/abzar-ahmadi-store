import { ok, fail } from "@/lib/http";
import { requireOwner } from "@/lib/permissions";
import { getJson, mutateJson, batchCommit, withConflictRetry, type JsonCommit } from "@/lib/github";
import { hashPassword } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";
import { isPublicRole } from "@/lib/roles";
import { syncUserProfile, normalizeAdminPermissions } from "@/lib/user-provisioning";
import type { AppUser } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

function sanitize(user: AppUser) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await requireOwner();
    const { id } = await params;
    if (id === session.id) throw new Error("CANNOT_EDIT_OWNER");

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 100) : "";
    const phone = body?.phone !== undefined && body.phone !== "" ? normalizePhone(body.phone) : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const requestedRole = typeof body?.role === "string" ? body.role.toUpperCase() : undefined;

    if (body?.phone && !phone) throw new Error("VALIDATION_ERROR");
    if (password && (password.length < 8 || password.length > 128)) throw new Error("VALIDATION_ERROR");

    const updated = await withConflictRetry(async () => {
      const [usersFile, customersFile, suppliersFile] = await Promise.all([
        getJson<AppUser[]>("users.json", [], { cache: false }),
        getJson<Record<string, unknown>[]>("customers.json", [], { cache: false }),
        getJson<Record<string, unknown>[]>("suppliers.json", [], { cache: false }),
      ]);

      const target = usersFile.data.find((user) => user.id === id);
      if (!target) throw new Error("NOT_FOUND");
      if (target.isOwner || target.phone === "09120000000") throw new Error("FORBIDDEN");

      if (phone && usersFile.data.some((user) => user.id !== id && user.phone === phone)) {
        throw new Error("DUPLICATE_PHONE");
      }

      if (requestedRole && requestedRole !== target.role) {
        throw new Error("INVALID_ROLE_CHANGE");
      }

      const next: AppUser = {
        ...target,
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(password ? { passwordHash: hashPassword(password) } : {}),
        updatedAt: new Date().toISOString(),
      };

      const commits: JsonCommit[] = [{
        path: "users.json",
        data: usersFile.data.map((user) => user.id === id ? next : user),
        message: `Update user ${id}`,
        expectedSha: usersFile.sha || undefined,
      }];

      if (target.role === "CUSTOMER") {
        commits.push({
          path: "customers.json",
          data: customersFile.data.map((profile) =>
            profile.userId === id
              ? { ...profile, name: next.name, phone: next.phone, updatedAt: next.updatedAt }
              : profile,
          ),
          message: `Sync customer account ${id}`,
          expectedSha: customersFile.sha || undefined,
        });
      }

      if (target.role === "SUPPLIER" && target.supplierId) {
        commits.push({
          path: "suppliers.json",
          data: suppliersFile.data.map((profile) =>
            profile.id === target.supplierId
              ? { ...profile, name: next.name, phone: next.phone, userId: id, updatedAt: next.updatedAt }
              : profile,
          ),
          message: `Sync supplier account ${id}`,
          expectedSha: suppliersFile.sha || undefined,
        });
      }

      await batchCommit(commits);
      return next;
    });

    return ok(sanitize(updated));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await requireOwner();
    const { id } = await params;
    if (session.id === id) throw new Error("CANNOT_DELETE_SELF");

    await withConflictRetry(async () => {
      const [usersFile, customersFile, suppliersFile] = await Promise.all([
        getJson<AppUser[]>("users.json", [], { cache: false }),
        getJson<Record<string, unknown>[]>("customers.json", [], { cache: false }),
        getJson<Record<string, unknown>[]>("suppliers.json", [], { cache: false }),
      ]);

      const target = usersFile.data.find((user) => user.id === id);
      if (!target) throw new Error("NOT_FOUND");
      if (target.isOwner || target.phone === "09120000000") throw new Error("FORBIDDEN");

      const commits: JsonCommit[] = [{
        path: "users.json",
        data: usersFile.data.filter((user) => user.id !== id),
        message: `Delete user ${id}`,
        expectedSha: usersFile.sha || undefined,
      }];

      if (target.role === "CUSTOMER") {
        commits.push({
          path: "customers.json",
          data: customersFile.data.map((profile) =>
            profile.userId === id ? { ...profile, userId: undefined, updatedAt: new Date().toISOString() } : profile,
          ),
          message: `Unlink customer account ${id}`,
          expectedSha: customersFile.sha || undefined,
        });
      }

      if (target.role === "SUPPLIER" && target.supplierId) {
        commits.push({
          path: "suppliers.json",
          data: suppliersFile.data.map((profile) =>
            profile.id === target.supplierId ? { ...profile, userId: undefined, updatedAt: new Date().toISOString() } : profile,
          ),
          message: `Unlink supplier account ${id}`,
          expectedSha: suppliersFile.sha || undefined,
        });
      }

      await batchCommit(commits);
    });

    return ok({ id });
  } catch (error) {
    return fail(error);
  }
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    await requireOwner();
    const { id } = await params;
    const { data } = await getJson<AppUser[]>("users.json", []);
    const user = data.find((item) => item.id === id);

    if (!user || user.isOwner || user.phone === "09120000000") {
      throw new Error("NOT_FOUND");
    }

    return ok(sanitize(user));
  } catch (error) {
    return fail(error);
  }
}
