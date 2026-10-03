import { NextResponse } from "next/server";
import { runMaintenanceJobs } from "@/lib/jobs";

export async function POST(req: Request) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || provided !== expected) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "دسترسی غیرمجاز" } }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: await runMaintenanceJobs() });
}
