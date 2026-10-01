import { ok, fail } from "@/lib/http";
import { getTicket, replyTicket } from "@/lib/support";
import { requirePermission } from "@/lib/permissions";
import { supportReplySchema } from "@/lib/validation";
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) { try { await requirePermission("support.read"); return ok(await getTicket((await params).id)); } catch (e) { return fail(e); } }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) { try { await requirePermission("support.reply"); const parsed = supportReplySchema.safeParse(await req.json().catch(() => null)); if (!parsed.success) throw new Error("VALIDATION_ERROR"); return ok(await replyTicket((await params).id, parsed.data.body)); } catch (e) { return fail(e); } }
