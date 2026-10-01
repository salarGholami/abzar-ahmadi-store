import { NextResponse } from "next/server";
import { getCart, mutateCart } from "@/lib/cart";
import { trackServerEvent } from "@/lib/events";

export async function GET() {
  try {
    const result = await getCart();
    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ success: false, error: { code: "CART_READ_ERROR", message: "دریافت سبد خرید انجام نشد." } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      action?: "ADD" | "SET" | "REMOVE" | "CLEAR";
      productId?: string;
      quantity?: number;
    };
    if (!body.action) throw new Error("VALIDATION_ERROR");

    const result = await mutateCart(body.action, body.productId, body.quantity);
    const eventMap = {
      ADD: "CART_ITEM_ADDED",
      SET: "CART_ITEM_UPDATED",
      REMOVE: "CART_ITEM_REMOVED",
      CLEAR: "CART_CLEARED",
    } as const;
    await trackServerEvent(eventMap[body.action], {
      entityId: body.productId,
      metadata: body.quantity === undefined ? undefined : { quantity: body.quantity },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطا در بروزرسانی سبد خرید.";
    const status = message === "PRODUCT_NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ success: false, error: { code: message, message } }, { status });
  }
}
