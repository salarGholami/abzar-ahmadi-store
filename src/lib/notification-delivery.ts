import "server-only";
import { notificationDeliveryRepo } from "./repositories";
import { sendEmail } from "./email";

export async function queueNotification(notificationId: string, channels: Array<"IN_APP" | "EMAIL" | "SMS"> = ["IN_APP"]) {
  return Promise.all(channels.map(channel => notificationDeliveryRepo.create({ notificationId, channel, status: "QUEUED", attempts: 0, lastError: null, sentAt: null })));
}

export async function deliverEmail(deliveryId: string, message: { to: string; subject: string; html: string; text: string }) {
  const row = await notificationDeliveryRepo.find(deliveryId);
  if (!row) throw new Error("NOT_FOUND");
  try {
    await sendEmail(message);
    return notificationDeliveryRepo.update(deliveryId, { status: "SENT", attempts: row.attempts + 1, sentAt: new Date().toISOString(), lastError: null });
  } catch (error) {
    return notificationDeliveryRepo.update(deliveryId, { status: "FAILED", attempts: row.attempts + 1, lastError: error instanceof Error ? error.message : "EMAIL_ERROR" });
  }
}
