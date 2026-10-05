import { NextResponse } from "next/server";
import { getJson } from "@/lib/github";
export async function GET() {
  const started = performance.now();
  const checks: Record<string, "ok" | "fail"> = { storage: "fail", schema: "fail" };
  try {
    await getJson<unknown[]>("settings.json", []);
    checks.storage = "ok";
    const schema = await getJson<{ version: number }>("schema-version.json", { version: 0 });
    checks.schema = schema.data.version >= 2 ? "ok" : "fail";
  } catch {}
  const ready = Object.values(checks).every(x => x === "ok");
  return NextResponse.json({ ready, checks, latencyMs: Math.round(performance.now() - started), time: new Date().toISOString() }, { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
