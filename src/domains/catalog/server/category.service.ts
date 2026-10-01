import "server-only";

import { unstable_cache } from "next/cache";
import { getJson } from "@/lib/github";
import type { Category } from "@/domains/catalog/model/catalog.types";

async function loadActiveCategories(): Promise<Category[]> {
  const result = await getJson<Category[]>("categories.json", []);
  return result.data.filter((category) => category.active !== false);
}

export const listActiveCategories = unstable_cache(loadActiveCategories, ["catalog:categories"], { revalidate: 60, tags: ["catalog"] });
