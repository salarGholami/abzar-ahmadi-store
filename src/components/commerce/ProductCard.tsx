"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, PackageCheck, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ p }: { p: Product }) {
  const { add, setQty, lines } = useCart();
  const line = lines.find((item) => item.productId === p.id);
  const quantity = line?.qty ?? 0;
  const final = Math.round(p.price * (1 - p.discount / 100));

  function handleAdd() {
    if (p.stock > 0) add(p, 1);
  }

  function decrease() {
    if (!line) return;
    if (line.qty <= 1) {
      setQty(p.id, 0);
      return;
    }
    setQty(p.id, line.qty - 1);
  }

  return (
    <article className="group card overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      <Link href={`/products/${p.id}`} className="block">
        <div className="relative aspect-[1.12] overflow-hidden bg-[var(--surface-2)]">
          <Image src={p.images?.[0]?.url || p.image || "/placeholder-product.svg"} alt={p.title} fill unoptimized className="object-cover transition duration-500 group-hover:scale-105" />
          <Image src={p.images?.[1]?.url || p.images?.[0]?.url || p.image || "/placeholder-product.svg"} alt="" fill unoptimized className="object-cover opacity-0 transition duration-500 group-hover:opacity-100 group-hover:scale-105" aria-hidden="true" />
          {p.discount > 0 && <span className="badge absolute right-3 top-3 bg-red-500 text-white">٪{p.discount} تخفیف</span>}
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <span className="truncate">{p.brand}</span>
          <span className="shrink-0">{p.sku}</span>
        </div>
        <Link href={`/products/${p.id}`} className="block min-h-12 font-extrabold leading-6 hover:text-[var(--primary)]">{p.title}</Link>
        <div className="mt-3 flex items-center gap-2 text-xs"><PackageCheck size={15} className="text-[var(--success)]" />{p.stock > 0 ? `موجودی ${p.stock} عدد` : "ناموجود"}</div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            {p.discount > 0 && <div className="text-xs text-[var(--muted)] line-through">{p.price.toLocaleString("fa-IR")} تومان</div>}
            <div className="text-lg font-black">{final.toLocaleString("fa-IR")} <span className="text-xs font-normal">تومان</span></div>
          </div>

          {quantity > 0 ? (
            <div className="flex h-11 shrink-0 items-center overflow-hidden rounded-xl border border-[var(--primary)] bg-[var(--primary)] text-white">
              <button type="button" onClick={decrease} className="grid size-10 place-items-center hover:bg-black/10" aria-label="کاهش تعداد"><Minus size={16} /></button>
              <span className="min-w-8 text-center text-sm font-black" aria-label={`تعداد ${quantity}`}>{quantity.toLocaleString("fa-IR")}</span>
              <button type="button" onClick={handleAdd} disabled={quantity >= p.stock} className="grid size-10 place-items-center hover:bg-black/10 disabled:opacity-40" aria-label="افزایش تعداد"><Plus size={16} /></button>
            </div>
          ) : (
            <button onClick={handleAdd} disabled={p.stock <= 0} type="button" className="btn btn-primary !h-11 !px-3 disabled:opacity-50" aria-label="افزودن به سبد">
              <ShoppingCart size={17} />
              <span className="hidden sm:inline">افزودن</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
