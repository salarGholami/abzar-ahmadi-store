import "server-only";
import seed from "@/data/seed/products.json";
import type { Product, ProductImage } from "./types";
import { productRepo } from "./repositories";

export function normalizeProduct(product: Product): Product {
  const legacy = product.images?.length ? product.images : product.image ? [{ id: `legacy-${product.id}`, url: product.image, alt: product.title, path: undefined, position: 0, createdAt: product.createdAt || new Date(0).toISOString() }] : [];
  const images = [...legacy].sort((a, b) => a.position - b.position).map((image, index): ProductImage => ({ ...image, position: index }));
  return { ...product, image: images[0]?.url || product.image || "", images };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const items = await productRepo.all();
    return (items.length ? items : (seed as Product[])).map(normalizeProduct);
  } catch {
    return (seed as Product[]).map(normalizeProduct);
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  return (await getProducts()).find((p) => p.id === id) || null;
}
