import "server-only";
import { createHash } from "node:crypto";
import { getJson, withConflictRetry, batchCommit } from "./github";
import type { IdempotencyRecord } from "./types";

export function hashPayload(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export async function executeIdempotent<T>(input: { key: string; scope: string; actorId?: string | null; payload: unknown }, handler: () => Promise<T>): Promise<T> {
  const key = input.key.trim();
  if (key.length < 8 || key.length > 128) throw new Error("INVALID_IDEMPOTENCY_KEY");
  const requestHash = hashPayload(input.payload);
  const existing = await getJson<IdempotencyRecord[]>("idempotency.json", []);
  const hit = existing.data.find(x => x.key === key && x.scope === input.scope && x.actorId === (input.actorId ?? null));
  if (hit) {
    if (hit.requestHash !== requestHash) throw new Error("IDEMPOTENCY_PAYLOAD_MISMATCH");
    if (hit.status === "COMPLETED") return hit.response as T;
    if (hit.status === "IN_PROGRESS") throw new Error("IDEMPOTENCY_IN_PROGRESS");
  }
  const id = hit?.id ?? crypto.randomUUID();
  await withConflictRetry(async () => {
    const f = await getJson<IdempotencyRecord[]>("idempotency.json", []);
    if (f.data.some(x => x.key === key && x.scope === input.scope && x.actorId === (input.actorId ?? null) && x.status === "IN_PROGRESS")) throw new Error("IDEMPOTENCY_IN_PROGRESS");
    const now = new Date().toISOString();
    const row: IdempotencyRecord = { id, key, scope: input.scope, actorId: input.actorId ?? null, requestHash, status: "IN_PROGRESS", createdAt: hit?.createdAt ?? now, updatedAt: now };
    const next = f.data.filter(x => x.id !== id); next.push(row);
    await batchCommit([{ path: "idempotency.json", data: next.slice(-5000), message: `Start idempotency ${key}`, expectedSha: f.sha || undefined }]);
  });
  try {
    const response = await handler();
    await withConflictRetry(async () => {
      const f = await getJson<IdempotencyRecord[]>("idempotency.json", []);
      const next = f.data.map(x => x.id === id ? { ...x, status: "COMPLETED" as const, response, updatedAt: new Date().toISOString() } : x);
      await batchCommit([{ path: "idempotency.json", data: next, message: `Complete idempotency ${key}`, expectedSha: f.sha || undefined }]);
    });
    return response;
  } catch (error) {
    await withConflictRetry(async () => {
      const f = await getJson<IdempotencyRecord[]>("idempotency.json", []);
      const next = f.data.map(x => x.id === id ? { ...x, status: "FAILED" as const, updatedAt: new Date().toISOString() } : x);
      await batchCommit([{ path: "idempotency.json", data: next, message: `Fail idempotency ${key}`, expectedSha: f.sha || undefined }]);
    }).catch(() => undefined);
    throw error;
  }
}
