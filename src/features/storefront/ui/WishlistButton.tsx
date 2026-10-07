"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWishlist, useToggleWishlist } from "@/features/wishlist/hooks";
import { useToast } from "@/shared/ui/Toast";

export default function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const router = useRouter();
  const wishlist = useWishlist();
  const toggle = useToggleWishlist();
  const toast = useToast();
  const active = wishlist.data?.productIds.includes(productId) ?? false;

  async function handleToggle(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      await toggle.mutateAsync(productId);
      toast.success(active ? "از علاقه‌مندی‌ها حذف شد" : "به علاقه‌مندی‌ها اضافه شد");
    } catch (error) {
      if (error instanceof Error && "status" in error && (error as { status?: number }).status === 401) {
        toast.info("برای ذخیره علاقه‌مندی وارد حساب شوید");
        router.push(`/account?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      toast.error("عملیات علاقه‌مندی انجام نشد");
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => void handleToggle(e)}
      disabled={toggle.isPending}
      aria-pressed={active}
      aria-label={active ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      className={`grid size-12 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition hover:border-[var(--primary)] disabled:opacity-50 ${className}`}
    >
      <Heart size={19} className={active ? "fill-red-500 text-red-500" : "text-[var(--muted)]"} />
    </button>
  );
}
