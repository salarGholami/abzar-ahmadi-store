import "server-only";
import { getSession } from "./auth";
import { getJson } from "./github";
import type { AppUser, Supplier } from "./types";

/** Resolve authenticated SUPPLIER session + linked supplierId (from session or users.json). */
export async function requireSupplierSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (session.role !== "SUPPLIER") throw new Error("FORBIDDEN");

  let supplierId = session.supplierId;
  if (!supplierId) {
    const { data: users } = await getJson<AppUser[]>("users.json", []);
    const me = users.find((u) => u.id === session.id);
    supplierId = me?.supplierId;
  }
  if (!supplierId) throw new Error("FORBIDDEN");

  const { data: suppliers } = await getJson<Supplier[]>("suppliers.json", []);
  const supplier = suppliers.find((s) => s.id === supplierId) || null;

  return { session, supplierId, supplier };
}
