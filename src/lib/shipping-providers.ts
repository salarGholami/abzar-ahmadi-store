import "server-only";

import type { ShippingMethod } from "@/lib/types";

export type TrackingResult = {
  trackingCode: string;
  trackingUrl: string | null;
};

export interface ShippingProvider {
  readonly method: ShippingMethod;
  createShipment(input: { orderId: string; recipientName: string; phone: string; city: string; address: string }): Promise<TrackingResult>;
}

class ManualShippingProvider implements ShippingProvider {
  constructor(public readonly method: ShippingMethod) {}

  async createShipment(input: { orderId: string }) {
    return { trackingCode: `DEMO-${input.orderId.slice(0, 8).toUpperCase()}`, trackingUrl: null };
  }
}

export function getShippingProvider(method: ShippingMethod): ShippingProvider {
  // External carriers intentionally remain adapters; no provider-specific API call is required for MVP.
  return new ManualShippingProvider(method);
}
