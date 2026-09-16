import { request } from "@/shared/api/client";
import type { UserPreferences } from "@/lib/types";

export const settingsApi = {
  getPreferences: () =>
    request<UserPreferences>({ url: "/account/preferences", method: "GET" }),
  updatePreferences: (payload: Pick<UserPreferences, "theme">) =>
    request<UserPreferences>({
      url: "/account/preferences",
      method: "PATCH",
      data: payload,
    }),
  getPublic: () =>
    request<Record<string, unknown>>({ url: "/settings/public", method: "GET" }),
};
