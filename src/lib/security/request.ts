import "server-only";

import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export function requestId(req: Request) {
  return req.headers.get("x-request-id")?.slice(0, 128) || randomUUID();
}

export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  try {
    return origin === new URL(req.url).origin;
  } catch {
    return false;
  }
}

export function enforceSameOrigin(req: Request) {
  if (!sameOrigin(req)) {
    throw new Error("CSRF_ORIGIN_MISMATCH");
  }
}

export function apiRateLimit(req: Request, scope: string, limit: number, windowMs: number) {
  const result = rateLimit(`${scope}:${clientIp(req)}`, limit, windowMs);
  return result;
}

export function withRequestId(response: NextResponse, id: string) {
  response.headers.set("x-request-id", id);
  return response;
}
