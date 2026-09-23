import "server-only";

import { getSession } from "./auth";
import { mutateJson } from "./github";

type AuditRow = {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  actorRole?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
};

export async function audit(
  action: string,
  input?: {
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, string | number | boolean | null>;
  },
) {
  try {
    const session = await getSession();
    const row: AuditRow = {
      id: crypto.randomUUID(),
      action,
      entityType: input?.entityType,
      entityId: input?.entityId,
      actorId: session?.id,
      actorRole: session?.role,
      metadata: input?.metadata,
      createdAt: new Date().toISOString(),
    };
    await mutateJson<AuditRow[], null>(
      "activity-logs.json",
      [],
      (current) => ({ next: [...current.slice(-4999), row], result: null }),
      `Audit ${action}`,
      2,
    );
  } catch (error) {
    console.error("audit failed", error);
  }
}
