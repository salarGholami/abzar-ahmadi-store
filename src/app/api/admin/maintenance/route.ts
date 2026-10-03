import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/permissions";
import { runMaintenanceJobs } from "@/lib/jobs";

export async function POST() {
  try {
    await requireOwner();
    return NextResponse.json({ success: true, data: await runMaintenanceJobs() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "INTERNAL_ERROR";
    const status = message === "UNAUTHENTICATED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, error: { code: message, message: status === 500 ? "خطای اجرای نگهداری سامانه" : message } }, { status });
  }
}
