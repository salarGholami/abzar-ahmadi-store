import type { ReactNode } from "react";

import { listActiveCategories } from "@/domains/catalog/server";
import MobileBottomNav from "@/shared/layout/MobileBottomNav";
import StoreFooter from "@/shared/layout/StoreFooter";
import StoreHeader from "@/shared/layout/StoreHeader";

/** Single public shell (header, footer, bottom nav, cart runtime) shared by every storefront route group. */
export default async function StoreShell({ children }: { children: ReactNode }) {
  const categories = await listActiveCategories().catch(() => []);
  const navCategories = categories.map(({ id, name, slug, image }) => ({
    id,
    name,
    slug,
    image: image || null,
  }));

  return (
      <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-white"
        >
          پرش به محتوای اصلی
        </a>
        <StoreHeader categories={navCategories} />
        <div id="main-content" className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          {children}
        </div>
        <StoreFooter />
        <MobileBottomNav />
      </div>
  );
}
