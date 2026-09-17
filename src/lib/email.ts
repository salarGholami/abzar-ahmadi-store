import "server-only";

export type EmailMessage = { to: string; subject: string; html: string; text: string };
export interface EmailProvider { readonly configured: boolean; send(message: EmailMessage): Promise<void>; }

class LogEmailProvider implements EmailProvider {
  readonly configured = process.env.NODE_ENV !== "production" || process.env.EMAIL_PROVIDER === "log";
  async send(message: EmailMessage) { console.info(JSON.stringify({ event: "email.sent", to: message.to, subject: message.subject })); }
}

const provider: EmailProvider = new LogEmailProvider();
export function getEmailProvider() { return provider; }
export async function sendEmail(message: EmailMessage) {
  if (!provider.configured) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
  return provider.send(message);
}

export const emailTemplates = {
  orderCreated: (id: string, amount: number) => ({ subject: `ثبت سفارش ${id.slice(0, 8)}`, text: `سفارش شما با مبلغ ${amount.toLocaleString("fa-IR")} ثبت شد.`, html: `<p>سفارش <strong>${id.slice(0, 8)}</strong> ثبت شد.</p>` }),
  orderShipped: (id: string) => ({ subject: `سفارش ${id.slice(0, 8)} ارسال شد`, text: `سفارش شما ارسال شد.`, html: `<p>سفارش شما ارسال شد.</p>` }),
  orderDelivered: (id: string) => ({ subject: `سفارش ${id.slice(0, 8)} تحویل شد`, text: `سفارش شما تحویل شد.`, html: `<p>سفارش شما تحویل شد.</p>` }),
};
