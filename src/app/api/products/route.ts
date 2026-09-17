import { NextResponse } from "next/server";

import { listPublicProducts } from "@/domains/catalog/server";

export async function GET() {
  const products = await listPublicProducts();
  return NextResponse.json(
    { success: true, data: products },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
