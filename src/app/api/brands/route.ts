import { NextResponse } from "next/server";

import { getJson } from "@/lib/github";

type Brand = { id: string; name: string; productsCount?: number };

export async function GET() {
  const file = await getJson<Brand[]>("brands.json", []);
  return NextResponse.json({ success: true, data: file.data });
}
