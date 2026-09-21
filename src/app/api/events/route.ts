import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/events";
import type { CustomerEventName } from "@/lib/types";

const allowed = new Set<CustomerEventName>([
  "PAGE_VIEW", "PRODUCT_VIEW", "SEARCH", "FILTER_APPLIED", "CATEGORY_VIEW",
  "CHECKOUT_STARTED", "LOGIN", "REGISTER", "LOGOUT",
  "WISHLIST_ADDED", "WISHLIST_REMOVED",
]);

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      name?: CustomerEventName;
      path?: string;
      entityId?: string;
      metadata?: Record<string, string | number | boolean | null>;
    };
    if (!body.name || !allowed.has(body.name)) {
      return NextResponse.json({ success: false, error: { code: "INVALID_EVENT", message: "رویداد معتبر نیست." } }, { status: 400 });
    }
    await trackServerEvent(body.name, {
      path: typeof body.path === "string" ? body.path.slice(0, 300) : undefined,
      entityId: typeof body.entityId === "string" ? body.entityId.slice(0, 100) : undefined,
      metadata: body.metadata,
    });
    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json({ success: false, error: { code: "EVENT_ERROR", message: "ثبت رویداد انجام نشد." } }, { status: 500 });
  }
}
