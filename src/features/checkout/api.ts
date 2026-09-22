import { request } from "@/shared/api/client";

export const checkoutApi = {
  validateCoupon: (payload: { code: string; subtotal: number }) =>
    request<Record<string, unknown>>({ url: "/coupons/validate", method: "POST", data: payload }),
  shipping: () => request<unknown[]>({ url: "/shipping", method: "GET" }),
  createSale: (payload: Record<string, unknown>) =>
    request<Record<string, unknown>>({ url: "/sales/create", method: "POST", data: payload }),
  uploadReceipt: (formData: FormData) =>
    request<Record<string, unknown>>({ url: "/sales/receipt", method: "POST", data: formData, headers: { "Content-Type": "multipart/form-data" } }),
};
