"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type HeaderSearchProps = {
  className?: string;
  inputId: string;
  autoFocus?: boolean;
  onSubmitted?: () => void;
};

export default function HeaderSearch({ className = "", inputId, autoFocus = false, onSubmitted }: HeaderSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = value.trim();
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
    onSubmitted?.();
  };

  return (
    <form
      role="search"
      action="/products"
      method="get"
      onSubmit={submit}
      className={`group flex h-12 min-w-0 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 transition focus-within:border-[var(--primary)]/45 focus-within:bg-[var(--surface)] focus-within:ring-4 focus-within:ring-[var(--primary)]/5 hover:border-[var(--primary)]/30 lg:h-14 lg:rounded-[18px] ${className}`}
    >
      <label htmlFor={inputId} className="sr-only">جستجو در فروشگاه</label>
      <Search size={18} aria-hidden className="shrink-0 text-[var(--muted)] group-focus-within:text-[var(--primary)]" />
      <input
        id={inputId}
        name="q"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoFocus={autoFocus}
        enterKeyHint="search"
        autoComplete="off"
        placeholder="جستجو بین ابزارها، برندها و کد کالا..."
        className="min-w-0 flex-1 bg-transparent text-xs font-medium text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
      />
      <button type="submit" className="h-9 shrink-0 rounded-xl bg-[var(--primary)] px-4 text-[11px] font-black text-white transition hover:bg-[var(--primary-2)]">
        جستجو
      </button>
    </form>
  );
}
