import { ok, fail } from "@/lib/http";
import { getJson } from "@/lib/github";
import { requestReturn } from "@/lib/returns";
import { requirePermission } from "@/lib/permissions";
import { getSession } from "@/lib/auth";
import type { ReturnRequest } from "@/lib/types";
import { returnRequestSchema } from "@/lib/validation";

export async function GET() {
  try {
    await requirePermission("orders.read");
    const session = await getSession();
    const f = await getJson<ReturnRequest[]>("returns.json", []);
    return ok(session?.role === "ADMIN" ? f.data : f.data.filter(x => x.userId === session?.id));
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  try {
    await requirePermission("sales.create");
    const parsed = returnRequestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new Error("VALIDATION_ERROR");
    return ok(await requestReturn(parsed.data), 201);
  } catch (e) { return fail(e); }
}
