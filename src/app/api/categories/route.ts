import { NextResponse } from "next/server";
import { getJson } from "@/lib/github";
import type { Category } from "@/lib/types";

export async function GET() {
  const file = await getJson<Category[]>("categories.json", []);
  return NextResponse.json({ success: true, data: file.data.filter((category) => category.active !== false) }, {
    headers: { "Cache-Control": "no-store" }
  });
}
