import { createPurchase } from "@/lib/purchases";
import { ok, fail } from "@/lib/http";

export async function POST(req: Request) {
  try {
    return ok(await createPurchase(await req.json()), 201);
  } catch (e) {
    return fail(e);
  }
}
