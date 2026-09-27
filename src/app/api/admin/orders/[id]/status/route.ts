import { ok, fail } from "@/lib/http";
import { transitionOrder } from "@/lib/order-service";
import { setSalePaymentStatus } from "@/lib/sales";
import { orderStatusSchema } from "@/lib/validation";
import { requirePermission } from "@/lib/permissions";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("orders.update");
    const parsed = orderStatusSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new Error("VALIDATION_ERROR");
    const id = (await params).id;
    if (parsed.data.status === "PAID" || parsed.data.status === "CANCELLED") return ok(await setSalePaymentStatus(id, parsed.data.status === "CANCELLED" ? "CANCELED" : "PAID", { actorLabel: parsed.data.reason }));
    return ok(await transitionOrder(id, parsed.data.status, parsed.data.reason));
  } catch (e) { return fail(e); }
}
