import "server-only";
import seed from "@/data/seed/products.json";
import type { Product } from "./types";
import { productRepo } from "./repositories";

export async function getProducts(): Promise<Product[]> {
  try {
    const items = await productRepo.all();
    return items.length ? items : (seed as Product[]);
  } catch {
    return seed as Product[];
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  const items = await getProducts();
  return items.find((p) => p.id === id) || null;
}
