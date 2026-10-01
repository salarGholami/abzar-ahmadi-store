import "server-only";

import { mutateJson } from "@/lib/github";
import type { StoreNotification } from "@/lib/types";
import { queueNotification } from "./notification-delivery";

export async function createNotification(input: Omit<StoreNotification, "id" | "createdAt" | "read"> & { read?: boolean }) {
  const notification: StoreNotification = {
    ...input,
    id: crypto.randomUUID(),
    read: input.read ?? false,
    createdAt: new Date().toISOString(),
  };

  await mutateJson<StoreNotification[], null>(
    "notifications.json",
    [],
    (current) => ({ next: [...current.slice(-4999), notification], result: null }),
    `Create notification ${notification.id}`,
  );

  try { await queueNotification(notification.id, ["IN_APP"]); } catch (error) { console.error("notification delivery queue failed", error); }
  return notification;
}
