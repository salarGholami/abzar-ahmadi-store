import "server-only";

import { mutateJson } from "./github";
import type { PaymentTransaction } from "./types";

export type PaymentProvider = "MANUAL_TRANSFER" | "ZARINPAL" | "IDPAY" | "NEXT_PROVIDER";

export type InitiateInput = {
  orderId: string;
  transactionId: string;
  amount: number; // Toman
  callbackUrl: string;
  description: string;
  mobile?: string;
};

export type InitiateResult = {
  redirectUrl: string | null;
  authority: string | null;
};

export type VerifyInput = {
  transactionId: string;
  amount: number; // Toman
  authority?: string | null;
  callbackQuery?: Record<string, string>;
};

export type VerifyResult = {
  success: boolean;
  referenceId?: string;
  raw?: Record<string, unknown>;
};

/**
 * The checkout domain depends ONLY on this interface. To add a real gateway
 * (ZarinPal, IDPay, Zibal, Pay.ir, ...) implement it, register it in `registry`
 * and set PAYMENT_PROVIDER. Cart/order UI, sale persistence and the callback route stay untouched.
 */
export interface PaymentGateway {
  readonly provider: PaymentProvider;
  /** false => customer pays outside the site (card-to-card) and an admin confirms manually. */
  readonly online: boolean;
  isConfigured(): boolean;
  initiate(input: InitiateInput): Promise<InitiateResult>;
  verify(input: VerifyInput): Promise<VerifyResult>;
}

class ManualTransferGateway implements PaymentGateway {
  readonly provider = "MANUAL_TRANSFER" as const;
  readonly online = false;
  isConfigured() {
    return true;
  }
  async initiate(): Promise<InitiateResult> {
    return { redirectUrl: null, authority: null };
  }
  async verify(): Promise<VerifyResult> {
    // Manual transfers are confirmed by an administrator from the dashboard.
    return { success: true };
  }
}

class ZarinpalGateway implements PaymentGateway {
  readonly provider = "ZARINPAL" as const;
  readonly online = true;

  private base() {
    return process.env.ZARINPAL_SANDBOX === "true"
      ? "https://sandbox.zarinpal.com"
      : "https://payment.zarinpal.com";
  }

  isConfigured() {
    return Boolean(process.env.ZARINPAL_MERCHANT_ID);
  }

  async initiate(input: InitiateInput): Promise<InitiateResult> {
    const response = await fetch(`${this.base()}/pg/v4/payment/request.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: Math.round(input.amount),
        currency: "IRT",
        callback_url: input.callbackUrl,
        description: input.description,
        metadata: { order_id: input.orderId, ...(input.mobile ? { mobile: input.mobile } : {}) },
      }),
      cache: "no-store",
    });
    const json = (await response.json().catch(() => null)) as {
      data?: { code?: number; authority?: string };
      errors?: unknown;
    } | null;
    const authority = json?.data?.authority;
    if (!response.ok || json?.data?.code !== 100 || !authority) {
      throw new Error("اتصال به درگاه پرداخت انجام نشد. لطفاً دوباره تلاش کنید.");
    }
    return { authority, redirectUrl: `${this.base()}/pg/StartPay/${authority}` };
  }

  async verify(input: VerifyInput): Promise<VerifyResult> {
    if (input.callbackQuery?.Status && input.callbackQuery.Status !== "OK") return { success: false };
    const authority = input.authority || input.callbackQuery?.Authority;
    if (!authority) return { success: false };
    const response = await fetch(`${this.base()}/pg/v4/payment/verify.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount: Math.round(input.amount),
        authority,
      }),
      cache: "no-store",
    });
    const json = (await response.json().catch(() => null)) as {
      data?: { code?: number; ref_id?: number | string };
    } | null;
    const code = json?.data?.code;
    if (code === 100 || code === 101) {
      return { success: true, referenceId: json?.data?.ref_id !== undefined ? String(json.data.ref_id) : undefined };
    }
    return { success: false, raw: { code: code ?? null } };
  }
}

const registry: Partial<Record<PaymentProvider, () => PaymentGateway>> = {
  MANUAL_TRANSFER: () => new ManualTransferGateway(),
  ZARINPAL: () => new ZarinpalGateway(),
  // IDPAY / NEXT_PROVIDER: implement PaymentGateway and register here.
};

export function isPaymentProvider(value: string): value is PaymentProvider {
  return value === "MANUAL_TRANSFER" || value === "ZARINPAL" || value === "IDPAY" || value === "NEXT_PROVIDER";
}

export function getPaymentGateway(provider: PaymentProvider = "MANUAL_TRANSFER"): PaymentGateway {
  const factory = registry[provider];
  if (!factory) throw new Error(`PAYMENT_PROVIDER_NOT_IMPLEMENTED:${provider}`);
  return factory();
}

/** Provider used for new online orders. Falls back to manual transfer when the chosen gateway is not configured. */
export function getActivePaymentProvider(): PaymentProvider {
  const requested = (process.env.PAYMENT_PROVIDER || "MANUAL_TRANSFER").toUpperCase();
  if (!isPaymentProvider(requested)) return "MANUAL_TRANSFER";
  const factory = registry[requested];
  if (!factory || !factory().isConfigured()) return "MANUAL_TRANSFER";
  return requested;
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function buildTransaction(input: {
  orderId: string;
  provider: PaymentProvider;
  amount: number;
}): PaymentTransaction {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    orderId: input.orderId,
    provider: input.provider,
    status: "PENDING",
    amount: input.amount,
    authority: null,
    referenceId: null,
    callbackPayload: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function patchTransaction(id: string, patch: Partial<PaymentTransaction>) {
  return mutateJson<PaymentTransaction[], PaymentTransaction | null>(
    "payment-transactions.json",
    [],
    (all) => {
      const index = all.findIndex((item) => item.id === id);
      if (index < 0) return { next: all, result: null };
      const updated: PaymentTransaction = { ...all[index], ...patch, id, updatedAt: new Date().toISOString() };
      return { next: all.map((item, i) => (i === index ? updated : item)), result: updated };
    },
    `Update payment transaction ${id}`,
  );
}

/** Starts an online payment for an already persisted transaction and stores the provider authority. */
export async function startOnlinePayment(input: {
  provider: PaymentProvider;
  orderId: string;
  transactionId: string;
  amount: number;
  mobile?: string;
}) {
  const gateway = getPaymentGateway(input.provider);
  if (!gateway.online) return { redirectUrl: null as string | null };
  const result = await gateway.initiate({
    orderId: input.orderId,
    transactionId: input.transactionId,
    amount: input.amount,
    mobile: input.mobile,
    description: `پرداخت سفارش ${input.orderId.slice(0, 8)}`,
    callbackUrl: `${getSiteUrl()}/api/payments/callback/${input.provider}?tx=${encodeURIComponent(input.transactionId)}`,
  });
  await patchTransaction(input.transactionId, { status: "INITIATED", authority: result.authority });
  return { redirectUrl: result.redirectUrl };
}
