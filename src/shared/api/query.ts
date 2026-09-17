import type { AxiosRequestConfig } from "axios";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type MutationKey,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { request } from "./client";

export function useApiQuery<T>(
  key: QueryKey,
  config: AxiosRequestConfig,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: key,
    queryFn: () => request<T>(config),
    ...options,
  });
}

export function useApiMutation<TData, TVariables>(
  key: MutationKey,
  config: (variables: TVariables) => AxiosRequestConfig,
  options?: UseMutationOptions<TData, Error, TVariables>,
) {
  return useMutation({
    mutationKey: key,
    mutationFn: (variables) => request<TData>(config(variables)),
    ...options,
  });
}

export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  return (key: QueryKey) => queryClient.invalidateQueries({ queryKey: key });
}
