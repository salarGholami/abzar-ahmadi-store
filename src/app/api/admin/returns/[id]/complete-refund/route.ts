import { ok, fail } from "@/lib/http";
import { completeRefund } from "@/lib/returns";
import { requirePermission } from "@/lib/permissions";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) { try { await requirePermission("sales.update"); const body=await req.json().catch(()=>({})) as {referenceId?:unknown}; return ok(await completeRefund((await params).id, typeof body.referenceId === "string" ? body.referenceId : null)); } catch(e){ return fail(e); } }
