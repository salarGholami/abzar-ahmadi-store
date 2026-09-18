"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

export default function ProductActions({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (outOfStock) return;
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }
  function handleBuyNow() {
    if (outOfStock) return;
    add(product, 1);
    router.push("/cart");
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button type="button" onClick={handleAdd} disabled={outOfStock} className="btn btn-primary py-3 disabled:opacity-50">
        {added ? <CheckCircle2 size={19} /> : <ShoppingCart size={19} />}
        {outOfStock ? "ناموجود" : added ? "به سبد اضافه شد" : "افزودن به سبد"}
      </button>
      <button type="button" onClick={handleBuyNow} disabled={outOfStock} className="btn btn-secondary py-3 disabled:opacity-50"><CheckCircle2 size={19} />خرید سریع</button>
    </div>
  );
}
