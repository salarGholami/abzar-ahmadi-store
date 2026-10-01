import { ok, fail } from "@/lib/http";
import { createTicket, listTickets } from "@/lib/support";
import { requirePermission } from "@/lib/permissions";
import { supportTicketSchema } from "@/lib/validation";

export async function GET() { try { await requirePermission("support.read"); return ok(await listTickets()); } catch (e) { return fail(e); } }
export async function POST(req: Request) {
  try {
    await requirePermission("support.create");
    const parsed = supportTicketSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new Error("VALIDATION_ERROR");
    return ok(await createTicket(parsed.data), 201);
  } catch (e) { return fail(e); }
}
