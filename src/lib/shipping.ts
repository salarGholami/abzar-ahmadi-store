import "server-only";

import type { Sale, ShippingMethod, ShippingStatus } from "./types";

export const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  PENDING: "در انتظار ارسال",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
  CANCELED: "لغو شده",
};

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  POST: "پست",
  TIPAX: "تیپاکس",
  SNAPP: "اسنپ",
  COURIER: "پیک",
  PICKUP: "تحویل حضوری",
  OTHER: "سایر",
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  "POST",
  "TIPAX",
  "SNAPP",
  "COURIER",
  "PICKUP",
  "OTHER",
];

export const SHIPPING_STATUSES: ShippingStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
];

export function getShippingTrackingUrl(
  method: ShippingMethod | null | undefined,
  trackingCode: string | null | undefined,
) {
  if (!trackingCode) {
    return null;
  }

  const code = encodeURIComponent(trackingCode);

  switch (method) {
    case "POST":
      return `https://tracking.post.ir/?id=${code}`;

    default:
      return null;
  }
}

export function normalizeSaleShipping(sale: Sale): Sale {
  return {
    ...sale,
    shippingStatus: sale.shippingStatus ?? "PENDING",
    trackingCode: sale.trackingCode ?? null,
    shippingMethod: sale.shippingMethod ?? null,
    shippingCompany: sale.shippingCompany ?? null,
    shippedAt: sale.shippedAt ?? null,
    trackingUrl: sale.trackingUrl ?? null,
  };
}
