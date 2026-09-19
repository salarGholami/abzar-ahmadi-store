import { request } from "@/shared/api/client";

export type WishlistData = { productIds: string[] };

export const wishlistApi = {
  get: () => request<WishlistData>({ url: "/wishlist", method: "GET" }),
  toggle: (productId: string) => request<WishlistData>({ url: "/wishlist", method: "POST", data: { productId } }),
};
