import type { MetadataRoute } from "next";
import { listActiveCategories, listPublicProducts } from "@/domains/catalog/server";
import { absoluteUrl } from "@/lib/seo";

const STATIC_PAGES = ["/about", "/contact", "/faq", "/terms", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    listPublicProducts().catch(() => []),
    listActiveCategories().catch(() => []),
  ]);

  const newest = products
    .map((product) => new Date(product.updatedAt || product.createdAt || 0).getTime())
    .filter((time) => Number.isFinite(time) && time > 0)
    .sort((a, b) => b - a)[0];
  const storeUpdated = newest ? new Date(newest) : undefined;

  const urls: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: storeUpdated, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/products"), lastModified: storeUpdated, changeFrequency: "daily", priority: 0.9 },
  ];

  for (const category of categories.filter((item) => item.slug)) {
    const inCategory = products.filter((product) => product.category === category.name);
    const latest = inCategory
      .map((product) => new Date(product.updatedAt || product.createdAt || 0).getTime())
      .filter((time) => time > 0)
      .sort((a, b) => b - a)[0];
    urls.push({
      url: absoluteUrl(`/categories/${category.slug}`),
      lastModified: latest ? new Date(latest) : storeUpdated,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  for (const product of products) {
    const updated = product.updatedAt || product.createdAt;
    const imageUrls = (product.images?.length ? product.images.map((image) => image.url) : product.image ? [product.image] : [])
      .filter((url) => /^https?:\/\//i.test(url) || url.startsWith("/"))
      .map((url) => absoluteUrl(url))
      .slice(0, 5);
    urls.push({
      url: absoluteUrl(`/products/${product.id}`),
      lastModified: updated ? new Date(updated) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
      images: imageUrls.length ? imageUrls : undefined,
    });
  }

  for (const page of STATIC_PAGES) {
    urls.push({ url: absoluteUrl(page), changeFrequency: "monthly", priority: 0.3 });
  }

  return urls;
}
