import { ok, fail } from "@/lib/http";
import { getSession } from "@/lib/auth";
import { batchCommit, getJson, withConflictRetry, type JsonCommit } from "@/lib/github";
import type { AppUser, Customer } from "@/lib/types";
import { normalizePhone } from "@/lib/phone";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) throw new Error("UNAUTHENTICATED");

    const [usersFile, customersFile] = await Promise.all([
      getJson<AppUser[]>("users.json", [], { cache: false }),
      getJson<Customer[]>("customers.json", [], { cache: false }),
    ]);
    const user = usersFile.data.find((item) => item.id === session.id);
    if (!user || user.role !== "CUSTOMER") throw new Error("FORBIDDEN");

    return ok({
      user: { id: user.id, name: user.name, phone: user.phone },
      customer: customersFile.data.find((item) => item.userId === user.id) ?? null,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "CUSTOMER") throw new Error("FORBIDDEN");

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 100) : "";
    const phone = normalizePhone(body?.phone);
    const address = typeof body?.address === "string" ? body.address.trim().slice(0, 500) : "";

    if (!name || !phone) throw new Error("VALIDATION_ERROR");

    return ok(await withConflictRetry(async () => {
      const [usersFile, customersFile] = await Promise.all([
        getJson<AppUser[]>("users.json", [], { cache: false }),
        getJson<Customer[]>("customers.json", [], { cache: false }),
      ]);
      const user = usersFile.data.find((item) => item.id === session.id);
      if (!user || user.role !== "CUSTOMER") throw new Error("FORBIDDEN");
      if (usersFile.data.some((item) => item.id !== session.id && item.phone === phone)) {
        throw new Error("DUPLICATE_PHONE");
      }

      const existing = customersFile.data.find((item) => item.userId === session.id);
      const nextCustomer: Customer = existing
        ? { ...existing, name, phone, address, updatedAt: new Date().toISOString() }
        : {
            id: crypto.randomUUID(),
            userId: session.id,
            name,
            phone,
            address,
            balance: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

      const commits: JsonCommit[] = [
        {
          path: "users.json",
          data: usersFile.data.map((item) =>
            item.id === session.id ? { ...item, name, phone, updatedAt: new Date().toISOString() } : item,
          ),
          message: `Update customer account ${session.id}`,
          expectedSha: usersFile.sha || undefined,
        },
        {
          path: "customers.json",
          data: existing
            ? customersFile.data.map((item) => item.id === existing.id ? nextCustomer : item)
            : [...customersFile.data, nextCustomer],
          message: `Update customer profile ${session.id}`,
          expectedSha: customersFile.sha || undefined,
        },
      ];

      await batchCommit(commits);
      return { user: { id: session.id, name, phone }, customer: nextCustomer };
    }));
  } catch (error) {
    return fail(error);
  }
}
