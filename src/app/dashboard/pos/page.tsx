"use client";

import {
  Barcode,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import type { DecodeHintType, Result } from "@zxing/library";

type Product = {
  id: string;
  title: string;
  price: number;
  stock: number;
  sku?: string | null;
  barcode?: string | null;
  category?: string | null;
  brand?: string | null;
  discount?: number | null;
  image?: string | null;
  imageUrl?: string | null;
  thumbnail?: string | null;
  coverImage?: string | null;
  images?: Array<string | { url?: string | null }> | null;
};

type CartItem = Product & {
  q: number;
};

type ScannerProps = {
  open: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

function getImage(product: Product) {
  if (product.image) return product.image;
  if (product.imageUrl) return product.imageUrl;
  if (product.thumbnail) return product.thumbnail;
  if (product.coverImage) return product.coverImage;

  const first = product.images?.[0];

  if (!first) return null;

  if (typeof first === "string") {
    return first;
  }

  return first.url ?? null;
}

function getPrice(product: Product) {
  const price = Number(product.price) || 0;
  const discount = Number(product.discount ?? 0);

  if (!discount) {
    return price;
  }

  return Math.round(price - (price * discount) / 100);
}

/* -------------------------------------------------------------------------- */
/* Product Image                                                              */
/* -------------------------------------------------------------------------- */

function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const image = getImage(product);

  if (!image || failed) {
    return (
      <div className="grid h-full w-full place-items-center bg-[var(--surface-2)] text-[var(--muted)]">
        <Package size={24} />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={product.title}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Scanner                                                                    */
/* -------------------------------------------------------------------------- */

function BarcodeScanner({ open, onClose, onDetected }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const controlsRef = useRef<IScannerControls | null>(null);

  const detectedRef = useRef(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const stop = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const start = useCallback(async () => {
    setLoading(true);
    setError("");
    detectedRef.current = false;

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setLoading(false);

      setError("مرورگر شما از دسترسی به دوربین پشتیبانی نمی‌کند.");

      return;
    }

    const videoElement = videoRef.current;

    if (!videoElement) {
      setLoading(false);

      return;
    }

    try {
      // Loaded on demand so the ZXing decoder never bloats the initial
      // POS bundle — it is only needed once the scanner modal opens.
      const [{ BrowserMultiFormatReader }, zxingLibrary] = await Promise.all([
        import("@zxing/browser"),
        import("@zxing/library"),
      ]);

      const { BarcodeFormat, DecodeHintType: HintType } = zxingLibrary;

      const hints = new Map<DecodeHintType, unknown>([
        [
          HintType.POSSIBLE_FORMATS,
          [
            BarcodeFormat.EAN_13,
            BarcodeFormat.EAN_8,
            BarcodeFormat.UPC_A,
            BarcodeFormat.UPC_E,
            BarcodeFormat.CODE_128,
            BarcodeFormat.CODE_39,
            BarcodeFormat.CODE_93,
            BarcodeFormat.ITF,
          ],
        ],
        [HintType.TRY_HARDER, true],
      ]);

      const reader = new BrowserMultiFormatReader(hints);

      const controls = await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
          },
        },
        videoElement,
        (result: Result | undefined) => {
          if (detectedRef.current || !result) {
            return;
          }

          const value = result.getText().trim();

          if (!value) {
            return;
          }

          detectedRef.current = true;
          controlsRef.current?.stop();
          onDetected(value);
        },
      );

      controlsRef.current = controls;

      setLoading(false);
    } catch (err) {
      setLoading(false);

      setError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "دسترسی به دوربین رد شد. دسترسی دوربین را در مرورگر فعال کنید."
          : "دسترسی به دوربین امکان‌پذیر نیست.",
      );

      stop();
    }
  }, [onDetected, stop]);

  useEffect(() => {
    if (!open) {
      stop();
      return;
    }

    const timer = window.setTimeout(() => {
      void start();
    }, 100);

    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, [open, start, stop]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500] grid place-items-center bg-black/70 p-3 backdrop-blur-md">
      <div className="relative flex h-[min(680px,94dvh)] w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl">
        {/* Header */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 pb-10 pt-4">
          <div>
            <p className="text-sm font-black text-white">اسکن بارکد</p>

            <p className="mt-1 text-[10px] text-white/50">
              بارکد را داخل کادر قرار دهید
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-xl bg-white/10 text-white"
            aria-label="بستن اسکنر"
          >
            <X size={19} />
          </button>
        </div>

        {/* Camera */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />

          {/* Scanner frame */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-[78%] max-w-[380px] -translate-x-1/2 -translate-y-1/2">
            <div className="absolute inset-0 rounded-3xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />

            <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-[var(--primary)] shadow-[0_0_14px_var(--primary)]" />
          </div>

          {loading && (
            <div className="absolute inset-0 grid place-items-center bg-black/40">
              <div className="text-center text-white">
                <Camera size={30} className="mx-auto animate-pulse" />

                <p className="mt-3 text-xs font-bold">فعال‌سازی دوربین...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-x-4 bottom-5 rounded-2xl bg-black/80 p-4 text-center backdrop-blur-xl">
              <p className="text-xs font-bold text-white">{error}</p>

              <button
                type="button"
                onClick={() => {
                  void start();
                }}
                className="mt-3 rounded-xl bg-white px-4 py-2 text-[10px] font-black text-black"
              >
                تلاش مجدد
              </button>
            </div>
          )}
        </div>

        <div className="shrink-0 bg-black px-4 py-3 text-center text-[10px] text-white/40">
          اسکن خودکار فعال است
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Cart                                                                       */
/* -------------------------------------------------------------------------- */

function Cart({
  items,
  total,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
  onSubmit,
  submitting,
}: {
  items: CartItem[];
  total: number;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const count = items.reduce((sum, item) => sum + item.q, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Cart header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div>
          <p className="text-sm font-black text-[var(--text)]">سبد فروش</p>

          <p className="mt-0.5 text-[9px] text-[var(--muted)]">
            {count ? `${formatNumber(count)} کالا` : "سبد خالی است"}
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[9px] font-bold text-[var(--danger)]"
          >
            پاک کردن
          </button>
        )}
      </div>

      {/* Items */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <div className="grid h-full min-h-[220px] place-items-center text-center">
            <div>
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--surface-2)] text-[var(--muted)]">
                <ShoppingCart size={24} />
              </div>

              <p className="mt-3 text-xs font-black text-[var(--text)]">
                هنوز محصولی اضافه نشده
              </p>

              <p className="mt-1 text-[9px] text-[var(--muted)]">
                یک محصول را انتخاب کنید
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-[var(--surface-2)] p-2.5"
              >
                <div className="flex gap-2.5">
                  <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-[var(--surface)]">
                    <ProductImage product={item} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="line-clamp-2 flex-1 text-[10px] font-bold leading-4 text-[var(--text)]">
                        {item.title}
                      </p>

                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="text-[var(--muted)] hover:text-[var(--danger)]"
                        aria-label="حذف"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex h-7 items-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                        <button
                          type="button"
                          onClick={() => onDecrease(item.id)}
                          className="grid size-7 place-items-center text-[var(--muted)] hover:text-[var(--primary)]"
                        >
                          <Minus size={11} />
                        </button>

                        <span className="min-w-5 text-center text-[10px] font-black text-[var(--text)]">
                          {formatNumber(item.q)}
                        </span>

                        <button
                          type="button"
                          disabled={item.q >= item.stock}
                          onClick={() => onIncrease(item.id)}
                          className="grid size-7 place-items-center text-[var(--muted)] hover:text-[var(--primary)] disabled:opacity-30"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <span className="text-[10px] font-black text-[var(--text)]">
                        {formatMoney(getPrice(item) * item.q)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout */}
      <div className="shrink-0 border-t border-[var(--border)] p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--muted)]">مبلغ نهایی</span>

          <strong className="text-base font-black text-[var(--text)]">
            {formatMoney(total)}
          </strong>
        </div>

        <button
          type="button"
          disabled={items.length === 0 || submitting}
          onClick={onSubmit}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-xs font-black text-white transition hover:brightness-95 disabled:opacity-40"
        >
          <Check size={16} />

          {submitting ? "در حال ثبت..." : "ثبت فروش"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main POS                                                                   */
/* -------------------------------------------------------------------------- */

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("همه");

  const [barcode, setBarcode] = useState("");

  const [scannerOpen, setScannerOpen] = useState(false);

  const [mobileCart, setMobileCart] = useState(false);

  const barcodeRef = useRef<HTMLInputElement>(null);

  const categoriesRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------------------------------------------- */
  /* Load products                                                           */
  /* ---------------------------------------------------------------------- */

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error();
      }

      const payload: unknown = await response.json();

      if (Array.isArray(payload)) {
        setProducts(payload as Product[]);

        return;
      }

      if (
        payload &&
        typeof payload === "object" &&
        "data" in payload &&
        Array.isArray(payload.data)
      ) {
        setProducts(payload.data as Product[]);

        return;
      }

      if (
        payload &&
        typeof payload === "object" &&
        "products" in payload &&
        Array.isArray(payload.products)
      ) {
        setProducts(payload.products as Product[]);

        return;
      }

      setProducts([]);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  /* ---------------------------------------------------------------------- */
  /* Keyboard                                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "F4") {
        event.preventDefault();
        setScannerOpen(true);
      }

      if (event.key === "Escape") {
        setScannerOpen(false);
        setMobileCart(false);
      }

      if (event.key === "/" && !scannerOpen) {
        const target = event.target as HTMLElement;

        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          event.preventDefault();
          barcodeRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [scannerOpen]);

  /* ---------------------------------------------------------------------- */
  /* Categories                                                              */
  /* ---------------------------------------------------------------------- */

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category?.trim())
      .filter((value): value is string => Boolean(value));

    return ["همه", ...Array.from(new Set(values))];
  }, [products]);

  /* ---------------------------------------------------------------------- */
  /* Filter                                                                  */
  /* ---------------------------------------------------------------------- */

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        String(product.id).toLowerCase().includes(query) ||
        String(product.sku ?? "")
          .toLowerCase()
          .includes(query) ||
        String(product.barcode ?? "")
          .toLowerCase()
          .includes(query) ||
        String(product.brand ?? "")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "همه" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  /* ---------------------------------------------------------------------- */
  /* Cart calculations                                                       */
  /* ---------------------------------------------------------------------- */

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + getPrice(item) * item.q, 0),
    [cart],
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.q, 0),
    [cart],
  );

  /* ---------------------------------------------------------------------- */
  /* Add product                                                             */
  /* ---------------------------------------------------------------------- */

  function addToCart(product: Product) {
    if (product.stock <= 0) {
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (!existing) {
        return [
          ...current,
          {
            ...product,
            q: 1,
          },
        ];
      }

      if (existing.q >= product.stock) {
        return current;
      }

      return current.map((item) =>
        item.id === product.id
          ? {
              ...item,
              q: item.q + 1,
            }
          : item,
      );
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Barcode lookup                                                          */
  /* ---------------------------------------------------------------------- */

  function lookupBarcode(value: string) {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return;
    }

    const product = products.find(
      (item) =>
        String(item.barcode ?? "")
          .trim()
          .toLowerCase() === normalized,
    );

    if (!product) {
      alert("محصولی با این بارکد پیدا نشد.");

      return;
    }

    addToCart(product);
    setBarcode("");

    requestAnimationFrame(() => {
      barcodeRef.current?.focus();
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Scanner result                                                          */
  /* ---------------------------------------------------------------------- */

  function handleScannerResult(value: string) {
    setScannerOpen(false);
    lookupBarcode(value);
  }

  /* ---------------------------------------------------------------------- */
  /* Cart actions                                                            */
  /* ---------------------------------------------------------------------- */

  function increase(id: string) {
    setCart((current) =>
      current.map((item) =>
        item.id === id && item.q < item.stock
          ? {
              ...item,
              q: item.q + 1,
            }
          : item,
      ),
    );
  }

  function decrease(id: string) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                q: item.q - 1,
              }
            : item,
        )
        .filter((item) => item.q > 0),
    );
  }

  function remove(id: string) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  /* ---------------------------------------------------------------------- */
  /* Submit                                                                  */
  /* ---------------------------------------------------------------------- */

  async function submitSale() {
    if (!cart.length) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/sales/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: "مشتری حضوری",
          customerPhone: null,

          items: cart.map((item) => ({
            productId: String(item.id),
            quantity: item.q,
            price: getPrice(item),
          })),

          total,
          discount: 0,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      setCart([]);
      setMobileCart(false);

      await loadProducts();

      alert("فروش با موفقیت ثبت شد.");
    } catch {
      alert("ثبت فروش انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Category scroll                                                         */
  /* ---------------------------------------------------------------------- */

  function scrollCategories(direction: "left" | "right") {
    categoriesRef.current?.scrollBy({
      left: direction === "left" ? -260 : 260,
      behavior: "smooth",
    });
  }

  /* ---------------------------------------------------------------------- */
  /* UI                                                                       */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      <div dir="rtl" className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* ---------------------------------------------------------------- */}
        {/* Top bar                                                           */}
        {/* ---------------------------------------------------------------- */}

        <div className="shrink-0 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-black tracking-tight text-[var(--text)]">
                فروش سریع
              </h1>

              <p className="mt-1 text-[10px] text-[var(--muted)]">
                انتخاب محصول و ثبت فروش
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMobileCart(true)}
              className="relative flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-black text-[var(--text)] lg:hidden"
            >
              <ShoppingCart size={16} className="text-[var(--primary)]" />
              سبد
              {cartCount > 0 && (
                <span className="grid min-w-5 place-items-center rounded-md bg-[var(--primary)] px-1 py-0.5 text-[9px] text-white">
                  {formatNumber(cartCount)}
                </span>
              )}
            </button>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Lookup                                                           */}
          {/* -------------------------------------------------------------- */}

          <div className="mt-3 flex gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3">
              <Search size={17} className="shrink-0 text-[var(--muted)]" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجوی نام، ID یا SKU..."
                className="h-11 min-w-0 flex-1 bg-transparent text-xs font-bold text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>

            <div className="hidden items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 sm:flex sm:w-[220px]">
              <Barcode size={17} className="shrink-0 text-[var(--primary)]" />

              <input
                ref={barcodeRef}
                value={barcode}
                onChange={(event) => setBarcode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    lookupBarcode(barcode);
                  }
                }}
                placeholder="بارکد..."
                className="h-11 min-w-0 flex-1 bg-transparent text-xs font-bold text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>

            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="flex h-11 shrink-0 items-center gap-2 rounded-2xl bg-[var(--primary)] px-3 text-xs font-black text-white transition hover:brightness-95 active:scale-95"
              title="F4"
            >
              <Barcode size={18} />

              <span className="hidden sm:inline">اسکن</span>

              <kbd className="hidden rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] sm:inline">
                F4
              </kbd>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Main                                                              */}
        {/* ---------------------------------------------------------------- */}

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Products */}
          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)]">
            {/* Categories */}
            <div className="flex shrink-0 items-center gap-1 border-b border-[var(--border)] px-2 py-2">
              <button
                type="button"
                onClick={() => scrollCategories("right")}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                aria-label="دسته قبلی"
              >
                <ChevronRight size={15} />
              </button>

              <div
                ref={categoriesRef}
                className="min-w-0 flex-1 overflow-x-auto scrollbar-none"
              >
                <div className="flex w-max gap-1">
                  {categories.map((item) => {
                    const active = category === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCategory(item)}
                        className={`shrink-0 rounded-lg px-3 py-2 text-[10px] font-bold transition ${
                          active
                            ? "bg-[var(--text)] text-[var(--surface)]"
                            : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollCategories("left")}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                aria-label="دسته بعدی"
              >
                <ChevronLeft size={15} />
              </button>
            </div>

            {/* Products */}
            <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
              {loading ? (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {Array.from({
                    length: 10,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[215px] animate-pulse rounded-2xl bg-[var(--surface-2)]"
                    />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="grid h-full min-h-[280px] place-items-center">
                  <div className="text-center">
                    <Package
                      size={28}
                      className="mx-auto text-[var(--muted)]"
                    />

                    <p className="mt-3 text-xs font-black text-[var(--text)]">
                      محصولی پیدا نشد
                    </p>

                    <p className="mt-1 text-[9px] text-[var(--muted)]">
                      جستجو یا دسته را تغییر دهید.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {filteredProducts.map((product) => {
                    const price = getPrice(product);

                    const discount = Number(product.discount ?? 0);

                    const out = product.stock <= 0;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        disabled={out}
                        onClick={() => addToCart(product)}
                        className="group min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-right transition hover:-translate-y-0.5 hover:border-[var(--primary)]/50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <div className="relative h-28 bg-[var(--surface-2)]">
                          <ProductImage product={product} />

                          {discount > 0 && (
                            <span className="absolute right-2 top-2 rounded-md bg-[var(--danger)] px-1.5 py-1 text-[8px] font-black text-white">
                              {formatNumber(discount)}٪
                            </span>
                          )}

                          {!out && (
                            <span className="absolute bottom-2 left-2 grid size-7 place-items-center rounded-lg bg-[var(--surface)] text-[var(--text)] shadow-sm group-hover:bg-[var(--primary)] group-hover:text-white">
                              <Plus size={14} />
                            </span>
                          )}
                        </div>

                        <div className="p-2.5">
                          <p className="line-clamp-2 min-h-8 text-[10px] font-bold leading-4 text-[var(--text)]">
                            {product.title}
                          </p>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="truncate text-[8px] text-[var(--muted)]">
                              {product.brand || "بدون برند"}
                            </span>

                            <span
                              className={`text-[8px] font-bold ${
                                out
                                  ? "text-[var(--danger)]"
                                  : "text-[var(--success)]"
                              }`}
                            >
                              {out
                                ? "ناموجود"
                                : `${formatNumber(product.stock)} عدد`}
                            </span>
                          </div>

                          <div className="mt-2 text-[10px] font-black text-[var(--primary)]">
                            {formatMoney(price)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Desktop cart */}
          <aside className="hidden min-h-0 overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] lg:flex">
            <Cart
              items={cart}
              total={total}
              onIncrease={increase}
              onDecrease={decrease}
              onRemove={remove}
              onClear={() => setCart([])}
              onSubmit={submitSale}
              submitting={submitting}
            />
          </aside>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile cart                                                        */}
      {/* ------------------------------------------------------------------ */}

      {mobileCart && (
        <div className="fixed inset-0 z-[400] lg:hidden">
          <button
            type="button"
            onClick={() => setMobileCart(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="بستن"
          />

          <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] min-h-0 flex-col overflow-hidden rounded-t-[24px] bg-[var(--surface)]">
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <p className="text-sm font-black text-[var(--text)]">سبد فروش</p>

              <button
                type="button"
                onClick={() => setMobileCart(false)}
                className="grid size-8 place-items-center rounded-lg bg-[var(--surface-2)] text-[var(--muted)]"
              >
                <X size={16} />
              </button>
            </div>

            <Cart
              items={cart}
              total={total}
              onIncrease={increase}
              onDecrease={decrease}
              onRemove={remove}
              onClear={() => setCart([])}
              onSubmit={submitSale}
              submitting={submitting}
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Scanner                                                            */}
      {/* ------------------------------------------------------------------ */}

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleScannerResult}
      />
    </>
  );
}

