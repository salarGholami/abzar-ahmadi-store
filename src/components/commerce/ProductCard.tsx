"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, PackageCheck } from "lucide-react";
import type { Product } from "@/lib/types";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ p }: { p: Product }) {
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const final = Math.round(p.price * (1 - p.discount / 100));

  function handleAdd() {
    if (p.stock <= 0) return;
    add(p, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group card overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/products/${p.id}`} className="block">
        <div className="relative aspect-[1.15] overflow-hidden bg-[var(--surface-2)]">
          <Image src={p.image} alt={p.title} fill unoptimized className="object-cover transition duration-500 group-hover:scale-105" />
          {p.discount > 0 && <span className="badge absolute right-3 top-3 bg-red-500 text-white">٪{p.discount} تخفیف</span>}
        </div>
      </Link>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]"><span>{p.brand}</span><span>{p.sku}</span></div>
        <Link href={`/products/${p.id}`} className="block min-h-12 font-extrabold leading-6 hover:text-[var(--primary)]">{p.title}</Link>
        <div className="mt-3 flex items-center gap-2 text-xs"><PackageCheck size={15} className="text-[var(--success)]" />{p.stock > 0 ? `موجودی ${p.stock} عدد` : "ناموجود"}</div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>{p.discount > 0 && <div className="text-xs text-[var(--muted)] line-through">{p.price.toLocaleString("fa-IR")} تومان</div>}<div className="text-lg font-black">{final.toLocaleString("fa-IR")} <span className="text-xs font-normal">تومان</span></div></div>
          <button onClick={handleAdd} disabled={p.stock <= 0} type="button" className="btn btn-primary !p-2.5 disabled:opacity-50" aria-label="افزودن به سبد">{added ? <PackageCheck size={18} /> : <ShoppingCart size={18} />}</button>
        </div>
      </div>
    </div>
  );
}
