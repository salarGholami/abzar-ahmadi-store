"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  CircleDollarSign,
  CreditCard,
  Filter,
  Hash,
  Package,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingCart,
  Store,
  Truck,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";


import Pagination from "@/components/ui/Pagination";
import { Product, PurchasePaymentMethod, Supplier } from "@/lib/types";

/* =========================================================
   HELPERS
========================================================= */

function normalizeJalali(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .trim();
}

const numberFormatter = new Intl.NumberFormat("fa-IR");

function formatNumber(value: number) {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatMoney(value: number) {
  return `${formatNumber(value)} تومان`;
}

function getProductCost(product: Product) {
  return Number(product.purchaseCost ?? 0);
}

function getProductStock(product: Product) {
  return Number(product.stock ?? 0);
}

function getProductCategory(product: Product) {
  return product.category?.trim() || "بدون دسته‌بندی";
}

function getProductImage(product: Product) {
  if (product.image?.trim()) {
    return product.image;
  }

  const firstImage = product.images
    ?.slice()
    .sort((a, b) => a.position - b.position)[0];

  return firstImage?.url || "";
}

/* =========================================================
   TYPES
========================================================= */

type PurchaseLine = {
  productId: string;
  quantity: number;
  unitCost: number;
};

type CategoryItem = {
  name: string;
  count: number;
};

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
};

/* =========================================================
   PAGE
========================================================= */

export default function NewPurchasePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [supplierId, setSupplierId] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const [lines, setLines] = useState<PurchaseLine[]>([]);

  const [paymentMethod, setPaymentMethod] =
    useState<PurchasePaymentMethod>("CASH");

  const [checkNumber, setCheckNumber] = useState("");
  const [checkBank, setCheckBank] = useState("");
  const [checkDueDate, setCheckDueDate] = useState("");

  const [page, setPage] = useState(1);

  const pageSize = 10;

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [saving, setSaving] = useState(false);

  const [productsError, setProductsError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [supplierPanelOpen, setSupplierPanelOpen] = useState(false);

  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  /* =======================================================
     LOAD SUPPLIERS
  ======================================================= */

  const loadSuppliers = useCallback(async () => {
    try {
      setLoadingSuppliers(true);

      const response = await fetch("/api/admin/suppliers", {
        cache: "no-store",
      });

      const result: ApiResponse<Supplier[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "خطا در دریافت تأمین‌کنندگان");
      }

      setSuppliers(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "خطا در دریافت تأمین‌کنندگان",
      );
    } finally {
      setLoadingSuppliers(false);
    }
  }, []);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  const loadProducts = useCallback(async (selectedSupplierId?: string) => {
    try {
      setLoadingProducts(true);
      setProductsError("");

      const url = selectedSupplierId
        ? `/api/admin/products?supplierId=${encodeURIComponent(
            selectedSupplierId,
          )}`
        : "/api/admin/products";

      const response = await fetch(url, {
        cache: "no-store",
      });

      const result: ApiResponse<Product[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "خطا در دریافت محصولات");
      }

      setProducts(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setProductsError(
        err instanceof Error ? err.message : "خطا در دریافت محصولات",
      );

      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    void loadSuppliers();
    void loadProducts();
  }, [loadProducts, loadSuppliers]);

  /* =======================================================
     RESET PAGE WHEN FILTER CHANGES
  ======================================================= */

  useEffect(() => {
    setPage(1);
  }, [search, category, supplierId]);

  /* =======================================================
     SELECTED SUPPLIER
  ======================================================= */

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === supplierId) ?? null,
    [suppliers, supplierId],
  );

  /* =======================================================
     SUPPLIER SEARCH
  ======================================================= */

  const filteredSuppliers = useMemo(() => {
    const query = supplierSearch.trim().toLowerCase();

    if (!query) {
      return suppliers;
    }

    return suppliers.filter((supplier) => {
      return (
        supplier.name.toLowerCase().includes(query) ||
        supplier.phone.includes(query) ||
        supplier.address?.toLowerCase().includes(query)
      );
    });
  }, [supplierSearch, suppliers]);

  /* =======================================================
     SELECT SUPPLIER
  ======================================================= */

  const handleSupplierChange = async (id: string) => {
    if (id === supplierId) {
      setSupplierPanelOpen(false);
      return;
    }

    if (lines.length > 0) {
      setLines([]);

      setNotice(
        "با تغییر تأمین‌کننده، سبد خرید قبلی برای جلوگیری از ثبت اشتباه پاک شد.",
      );
    } else {
      setNotice("");
    }

    setSupplierId(id);
    setCategory("ALL");
    setSearch("");
    setPage(1);
    setError("");

    setSupplierPanelOpen(false);

    await loadProducts(id || undefined);
  };

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo<CategoryItem[]>(() => {
    const map = new Map<string, number>();

    for (const product of products) {
      const categoryName = getProductCategory(product);

      map.set(categoryName, (map.get(categoryName) || 0) + 1);
    }

    return Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }

        return a.name.localeCompare(b.name, "fa");
      });
  }, [products]);

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const productCategory = getProductCategory(product);

      const matchesCategory =
        category === "ALL" || productCategory === category;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        product.title.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        productCategory.toLowerCase().includes(query)
      );
    });
  }, [products, search, category]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  const safePage = Math.min(Math.max(page, 1), totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;

    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, safePage]);

  /* =======================================================
     LINE HELPERS
  ======================================================= */

  const getLine = (productId: string) =>
    lines.find((line) => line.productId === productId);

  const isAdded = (productId: string) =>
    lines.some((line) => line.productId === productId);

  /* =======================================================
     ADD PRODUCT
  ======================================================= */

  const addProduct = (product: Product) => {
    setError("");
    setNotice("");

    if (!supplierId) {
      setSupplierPanelOpen(true);

      setError("ابتدا تأمین‌کننده را انتخاب کنید.");

      return;
    }

    if (isAdded(product.id)) {
      setNotice("این کالا قبلاً به سبد خرید اضافه شده است.");

      return;
    }

    setLines((current) => [
      ...current,
      {
        productId: product.id,
        quantity: 1,
        unitCost: getProductCost(product),
      },
    ]);
  };

  /* =======================================================
     REMOVE PRODUCT
  ======================================================= */

  const removeProduct = (productId: string) => {
    setLines((current) =>
      current.filter((line) => line.productId !== productId),
    );
  };

  /* =======================================================
     UPDATE QUANTITY
  ======================================================= */

  const updateQuantity = (productId: string, quantity: number) => {
    if (!Number.isFinite(quantity)) {
      return;
    }

    const safeQuantity = Math.max(1, Math.floor(quantity));

    setLines((current) =>
      current.map((line) =>
        line.productId === productId
          ? {
              ...line,
              quantity: safeQuantity,
            }
          : line,
      ),
    );
  };

  /* =======================================================
     UPDATE COST
  ======================================================= */

  const updateUnitCost = (productId: string, unitCost: number) => {
    if (!Number.isFinite(unitCost)) {
      return;
    }

    setLines((current) =>
      current.map((line) =>
        line.productId === productId
          ? {
              ...line,
              unitCost: Math.max(0, unitCost),
            }
          : line,
      ),
    );
  };

  /* =======================================================
     CART PRODUCTS
  ======================================================= */

  const cartProducts = useMemo(() => {
    return lines
      .map((line) => {
        const product = products.find((item) => item.id === line.productId);

        if (!product) {
          return null;
        }

        return {
          product,
          line,
        };
      })
      .filter(
        (
          item,
        ): item is {
          product: Product;
          line: PurchaseLine;
        } => Boolean(item),
      );
  }, [lines, products]);

  /* =======================================================
     TOTAL QUANTITY
  ======================================================= */

  const totalQuantity = useMemo(() => {
    return lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  }, [lines]);

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal = useMemo(() => {
    return lines.reduce(
      (sum, line) =>
        sum + Number(line.quantity || 0) * Number(line.unitCost || 0),
      0,
    );
  }, [lines]);

  /* =======================================================
     STOCK
  ======================================================= */

  const stockCount = useMemo(() => {
    return products.reduce((sum, product) => sum + getProductStock(product), 0);
  }, [products]);

  /* =======================================================
     CATEGORY COUNT
  ======================================================= */

  const selectedCategoryCount = useMemo(() => {
    if (category === "ALL") {
      return products.length;
    }

    return products.filter(
      (product) => getProductCategory(product) === category,
    ).length;
  }, [category, products]);

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const resetFilters = () => {
    setSearch("");
    setCategory("ALL");
    setPage(1);
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const submitPurchase = async () => {
    setError("");
    setNotice("");

    if (!supplierId) {
      setError("تأمین‌کننده را انتخاب کنید.");

      setSupplierPanelOpen(true);

      return;
    }

    if (!lines.length) {
      setError("حداقل یک کالا به خرید اضافه کنید.");

      return;
    }

    if (
      lines.some(
        (line) => !Number.isFinite(line.quantity) || line.quantity <= 0,
      )
    ) {
      setError("تعداد یکی از کالاها معتبر نیست.");

      return;
    }

    if (
      lines.some((line) => !Number.isFinite(line.unitCost) || line.unitCost < 0)
    ) {
      setError("قیمت خرید یکی از کالاها معتبر نیست.");

      return;
    }

    if (paymentMethod === "CHECK") {
      if (!checkNumber.trim()) {
        setError("شماره چک را وارد کنید.");
        return;
      }

      if (!checkBank.trim()) {
        setError("نام بانک را وارد کنید.");
        return;
      }

      if (!checkDueDate) {
        setError("تاریخ سررسید چک را انتخاب کنید.");

        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        supplierId,

        supplierName: selectedSupplier?.name || "",

        items: lines,

        paymentMethod,

        check:
          paymentMethod === "CHECK"
            ? {
                number: checkNumber.trim(),
                bank: checkBank.trim(),
                dueDate: normalizeJalali(checkDueDate),
              }
            : undefined,
      };

      const response = await fetch("/api/purchases/create", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data: ApiResponse<{
        id: string;
      }> = await response.json();

      if (!response.ok || !data.success || !data.data?.id) {
        throw new Error(data.error?.message || "ثبت خرید انجام نشد.");
      }

      window.location.href = `/dashboard/purchases/${data.data.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت خرید");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen pb-24">
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-xl">
        <div className="mx-auto max-w-[1800px] px-3 py-3 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/dashboard/purchases"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] transition hover:border-[var(--primary)]"
              >
                <ArrowRight className="h-5 w-5" />
              </Link>

              <div className="min-w-0">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="badge bg-[var(--primary-light)] text-[var(--primary)]">
                    PURCHASE / NEW
                  </span>

                  <span className="hidden text-xs text-[var(--muted)] sm:inline">
                    ثبت خرید جدید
                  </span>
                </div>

                <h1 className="truncate text-lg font-black sm:text-xl">
                  ایجاد سند خرید
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <TopMetric
                icon={Store}
                label="تأمین‌کننده"
                value={selectedSupplier ? selectedSupplier.name : "انتخاب نشده"}
                active={Boolean(selectedSupplier)}
              />

              <TopMetric
                icon={Package}
                label="کالاها"
                value={formatNumber(products.length)}
              />

              <TopMetric
                icon={ShoppingCart}
                label="اقلام خرید"
                value={formatNumber(lines.length)}
                active={lines.length > 0}
              />

              <TopMetric
                icon={CircleDollarSign}
                label="مبلغ"
                value={formatMoney(subtotal)}
                active={subtotal > 0}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1800px] space-y-4 px-3 py-4 sm:px-5 lg:px-6">
        {/* =====================================================
            ALERTS
        ===================================================== */}

        {error && (
          <AlertBox type="error" message={error} onClose={() => setError("")} />
        )}

        {notice && (
          <AlertBox
            type="info"
            message={notice}
            onClose={() => setNotice("")}
          />
        )}

        {productsError && (
          <AlertBox
            type="error"
            message={productsError}
            onClose={() => setProductsError("")}
          />
        )}

        {/* =====================================================
            SUPPLIER
        ===================================================== */}

        <section className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                <Truck className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black">تأمین‌کننده خرید</h2>

                  {selectedSupplier ? (
                    <span className="badge bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                      <Check className="ml-1 h-3 w-3" />
                      انتخاب شده
                    </span>
                  ) : (
                    <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                      الزامی
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  ابتدا تأمین‌کننده را انتخاب کنید؛ سپس محصولات همان تأمین‌کننده
                  نمایش داده می‌شوند.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSupplierPanelOpen((value) => !value)}
              className="btn btn-secondary w-full lg:w-auto"
            >
              <Store className="h-4 w-4" />

              {selectedSupplier ? selectedSupplier.name : "انتخاب تأمین‌کننده"}

              <ChevronDown
                className={`h-4 w-4 transition ${
                  supplierPanelOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {selectedSupplier && (
            <div className="grid gap-3 bg-[var(--surface-2)] p-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoCell
                icon={UserRound}
                label="نام تأمین‌کننده"
                value={selectedSupplier.name}
              />

              <InfoCell
                icon={Hash}
                label="شماره تماس"
                value={selectedSupplier.phone || "—"}
              />

              <InfoCell
                icon={Truck}
                label="آدرس"
                value={selectedSupplier.address || "ثبت نشده"}
              />

              <button
                type="button"
                onClick={() => setSupplierPanelOpen(true)}
                className="flex min-h-[68px] items-center justify-between rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 text-right transition hover:border-[var(--primary)]"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--muted)]">
                    تغییر تأمین‌کننده
                  </div>

                  <div className="mt-1 text-sm font-black">
                    انتخاب تأمین‌کننده دیگر
                  </div>
                </div>

                <ChevronLeft className="h-5 w-5 text-[var(--muted)]" />
              </button>
            </div>
          )}

          {supplierPanelOpen && (
            <div className="border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="mb-3 flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

                  <input
                    value={supplierSearch}
                    onChange={(event) => setSupplierSearch(event.target.value)}
                    placeholder="جستجوی تأمین‌کننده با نام، تلفن یا آدرس..."
                    className="input pr-10"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleSupplierChange("")}
                  className="btn btn-secondary whitespace-nowrap"
                >
                  نمایش همه محصولات
                </button>
              </div>

              {loadingSuppliers ? (
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  {Array.from({
                    length: 8,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-xl bg-[var(--bg-secondary)]"
                    />
                  ))}
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <EmptyState
                  icon={Store}
                  title="تأمین‌کننده‌ای پیدا نشد"
                  description="عبارت جستجو را تغییر دهید."
                />
              ) : (
                <div className="grid max-h-[330px] gap-2 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-4">
                  {filteredSuppliers.map((supplier) => {
                    const active = supplier.id === supplierId;

                    return (
                      <button
                        key={supplier.id}
                        type="button"
                        onClick={() => void handleSupplierChange(supplier.id)}
                        className={`group flex min-h-[82px] items-center gap-3 rounded-xl border p-3 text-right transition ${
                          active
                            ? "border-[var(--primary)] bg-[var(--primary-light)]"
                            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]"
                        }`}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            active
                              ? "bg-[var(--primary)] text-white"
                              : "bg-[var(--bg-secondary)] text-[var(--muted)]"
                          }`}
                        >
                          {active ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Store className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-black">
                            {supplier.name}
                          </div>

                          <div className="mt-1 truncate text-xs text-[var(--muted)]">
                            {supplier.phone || "بدون شماره"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
          {/* ===================================================
              PRODUCTS
          =================================================== */}

          <section className="card min-w-0 overflow-hidden">
            <div className="border-b border-[var(--border)]">
              <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Boxes className="h-5 w-5 text-[var(--primary)]" />

                    <h2 className="font-black">کاتالوگ محصولات</h2>

                    <span className="badge bg-[var(--bg-secondary)] text-[var(--muted)]">
                      {formatNumber(filteredProducts.length)} کالا
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {supplierId
                      ? `محصولات تأمین‌کننده «${selectedSupplier?.name || ""}»`
                      : "تمام محصولات فروشگاه"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void loadProducts(supplierId || undefined)}
                    className="btn btn-secondary h-10 w-10 p-0"
                    title="به‌روزرسانی"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        loadingProducts ? "animate-spin" : ""
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="btn btn-secondary"
                  >
                    <X className="h-4 w-4" />
                    پاک‌سازی
                  </button>
                </div>
              </div>

              <div className="grid gap-2 border-t border-[var(--border)] bg-[var(--surface-2)] p-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

                  <input
                    value={search}
                    onChange={handleSearchChange}
                    className="input pr-10"
                    placeholder="جستجو در نام کالا، برند، SKU یا دسته‌بندی..."
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3">
                  <Filter className="h-4 w-4 text-[var(--primary)]" />

                  <span className="text-xs font-bold text-[var(--muted)]">
                    فیلتر:
                  </span>

                  <span className="text-xs font-black">
                    {category === "ALL" ? "همه دسته‌ها" : category}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border-t border-[var(--border)]">
                <div className="flex min-w-max gap-2 p-3">
                  <CategoryButton
                    active={category === "ALL"}
                    label="همه دسته‌ها"
                    count={products.length}
                    onClick={() => setCategory("ALL")}
                  />

                  {categories.map((item) => (
                    <CategoryButton
                      key={item.name}
                      active={category === item.name}
                      label={item.name}
                      count={item.count}
                      onClick={() => setCategory(item.name)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* =================================================
                PRODUCT TABLE
            ================================================= */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-right">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[11px] text-[var(--muted)]">
                    <th className="px-4 py-3 font-black">کالا</th>

                    <th className="px-3 py-3 font-black">SKU</th>

                    <th className="px-3 py-3 font-black">دسته‌بندی</th>

                    <th className="px-3 py-3 font-black">موجودی</th>

                    <th className="px-3 py-3 font-black">قیمت خرید</th>

                    <th className="px-4 py-3 text-left font-black">عملیات</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingProducts ? (
                    Array.from({
                      length: pageSize,
                    }).map((_, index) => <ProductSkeletonRow key={index} />)
                  ) : paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16">
                        <EmptyState
                          icon={Package}
                          title="محصولی پیدا نشد"
                          description={
                            supplierId
                              ? "برای این تأمین‌کننده محصولی با فیلترهای فعلی پیدا نشد."
                              : "فیلتر یا عبارت جستجو را تغییر دهید."
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((product) => {
                      const added = isAdded(product.id);

                      const line = getLine(product.id);

                      return (
                        <tr
                          key={product.id}
                          className={`border-b border-[var(--border)] transition last:border-b-0 ${
                            added
                              ? "bg-[var(--primary-light)]/45"
                              : "hover:bg-[var(--surface-2)]"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex min-w-[280px] items-center gap-3">
                              <ProductThumb product={product} />

                              <div className="min-w-0">
                                <div className="line-clamp-1 text-sm font-black">
                                  {product.title}
                                </div>

                                <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--muted)]">
                                  <span>{product.brand || "بدون برند"}</span>

                                  {product.rating ? (
                                    <>
                                      <span>•</span>

                                      <span>★ {product.rating}</span>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <span className="rounded-lg bg-[var(--bg-secondary)] px-2 py-1 font-mono text-[11px] font-bold">
                              {product.sku || "—"}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <span className="badge bg-[var(--primary-light)] text-[var(--primary)]">
                              {getProductCategory(product)}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <StockBadge stock={getProductStock(product)} />
                          </td>

                          <td className="px-3 py-3">
                            <div className="font-black">
                              {formatMoney(getProductCost(product))}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-left">
                            {added ? (
                              <div className="flex items-center justify-end gap-2">
                                <div className="flex items-center overflow-hidden rounded-xl border border-[var(--primary)] bg-[var(--surface)]">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuantity(
                                        product.id,
                                        (line?.quantity || 1) - 1,
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center hover:bg-[var(--bg-secondary)]"
                                  >
                                    −
                                  </button>

                                  <span className="min-w-10 text-center text-xs font-black">
                                    {line?.quantity || 1}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuantity(
                                        product.id,
                                        (line?.quantity || 1) + 1,
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center hover:bg-[var(--bg-secondary)]"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeProduct(product.id)}
                                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addProduct(product)}
                                className="btn btn-primary h-9 px-3 text-xs"
                              >
                                <Plus className="h-4 w-4" />
                                افزودن
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            {!loadingProducts && filteredProducts.length > 0 && (
              <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                <Pagination
                  page={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={filteredProducts.length}
                  pageSize={pageSize}
                  disabled={loadingProducts}
                />
              </div>
            )}

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="flex flex-col gap-2 border-t border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-bold text-[var(--text)]">
                  {formatNumber(filteredProducts.length)}
                </span>{" "}
                کالا مطابق فیلتر فعلی
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span>
                  دسته:
                  <b className="mr-1 text-[var(--text)]">
                    {category === "ALL" ? "همه" : category}
                  </b>
                </span>

                <span>
                  موجودی کل:
                  <b className="mr-1 text-[var(--text)]">
                    {formatNumber(stockCount)}
                  </b>
                </span>

                <span>
                  صفحه:
                  <b className="mr-1 text-[var(--text)]">
                    {formatNumber(safePage)}
                  </b>
                  از
                  <b className="mr-1 text-[var(--text)]">
                    {formatNumber(totalPages)}
                  </b>
                </span>
              </div>
            </div>
          </section>

          {/* ===================================================
              PURCHASE PANEL
          =================================================== */}

          <aside className="xl:sticky xl:top-[92px] xl:max-h-[calc(100vh-108px)] xl:overflow-y-auto">
            <section className="card overflow-hidden">
              <div className="border-b border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
                      <ShoppingCart className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-black">سبد خرید</h2>

                      <p className="text-xs text-[var(--muted)]">
                        {formatNumber(lines.length)} قلم
                        {" • "}
                        {formatNumber(totalQuantity)} عدد
                      </p>
                    </div>
                  </div>

                  {lines.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLines([])}
                      className="text-xs font-bold text-red-600 hover:underline dark:text-red-400"
                    >
                      پاک کردن
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[410px] overflow-y-auto">
                {cartProducts.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] text-[var(--muted)]">
                      <ShoppingCart className="h-6 w-6" />
                    </div>

                    <div className="font-black">سبد خرید خالی است</div>

                    <p className="mt-1 text-xs leading-6 text-[var(--muted)]">
                      از جدول محصولات، کالاهای موردنظر را اضافه کنید.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {cartProducts.map(({ product, line }) => (
                      <div key={product.id} className="p-3">
                        <div className="flex gap-3">
                          <ProductThumb product={product} small />

                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-2 text-xs font-black">
                              {product.title}
                            </div>

                            <div className="mt-1 text-[10px] text-[var(--muted)]">
                              {product.sku || "بدون SKU"}
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <div>
                                <label className="mb-1 block text-[10px] font-bold text-[var(--muted)]">
                                  تعداد
                                </label>

                                <input
                                  type="number"
                                  min={1}
                                  value={line.quantity}
                                  onChange={(event) =>
                                    updateQuantity(
                                      product.id,
                                      Number(event.target.value),
                                    )
                                  }
                                  className="input h-9 px-2 text-center text-xs"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-[10px] font-bold text-[var(--muted)]">
                                  قیمت خرید
                                </label>

                                <input
                                  type="number"
                                  min={0}
                                  value={line.unitCost}
                                  onChange={(event) =>
                                    updateUnitCost(
                                      product.id,
                                      Number(event.target.value),
                                    )
                                  }
                                  className="input h-9 px-2 text-center text-xs"
                                />
                              </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[10px] text-[var(--muted)]">
                                جمع
                              </span>

                              <span className="text-xs font-black text-[var(--primary)]">
                                {formatMoney(line.quantity * line.unitCost)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--border)] p-4">
                <div className="grid grid-cols-2 gap-2">
                  <SummaryBox
                    label="تعداد اقلام"
                    value={formatNumber(lines.length)}
                  />

                  <SummaryBox
                    label="تعداد کل"
                    value={formatNumber(totalQuantity)}
                  />

                  <SummaryBox
                    label="نوع پرداخت"
                    value={paymentMethod === "CASH" ? "نقدی" : "چکی"}
                  />

                  <SummaryBox
                    label="کالاهای دسته"
                    value={formatNumber(selectedCategoryCount)}
                  />
                </div>

                <div className="mt-3 rounded-2xl bg-[var(--dark-500)] p-4 text-white dark:bg-black">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>مبلغ نهایی خرید</span>

                    <CircleDollarSign className="h-4 w-4" />
                  </div>

                  <div className="mt-2 text-2xl font-black tracking-tight">
                    {formatMoney(subtotal)}
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--border)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <WalletCards className="h-4 w-4 text-[var(--primary)]" />

                  <h3 className="text-sm font-black">روش پرداخت</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <PaymentButton
                    active={paymentMethod === "CASH"}
                    icon={Banknote}
                    title="نقدی"
                    description="پرداخت کامل"
                    onClick={() => {
                      setPaymentMethod("CASH");

                      setCheckNumber("");
                      setCheckBank("");
                      setCheckDueDate("");
                    }}
                  />

                  <PaymentButton
                    active={paymentMethod === "CHECK"}
                    icon={CreditCard}
                    title="چکی"
                    description="ثبت چک"
                    onClick={() => setPaymentMethod("CHECK")}
                  />
                </div>
              </div>

              {paymentMethod === "CHECK" && (
                <div className="border-t border-[var(--border)] bg-amber-50/50 p-4 dark:bg-amber-950/10">
                  <div className="mb-3 flex items-center gap-2">
                    <ReceiptText className="h-4 w-4 text-amber-600" />

                    <h3 className="text-sm font-black">اطلاعات چک</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="field-label">شماره چک</label>

                      <input
                        value={checkNumber}
                        onChange={(event) => setCheckNumber(event.target.value)}
                        className="input"
                        placeholder="مثلاً 123456"
                      />
                    </div>

                    <div>
                      <label className="field-label">بانک</label>

                      <input
                        value={checkBank}
                        onChange={(event) => setCheckBank(event.target.value)}
                        className="input"
                        placeholder="نام بانک"
                      />
                    </div>

                    <div>
                      <label className="field-label">تاریخ سررسید</label>

                      <DatePicker
                        calendar={persian}
                        locale={persian_fa}
                        value={checkDueDate}
                        onChange={(date) =>
                          setCheckDueDate(date ? date.format("YYYY/MM/DD") : "")
                        }
                        format="YYYY/MM/DD"
                        calendarPosition="bottom-right"
                        placeholder="انتخاب تاریخ"
                        inputClass="input w-full cursor-pointer text-right font-bold"
                        containerClassName="w-full"
                        digits={[
                          "۰",
                          "۱",
                          "۲",
                          "۳",
                          "۴",
                          "۵",
                          "۶",
                          "۷",
                          "۸",
                          "۹",
                        ]}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
                {!supplierId && (
                  <div className="mb-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>
                      برای ثبت خرید ابتدا باید تأمین‌کننده را انتخاب کنید.
                    </span>
                  </div>
                )}

                {supplierId && lines.length === 0 && (
                  <div className="mb-3 flex gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs leading-5 text-[var(--muted)]">
                    <Package className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>حداقل یک کالا به سبد خرید اضافه کنید.</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={saving || !supplierId || lines.length === 0}
                  onClick={() => void submitPurchase()}
                  className="btn btn-primary w-full py-3.5"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      در حال ثبت...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      ثبت نهایی خرید
                    </>
                  )}
                </button>

                <Link
                  href="/dashboard/purchases"
                  className="mt-2 flex h-10 items-center justify-center rounded-xl text-xs font-bold text-[var(--muted)] hover:bg-[var(--bg-secondary)]"
                >
                  انصراف و بازگشت
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* =====================================================
          MOBILE CART BUTTON
      ===================================================== */}

      <div className="fixed bottom-3 left-3 right-3 z-50 xl:hidden">
        <button
          type="button"
          onClick={() => setMobileCartOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-2xl bg-[var(--dark-500)] px-4 py-3 text-white shadow-2xl dark:bg-black"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />

              {lines.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-black">
                  {lines.length}
                </span>
              )}
            </div>

            <div className="text-right">
              <div className="text-xs text-white/60">جمع خرید</div>

              <div className="font-black">{formatMoney(subtotal)}</div>
            </div>
          </div>

          <span className="flex items-center gap-1 text-xs font-black">
            {mobileCartOpen ? "بستن" : "مشاهده سبد"}

            <ChevronLeft
              className={`h-4 w-4 transition ${
                mobileCartOpen ? "-rotate-90" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* =====================================================
          MOBILE CART
      ===================================================== */}

      {mobileCartOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 xl:hidden">
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto rounded-t-3xl bg-[var(--surface)] shadow-2xl"
            dir="rtl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="font-black">سبد خرید</div>

              <button
                type="button"
                onClick={() => setMobileCartOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-secondary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              {cartProducts.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  title="سبد خرید خالی است"
                  description="کالاها را از لیست محصولات اضافه کنید."
                />
              ) : (
                <div className="space-y-3">
                  {cartProducts.map(({ product, line }) => (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-[var(--border)] p-3"
                    >
                      <div className="flex gap-3">
                        <ProductThumb product={product} small />

                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-black">
                            {product.title}
                          </div>

                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                              <label className="field-label">تعداد</label>

                              <input
                                type="number"
                                min={1}
                                value={line.quantity}
                                onChange={(event) =>
                                  updateQuantity(
                                    product.id,
                                    Number(event.target.value),
                                  )
                                }
                                className="input"
                              />
                            </div>

                            <div>
                              <label className="field-label">قیمت خرید</label>

                              <input
                                type="number"
                                min={0}
                                value={line.unitCost}
                                onChange={(event) =>
                                  updateUnitCost(
                                    product.id,
                                    Number(event.target.value),
                                  )
                                }
                                className="input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
                        <span className="text-xs text-[var(--muted)]">جمع</span>

                        <span className="font-black text-[var(--primary)]">
                          {formatMoney(line.quantity * line.unitCost)}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-2xl bg-[var(--dark-500)] p-4 text-white dark:bg-black">
                    <div className="text-xs text-white/60">مبلغ نهایی</div>

                    <div className="mt-1 text-2xl font-black">
                      {formatMoney(subtotal)}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={saving || !supplierId || lines.length === 0}
                    onClick={() => void submitPurchase()}
                    className="btn btn-primary w-full py-3.5"
                  >
                    {saving ? "در حال ثبت..." : "ثبت نهایی خرید"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   TOP METRIC
========================================================= */

function TopMetric({
  icon: Icon,
  label,
  value,
  active = false,
}: {
  icon: typeof Store;
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon
          className={`h-3.5 w-3.5 shrink-0 ${
            active ? "text-[var(--primary)]" : "text-[var(--muted)]"
          }`}
        />

        <span className="truncate text-[10px] font-bold text-[var(--muted)]">
          {label}
        </span>
      </div>

      <div className="mt-1 truncate text-xs font-black">{value}</div>
    </div>
  );
}

/* =========================================================
   INFO CELL
========================================================= */

function InfoCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Store;
  label: string;
  value: string;
}) {
  return (
    <div className="min-h-[68px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted)]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>

      <div className="mt-1 truncate text-xs font-black">{value}</div>
    </div>
  );
}

/* =========================================================
   CATEGORY BUTTON
========================================================= */

function CategoryButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-black transition ${
        active
          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]"
      }`}
    >
      <span>{label}</span>

      <span
        className={`rounded-lg px-1.5 py-0.5 text-[10px] ${
          active
            ? "bg-white/20"
            : "bg-[var(--bg-secondary)] text-[var(--muted)]"
        }`}
      >
        {formatNumber(count)}
      </span>
    </button>
  );
}

/* =========================================================
   PRODUCT THUMB
========================================================= */

function ProductThumb({
  product,
  small = false,
}: {
  product: Product;
  small?: boolean;
}) {
  const image = getProductImage(product);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)] ${
        small ? "h-11 w-11" : "h-12 w-12"
      }`}
    >
      {image ? (
        <img
          src={image}
          alt={product.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
          <Package className={small ? "h-4 w-4" : "h-5 w-5"} />
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STOCK BADGE
========================================================= */

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="badge bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">
        ناموجود
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
        {formatNumber(stock)} کم
      </span>
    );
  }

  return (
    <span className="badge bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
      {formatNumber(stock)}
    </span>
  );
}

/* =========================================================
   PAYMENT BUTTON
========================================================= */

function PaymentButton({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: typeof Banknote;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-right transition ${
        active
          ? "border-[var(--primary)] bg-[var(--primary-light)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={`h-4 w-4 ${
            active ? "text-[var(--primary)]" : "text-[var(--muted)]"
          }`}
        />

        <span className="text-xs font-black">{title}</span>
      </div>

      <div className="mt-1 text-[10px] text-[var(--muted)]">{description}</div>
    </button>
  );
}

/* =========================================================
   SUMMARY BOX
========================================================= */

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <div className="text-[10px] font-bold text-[var(--muted)]">{label}</div>

      <div className="mt-1 text-xs font-black">{value}</div>
    </div>
  );
}

/* =========================================================
   PRODUCT SKELETON
========================================================= */

function ProductSkeletonRow() {
  return (
    <tr className="border-b border-[var(--border)]">
      <td className="px-4 py-4" colSpan={6}>
        <div className="flex animate-pulse items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-[var(--bg-secondary)]" />

          <div className="flex-1">
            <div className="h-3 w-1/3 rounded bg-[var(--bg-secondary)]" />

            <div className="mt-2 h-2 w-1/5 rounded bg-[var(--bg-secondary)]" />
          </div>

          <div className="h-8 w-20 rounded bg-[var(--bg-secondary)]" />
        </div>
      </td>
    </tr>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Package;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] text-[var(--muted)]">
        <Icon className="h-6 w-6" />
      </div>

      <div className="font-black">{title}</div>

      <p className="mt-1 max-w-sm text-xs leading-6 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   ALERT
========================================================= */

function AlertBox({
  type,
  message,
  onClose,
}: {
  type: "error" | "info";
  message: string;
  onClose: () => void;
}) {
  const isError = type === "error";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400"
          : "border-[var(--primary)]/20 bg-[var(--primary-light)] text-[var(--primary-dark)]"
      }`}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      )}

      <div className="flex-1 leading-6">{message}</div>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
