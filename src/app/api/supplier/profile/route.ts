import { ok, fail } from "@/lib/http";
import { requireSupplierSession } from "@/lib/supplier-scope";
import { getSession } from "@/lib/auth";

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
