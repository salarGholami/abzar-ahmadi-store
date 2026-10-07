import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/domains/catalog/server";
import type { CatalogQuery } from "@/domains/catalog/model/catalog-query";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  try {
    const query: CatalogQuery = {
      q,
      category: "",
      brand: "",
      sort: "popular",
      availableOnly: false,
      maxPrice: null,
      page: 1,
    };

    const result = await searchCatalog(query);
    const items = result.items.slice(0, 6).map((p) => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
