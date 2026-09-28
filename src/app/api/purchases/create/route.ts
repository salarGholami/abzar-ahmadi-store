import { createPurchase } from "@/lib/purchases";
import { ok, fail } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    return ok(await createPurchase(payload), 201);
  } catch (error) {
    return fail(error);
  }
}
