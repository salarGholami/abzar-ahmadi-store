import { request } from "@/shared/api/client";

export const analyticsApi = {
  track: (payload: Record<string, unknown>) =>
    request<unknown>({ url: "/events", method: "POST", data: payload }),
};
