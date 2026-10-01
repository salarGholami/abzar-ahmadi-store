import "server-only";

import { unstable_cache } from "next/cache";
import seed from "@/data/seed/products.json";
import { productRepo, saleItemRepo } from "@/lib/repositories";
import type { Product, ProductImage } from "@/domains/catalog/model/catalog.types";

export function normalizeProduct(product: Product): Product {
  const legacyImages = product.images?.length
    ? product.images
    : product.image
      ? [{
          id: `legacy-${product.id}`,
          url: product.image,
          alt: product.title,
          path: undefined,
          position: 0,
          createdAt: product.createdAt || new Date(0).toISOString(),
        }]
      : [];

  const images = [...legacyImages]
    .sort((a, b) => a.position - b.position)
    .map((image, index): ProductImage => ({ ...image, position: index }));

  return {
    ...product,
    image: images[0]?.url || product.image || "",
    images,
  };
}

export function toPublicProduct(product: Product): Product {
  const normalized = normalizeProduct(product);
  const { purchaseCost: _purchaseCost, supplierIds: _supplierIds, ...publicProduct } = normalized;
  return publicProduct;
}

async function loadPublicProducts(): Promise<Product[]> {
  try {
    const items = await productRepo.all();
    return (items.length ? items : (seed as Product[])).map(toPublicProduct);
  } catch {
    return (seed as Product[]).map(toPublicProduct);
  }
}

export const listPublicProducts = unstable_cache(loadPublicProducts, ["catalog:products"], { revalidate: 30, tags: ["catalog"] });

export async function getPublicProduct(id: string): Promise<Product | null> {
  const products = await listPublicProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function listBestsellers(limit = 8): Promise<Product[]> {
  const [products, items] = await Promise.all([
    listPublicProducts(),
    saleItemRepo.all().catch(() => []),
  ]);

  const soldByProduct = new Map<string, number>();
  for (const item of items) {
    soldByProduct.set(item.productId, (soldByProduct.get(item.productId) ?? 0) + item.quantity);
  }

  return products
    .filter((product) => product.stock > 0)
    .sort((a, b) => {
      const soldDiff = (soldByProduct.get(b.id) ?? 0) - (soldByProduct.get(a.id) ?? 0);
      return soldDiff || (b.rating ?? 0) - (a.rating ?? 0);
    })
    .slice(0, limit);
}
