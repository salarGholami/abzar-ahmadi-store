import { ok, fail } from "@/lib/http";
import { requireRole } from "@/lib/permissions";
import { deleteSale, setSalePaymentStatus } from "@/lib/sales";
import { audit } from "@/lib/audit";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = (await req.json().catch(() => null)) as { paymentStatus?: unknown } | null;
    if (!body || typeof body.paymentStatus !== "string") throw new Error("VALIDATION_ERROR");
    const sale = await setSalePaymentStatus(id, body.paymentStatus);
    await audit("SALE_PAYMENT_STATUS_UPDATED", { entityType: "sales", entityId: id, metadata: { status: body.paymentStatus } });
    return ok(sale);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    await deleteSale(id);
    return ok({ id, deleted: true });
  } catch (error) {
    return fail(error);
  }
}
