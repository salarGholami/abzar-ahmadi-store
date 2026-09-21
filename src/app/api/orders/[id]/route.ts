import { ok, fail } from "@/lib/http";
import { getSession } from "@/lib/auth";
import { getJson } from "@/lib/github";
import { getOrderTimeline } from "@/lib/order-service";
import type { Sale } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) throw new Error("UNAUTHENTICATED");
    const { id } = await params;
    const f = await getJson<Sale[]>("sales.json", []);
    const sale = f.data.find(x => x.id === id);
    if (!sale || (session.role === "CUSTOMER" && sale.customerUserId !== session.id) || (session.role === "SUPPLIER" && sale.customerUserId === session.id)) throw new Error("NOT_FOUND");
    return ok({ sale, timeline: await getOrderTimeline(id) });
  } catch (error) { return fail(error); }
}
