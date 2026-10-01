"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Wishlist stored in the backend (per logged-in user). Guests are sent to the login page. */
export default function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/wishlist", { cache: "no-store" })
      .then((response) => response.json())
      .then((json) => {
        if (!cancelled && json?.success) setActive((json.data.productIds as string[]).includes(productId));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (response.status === 401) {
        router.push(`/account?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      const json = await response.json();
      if (json?.success) setActive(Boolean(json.data.added));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={active}
      aria-label={active ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      className={`grid size-12 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition hover:border-[var(--primary)] disabled:opacity-50 ${className}`}
    >
      <Heart size={19} className={active ? "fill-red-500 text-red-500" : "text-[var(--muted)]"} />
    </button>
  );
}
