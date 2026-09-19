"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWishlist, useToggleWishlist } from "@/features/wishlist/hooks";

export default function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const router = useRouter();
  const wishlist = useWishlist();
  const toggle = useToggleWishlist();
  const active = wishlist.data?.productIds.includes(productId) ?? false;

  async function handleToggle() {
    try {
      await toggle.mutateAsync(productId);
    } catch (error) {
      if (error instanceof Error && "status" in error && (error as { status?: number }).status === 401) {
        router.push(`/account?next=${encodeURIComponent(window.location.pathname)}`);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={toggle.isPending}
      aria-pressed={active}
      aria-label={active ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      className={`grid size-12 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition hover:border-[var(--primary)] disabled:opacity-50 ${className}`}
    >
      <Heart size={19} className={active ? "fill-red-500 text-red-500" : "text-[var(--muted)]"} />
    </button>
  );
}
