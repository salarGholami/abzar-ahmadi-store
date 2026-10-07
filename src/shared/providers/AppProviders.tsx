"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ThemeProvider } from "@/features/settings/model/ThemeProvider";
import { CartProvider } from "@/features/cart/model/CartProvider";
import { ToastProvider } from "@/shared/ui/Toast";

export default function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
