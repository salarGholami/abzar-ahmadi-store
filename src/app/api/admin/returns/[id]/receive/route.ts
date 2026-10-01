import { ok, fail } from "@/lib/http";
import { receiveReturn } from "@/lib/returns";
import { requirePermission } from "@/lib/permissions";
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) { try { await requirePermission("sales.update"); return ok(await receiveReturn((await params).id)); } catch(e){ return fail(e); } }
