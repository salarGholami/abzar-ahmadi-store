import { NextResponse } from "next/server";
import { getSiteUrl, isPaymentProvider } from "@/lib/payments";
import { settleOnlinePayment } from "@/lib/sales";

/**
 * Gateway return URL. The browser lands here after paying; the server verifies
 * the payment with the provider (never trusts the query string) and redirects to the account page.
 */
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const url = new URL(req.url);
  const site = getSiteUrl();
  const upper = provider.toUpperCase();

  try {
    const transactionId = url.searchParams.get("tx") || "";
    if (!isPaymentProvider(upper) || upper === "MANUAL_TRANSFER" || !transactionId) {
      return NextResponse.redirect(`${site}/account?payment=invalid`, 303);
    }
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      if (key !== "tx") query[key] = value.slice(0, 200);
    });
    const result = await settleOnlinePayment({ transactionId, provider: upper, callbackQuery: query });
    const status = result.success ? "success" : "failed";
    const order = result.orderId ? `&order=${encodeURIComponent(result.orderId)}` : "";
    return NextResponse.redirect(`${site}/account?payment=${status}${order}`, 303);
  } catch (error) {
    console.error("payment callback failed", error);
    return NextResponse.redirect(`${site}/account?payment=error`, 303);
  }
}
