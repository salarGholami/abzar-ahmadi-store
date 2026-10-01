import { ok, fail } from "@/lib/http";
import { getSession } from "@/lib/auth";
import { getJson, mutateJson } from "@/lib/github";
import { trackServerEvent } from "@/lib/events";
import type { Product, WishlistEntry } from "@/lib/types";

const FILE = "wishlists.json";
const MAX_ITEMS = 200;

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return ok({ productIds: [] as string[] });
    const file = await getJson<WishlistEntry[]>(FILE, []);
    return ok({ productIds: file.data.find((item) => item.userId === session.id)?.productIds ?? [] });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) throw new Error("UNAUTHENTICATED");
    const body = (await req.json().catch(() => null)) as { productId?: unknown; action?: unknown } | null;
    const productId = typeof body?.productId === "string" ? body.productId : "";
    if (!productId) throw new Error("VALIDATION_ERROR");

    const products = await getJson<Product[]>("products.json", []);
    if (!products.data.some((item) => item.id === productId)) throw new Error("PRODUCT_NOT_FOUND");

    let added = false;
    const productIds = await mutateJson<WishlistEntry[], string[]>(
      FILE,
      [],
      (all) => {
        const existing = all.find((item) => item.userId === session.id);
        const current = existing?.productIds ?? [];
        const has = current.includes(productId);
        const wantAdd = body?.action === "add" ? true : body?.action === "remove" ? false : !has;
        added = wantAdd;
        const nextIds = wantAdd
          ? has ? current : [...current, productId].slice(-MAX_ITEMS)
          : current.filter((id) => id !== productId);
        const record: WishlistEntry = { userId: session.id, productIds: nextIds, updatedAt: new Date().toISOString() };
        return { next: existing ? all.map((item) => (item === existing ? record : item)) : [...all, record], result: nextIds };
      },
      `Wishlist ${session.id}`,
    );

    await trackServerEvent(added ? "WISHLIST_ADDED" : "WISHLIST_REMOVED", { entityId: productId });
    return ok({ productIds, added });
  } catch (error) {
    return fail(error);
  }
}
