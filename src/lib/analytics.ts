"use client";

import type { CustomerEventName } from "./types";

export function trackEvent(
  name: CustomerEventName,
  payload?: {
    path?: string;
    entityId?: string;
    metadata?: Record<string, string | number | boolean | null>;
  },
) {
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, ...payload }),
    keepalive: true,
  }).catch(() => {});
}
