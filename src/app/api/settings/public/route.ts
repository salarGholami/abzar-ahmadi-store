import { NextResponse } from "next/server";
import { getJson } from "@/lib/github";
import type { StoreSettings } from "@/lib/types";

const fallback: StoreSettings[] = [{ id: "store", storeName: "ابزارینو", storePhone: "021-00000000", cardNumber: "", cardHolderName: "", lowStockThreshold: 5 }];

export async function GET() {
  try {
    const { data } = await getJson<StoreSettings[]>("settings.json", fallback);
    const s = data[0] || fallback[0];
    return NextResponse.json({ success: true, data: { storeName: s.storeName, storePhone: s.storePhone, cardNumber: s.cardNumber, cardHolderName: s.cardHolderName } });
  } catch {
    const s = fallback[0];
    return NextResponse.json({ success: true, data: { storeName: s.storeName, storePhone: s.storePhone, cardNumber: s.cardNumber, cardHolderName: s.cardHolderName } });
  }
}
