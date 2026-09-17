import "server-only";

export type MessageChannel = "EMAIL" | "SMS";

export type MessageInput = {
  to: string;
  subject?: string;
  body: string;
};

export interface MessagingProvider {
  readonly channel: MessageChannel;
  send(input: MessageInput): Promise<{ accepted: boolean; providerMessageId: string | null }>;
}

class DemoMessagingProvider implements MessagingProvider {
  constructor(public readonly channel: MessageChannel) {}

  async send() {
    return { accepted: false, providerMessageId: null };
  }
}

export function getMessagingProvider(channel: MessageChannel): MessagingProvider {
  // Provider adapter is intentionally local for MVP. SMTP/SMS vendors can be injected later.
  return new DemoMessagingProvider(channel);
}
