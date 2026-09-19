import { request } from "@/shared/api/client";
import type { Review } from "@/lib/types";

export const reviewsApi = {
  list: (productId: string) => request<Review[]>({ url: "/reviews", method: "GET", params: { productId } }),
  create: (payload: Omit<Review, "id" | "createdAt" | "updatedAt" | "status">) =>
    request<Review>({ url: "/reviews", method: "POST", data: payload }),
};
