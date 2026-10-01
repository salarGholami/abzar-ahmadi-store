import "server-only";

import { getSession } from "./auth";
import { cookies } from "next/headers";
import { mutateJson } from "./github";
import type { CustomerEvent, CustomerEventName } from "./types";

const GUEST_COOKIE = "abzar_guest_id";

/**
 * Analytics is best-effort: it must never break login, cart or checkout.
 */
export async function trackServerEvent(
  name: CustomerEventName,
  input?: {
    path?: string;
    entityId?: string;
    metadata?: Record<string, string | number | boolean | null>;
  },
) {
  try {
    const session = await getSession();
    const store = await cookies();
    const guestId = store.get(GUEST_COOKIE)?.value || null;
    const actorType = session ? "USER" : "GUEST";
    const actorId = session?.id || guestId;
    if (!actorId) return null;

    const event: CustomerEvent = {
      id: crypto.randomUUID(),
      actorType,
      actorId,
      name,
      path: input?.path,
      entityId: input?.entityId,
      metadata: input?.metadata,
      createdAt: new Date().toISOString(),
    };

    await mutateJson<CustomerEvent[], null>(
      "customer-events.json",
      [],
      (current) => ({ next: [...current.slice(-4999), event], result: null }),
      `Customer event ${name}`,
      2,
    );
    return event;
  } catch (error) {
    console.error("trackServerEvent failed", error);
    return null;
  }
}
