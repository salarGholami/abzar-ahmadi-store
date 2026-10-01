import { ok, fail } from "@/lib/http";
import { approveReturn } from "@/lib/returns";
import { requirePermission } from "@/lib/permissions";
import { refundSchema } from "@/lib/validation";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) { try { await requirePermission("sales.update"); const parsed = refundSchema.safeParse(await req.json().catch(() => null)); if (!parsed.success) throw new Error("VALIDATION_ERROR"); return ok(await approveReturn((await params).id, parsed.data.amount, parsed.data.method)); } catch (e) { return fail(e); } }
