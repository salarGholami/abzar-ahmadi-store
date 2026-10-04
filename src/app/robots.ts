import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/api/",
          "/account",
          "/register",
          "/cart",
          "/orders",
          "/*?q=",
          "/*?sort=",
          "/*&sort=",
          "/*&q=",
          "/*?brand=",
          "/*&brand=",
          "/*?category=",
          "/*?stock=",
          "/*&stock=",
          "/*?maxPrice=",
          "/*&maxPrice=",
          "/checkout",
          "/customer/",
          "/supplier/",
          "/wishlist",
          "/compare",
          "/order-tracking",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
