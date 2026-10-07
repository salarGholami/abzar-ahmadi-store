import { request } from "@/shared/api/client";
import type { AppUser, Customer } from "@/lib/types";

export type AuthPayload = { phone: string; password: string; name?: string; role?: "CUSTOMER" | "SUPPLIER" };

export type ResetPasswordPayload = {
  phone: string;
  code: string;
  newPassword: string;
};

export const authApi = {
  me: () => request<AppUser | null>({ url: "/auth/me", method: "GET" }),
  login: (payload: AuthPayload) =>
    request<{ user: AppUser }>({ url: "/auth/login", method: "POST", data: payload }),
  register: (payload: AuthPayload) =>
    request<{ user: AppUser; customer?: Customer }>({ url: "/auth/register", method: "POST", data: payload }),
  resetPassword: (payload: ResetPasswordPayload) =>
    request<{ reset: boolean; phone: string }>({ url: "/auth/reset-password", method: "POST", data: payload }),
  logout: () => request<unknown>({ url: "/auth/logout", method: "POST" }),
};
