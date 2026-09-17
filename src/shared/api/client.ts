import axios, { AxiosError, type AxiosRequestConfig } from "axios";

export type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: { code?: string; message?: string } };

export class ApiClientError extends Error {
  readonly code?: string;
  readonly status?: number;

  constructor(message: string, options?: { code?: string; status?: number }) {
    super(message);
    this.name = "ApiClientError";
    this.code = options?.code;
    this.status = options?.status;
  }
}

const baseURL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(/\/+$/, "");

export const apiClient = axios.create({
  baseURL,
  timeout: 20_000,
  headers: { Accept: "application/json" },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    const payload = error.response?.data;
    const message =
      payload && !payload.success
        ? payload.error?.message || "خطا در ارتباط با سرور."
        : error.message || "خطا در ارتباط با سرور.";

    return Promise.reject(
      new ApiClientError(message, {
        code: payload && !payload.success ? payload.error?.code : undefined,
        status: error.response?.status,
      }),
    );
  },
);

export async function request<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.request<ApiEnvelope<T>>(config);
  const payload = response.data;

  if (!payload.success) {
    throw new ApiClientError(payload.error?.message || "درخواست ناموفق بود.", {
      code: payload.error?.code,
      status: response.status,
    });
  }

  return payload.data;
}
