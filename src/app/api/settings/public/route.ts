import { NextResponse } from "next/server";
import { getJson } from "@/lib/github";
import { getActivePaymentProvider } from "@/lib/payments";
import type { StoreSettings } from "@/lib/types";

const fallback: StoreSettings[] = [
  {
    id: "store",
    storeName: "ابزار احمدی",
    storePhone: "0912-0824229",
    cardNumber: "",
    cardHolderName: "",
    lowStockThreshold: 5,
  },
];

export async function GET() {
  let s = fallback[0];
  try {
    const { data } = await getJson<StoreSettings[]>("settings.json", fallback);
    s = data[0] || fallback[0];
  } catch {
    s = fallback[0];
  }
  return NextResponse.json({
    success: true,
    data: {
      storeName: s.storeName,
      storePhone: s.storePhone,
      cardNumber: s.cardNumber,
      cardHolderName: s.cardHolderName,
      paymentProvider: getActivePaymentProvider(),
    },
  });
}
