import { ok, fail } from "@/lib/http";
import { requireSupplierSession } from "@/lib/supplier-scope";
import { getJson, batchCommit, withConflictRetry, type JsonCommit } from "@/lib/github";
import type { AppUser, Supplier } from "@/lib/types";
import { normalizePhone } from "@/lib/phone";

export async function GET() {
  try {
    const { session, supplierId, supplier } = await requireSupplierSession();
    return ok({
      user: { id: session.id, name: session.name, phone: session.phone, role: session.role },
      supplierId,
      supplier,
    });
  } catch (e) {
    return fail(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const { session, supplierId } = await requireSupplierSession();
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
    const phone = normalizePhone(body?.phone);
    const address = typeof body?.address === "string" ? body.address.trim().slice(0, 500) : "";

    if (!name || !phone) throw new Error("VALIDATION_ERROR");

    return ok(await withConflictRetry(async () => {
      const [usersFile, suppliersFile] = await Promise.all([
        getJson<AppUser[]>("users.json", [], { cache: false }),
        getJson<Supplier[]>("suppliers.json", [], { cache: false }),
      ]);

      if (usersFile.data.some((item) => item.id !== session.id && item.phone === phone)) {
        throw new Error("DUPLICATE_PHONE");
      }

      const existing = suppliersFile.data.find((item) => item.id === supplierId);
      if (!existing) throw new Error("NOT_FOUND");

      const now = new Date().toISOString();
      const nextSupplier: Supplier = { ...existing, name, phone, address, userId: session.id, updatedAt: now };

      const commits: JsonCommit[] = [
        {
          path: "users.json",
          data: usersFile.data.map((item) =>
            item.id === session.id ? { ...item, name, phone, updatedAt: now } : item,
          ),
          message: `Update supplier account ${session.id}`,
          expectedSha: usersFile.sha || undefined,
        },
        {
          path: "suppliers.json",
          data: suppliersFile.data.map((item) =>
            item.id === supplierId ? nextSupplier : item,
          ),
          message: `Update supplier profile ${supplierId}`,
          expectedSha: suppliersFile.sha || undefined,
        },
      ];

      await batchCommit(commits);
      return {
        user: { id: session.id, name, phone, role: session.role },
        supplierId,
        supplier: nextSupplier,
      };
    }));
  } catch (error) {
    return fail(error);
  }
}
