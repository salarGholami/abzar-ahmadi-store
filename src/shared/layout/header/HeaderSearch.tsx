"use client";

import { Search, Clock, TrendingUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";

type HeaderSearchProps = {
  className?: string;
  inputId: string;
  autoFocus?: boolean;
  onSubmitted?: () => void;
};

type Suggestion = {
  type: "product" | "brand" | "category" | "recent";
  label: string;
  href: string;
};

const RECENT_KEY = "abzar-search-recent";
const MAX_RECENT = 5;

const POPULAR: Suggestion[] = [
  { type: "category", label: "دریل و پیچ‌گوشتی", href: "/products?q=دریل" },
  { type: "category", label: "جوشکاری", href: "/products?q=جوش" },
  { type: "brand", label: "Bosch", href: "/products?q=Bosch" },
  { type: "brand", label: "Makita", href: "/products?q=Makita" },
  { type: "category", label: "ابزار دستی", href: "/products?q=ابزار+دستی" },
];

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  try {
    const prev = loadRecent().filter((q) => q !== query);
    localStorage.setItem(RECENT_KEY, JSON.stringify([query, ...prev].slice(0, MAX_RECENT)));
  } catch {
    /* ignore */
  }
}

export default function HeaderSearch({ className = "", inputId, autoFocus = false, onSubmitted }: HeaderSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [liveResults, setLiveResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setLiveResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products/suggest?q=${encodeURIComponent(q.trim())}`);
      if (!res.ok) throw new Error("fail");
      const data = (await res.json()) as { items?: { id: string; title: string; brand?: string }[] };
      const items = (data.items ?? []).slice(0, 6).map((p) => ({
        type: "product" as const,
        label: p.title,
        href: `/products/${p.id}`,
      }));
      setLiveResults(items);
    } catch {
      // fallback: filter popular by query
      const nq = q.trim().toLowerCase();
      setLiveResults(
        POPULAR.filter((p) => p.label.toLowerCase().includes(nq)).slice(0, 5),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setLiveResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(value);
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions]);

  const go = (query: string) => {
    const q = query.trim();
    if (q) saveRecent(q);
    setOpen(false);
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    onSubmitted?.();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    go(value);
  };

  const showPanel = open && (recent.length > 0 || liveResults.length > 0 || value.trim().length === 0);

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      <form
        role="search"
        action="/products"
        method="get"
        onSubmit={submit}
        className="group flex h-12 min-w-0 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 transition focus-within:border-[var(--primary)]/45 focus-within:bg-[var(--surface)] focus-within:ring-4 focus-within:ring-[var(--primary)]/5 hover:border-[var(--primary)]/30 lg:h-14 lg:rounded-[18px]"
      >
        <label htmlFor={inputId} className="sr-only">
          جستجو در فروشگاه
        </label>
        <Search
          size={18}
          aria-hidden
          className="shrink-0 text-[var(--muted)] group-focus-within:text-[var(--primary)]"
        />
        <input
          id={inputId}
          name="q"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setOpen(true)}
          autoFocus={autoFocus}
          enterKeyHint="search"
          autoComplete="off"
          placeholder="جستجو بین ابزارها، برندها و کد کالا..."
          className="min-w-0 flex-1 bg-transparent text-xs font-medium text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
          aria-controls={`${inputId}-suggestions`}
          aria-autocomplete="list"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setLiveResults([]);
            }}
            className="grid size-7 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
            aria-label="پاک کردن جستجو"
          >
            <X size={14} />
          </button>
        ) : null}
        <button
          type="submit"
          className="h-9 shrink-0 rounded-xl bg-[var(--primary)] px-4 text-[11px] font-black text-white transition hover:bg-[var(--primary-2)]"
        >
          جستجو
        </button>
      </form>

      {showPanel ? (
        <div
          id={`${inputId}-suggestions`}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
        >
          {value.trim().length === 0 && recent.length > 0 ? (
            <div className="border-b border-[var(--border)] p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
                <Clock size={12} />
                جستجوهای اخیر
              </p>
              <ul className="space-y-0.5">
                {recent.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => {
                        setValue(q);
                        go(q);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-right text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)]"
                    >
                      <Clock size={13} className="shrink-0 text-[var(--muted)]" />
                      <span className="truncate">{q}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {value.trim().length === 0 ? (
            <div className="p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
                <TrendingUp size={12} />
                جستجوهای محبوب
              </p>
              <ul className="space-y-0.5">
                {POPULAR.map((item) => (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)]"
                    >
                      <TrendingUp size={13} className="shrink-0 text-[var(--primary)]" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {value.trim().length >= 2 ? (
            <div className="p-3">
              {loading ? (
                <p className="py-3 text-center text-xs text-[var(--muted)]">در حال جستجو...</p>
              ) : liveResults.length > 0 ? (
                <ul className="space-y-0.5">
                  {liveResults.map((item) => (
                    <li key={item.href + item.label}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          saveRecent(value.trim());
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)]"
                      >
                        <Search size={13} className="shrink-0 text-[var(--muted)]" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => go(value)}
                      className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)]/10 px-2.5 py-2.5 text-xs font-black text-[var(--primary)] transition hover:bg-[var(--primary)]/15"
                    >
                      مشاهده همه نتایج برای «{value.trim()}»
                    </button>
                  </li>
                </ul>
              ) : (
                <p className="py-3 text-center text-xs text-[var(--muted)]">
                  نتیجه‌ای یافت نشد — Enter بزنید تا همه محصولات جستجو شوند
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
