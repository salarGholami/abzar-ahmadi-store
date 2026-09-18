import "server-only";
import seed from "@/data/seed/products.json";
import type { Product, ProductImage } from "./types";
import { productRepo, saleItemRepo } from "./repositories";

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

/**
 * Products ranked by actual historical sold quantity (from sale-items.json).
 * Falls back to rating-based ranking so the homepage still has a "بهترین‌ها"
 * row before any real sales exist (fresh demo/store).
 */
export async function getBestsellers(limit = 8): Promise<Product[]> {
  const [products, items] = await Promise.all([getProducts(), saleItemRepo.all().catch(() => [])]);
  const qtyByProduct = new Map<string, number>();
  for (const item of items) qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) || 0) + item.quantity);

  const inStock = products.filter((p) => p.stock > 0);
  const ranked = [...inStock].sort((a, b) => {
    const soldDiff = (qtyByProduct.get(b.id) || 0) - (qtyByProduct.get(a.id) || 0);
    if (soldDiff !== 0) return soldDiff;
    return (b.rating || 0) - (a.rating || 0);
  });
  return ranked.slice(0, limit);
}
