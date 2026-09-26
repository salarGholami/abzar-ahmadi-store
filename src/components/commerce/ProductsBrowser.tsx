"use client";

import {
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  ChevronDown,
  ChevronLeft,
  Filter,
  Grid2X2,
  ListFilter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ProductCard from "@/components/commerce/ProductCard";
import type { Category, Product } from "@/lib/types";

/* =========================================================
   TYPES
========================================================= */

type Sort = "popular" | "cheap" | "expensive" | "stock";

type StockFilter = "all" | "available";

type Props = {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialBrand?: string;
  initialQuery?: string;
  initialPage?: number;
};

const PAGE_SIZE = 20;

/* =========================================================
   MAIN
========================================================= */

export default function ProductsBrowser({
  products,
  categories,
  initialCategory,
  initialBrand,
  initialQuery,
  initialPage = 1,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* =======================================================
     INITIAL URL VALUES
  ======================================================= */

  const urlPage = Number.parseInt(searchParams.get("page") ?? "", 10);

  const safeInitialPage =
    Number.isFinite(urlPage) && urlPage > 0
      ? urlPage
      : Math.max(1, initialPage);

  const initialSort = searchParams.get("sort");
  const initialStock = searchParams.get("stock");

  const initialMaxPrice = Number.parseInt(
    searchParams.get("maxPrice") ?? "",
    10,
  );

  /* =======================================================
     STATE
  ======================================================= */

  const [query, setQueryState] = useState(initialQuery ?? "");

  const [category, setCategoryState] = useState(
    initialCategory ?? "all",
  );

  const [brand, setBrandState] = useState(initialBrand ?? "all");

  const [sort, setSortState] = useState<Sort>(
    initialSort === "cheap" ||
      initialSort === "expensive" ||
      initialSort === "stock"
      ? initialSort
      : "popular",
  );

  const [stock, setStockState] = useState<StockFilter>(
    initialStock === "available" ? "available" : "all",
  );

  const [maxPrice, setMaxPriceState] = useState<number | null>(
    Number.isFinite(initialMaxPrice) && initialMaxPrice >= 0
      ? initialMaxPrice
      : null,
  );

  const [page, setPage] = useState(safeInitialPage);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(true);

  const [brandSearch, setBrandSearch] = useState("");

  /* =======================================================
     URL
  ======================================================= */

  const replaceUrl = (
    changes: Record<string, string | null>,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();

    router.replace(
      queryString ? `${pathname}?${queryString}` : pathname,
      {
        scroll: false,
      },
    );
  };

  const changeFilter = (
    changes: Record<string, string | null>,
  ) => {
    setPage(1);

    replaceUrl({
      ...changes,
      page: "1",
    });
  };

  /* =======================================================
     SETTERS
  ======================================================= */

  const setQuery = (value: string) => {
    setQueryState(value);

    setPage(1);

    replaceUrl({
      q: value.trim() || null,
      page: "1",
    });
  };

  const setCategory = (value: string) => {
    setCategoryState(value);

    changeFilter({
      category: value === "all" ? null : value,
    });
  };

  const setBrand = (value: string) => {
    setBrandState(value);

    changeFilter({
      brand: value === "all" ? null : value,
    });
  };

  const setSort = (value: Sort) => {
    setSortState(value);

    changeFilter({
      sort: value === "popular" ? null : value,
    });
  };

  const setStock = (value: StockFilter) => {
    setStockState(value);

    changeFilter({
      stock: value === "all" ? null : value,
    });
  };

  const setMaxPrice = (value: number | null) => {
    setMaxPriceState(value);

    changeFilter({
      maxPrice:
        value === null
          ? null
          : String(Math.max(0, Math.round(value))),
    });
  };

  /* =======================================================
     SYNC URL -> STATE
  ======================================================= */

  useEffect(() => {
    const nextQuery =
      searchParams.get("q") ?? initialQuery ?? "";

    const nextCategory =
      searchParams.get("category") ??
      initialCategory ??
      "all";

    const nextBrand =
      searchParams.get("brand") ??
      initialBrand ??
      "all";

    const nextSort = searchParams.get("sort");

    const nextStock = searchParams.get("stock");

    const nextMaxPrice = Number.parseInt(
      searchParams.get("maxPrice") ?? "",
      10,
    );

    const nextPage = Number.parseInt(
      searchParams.get("page") ?? "",
      10,
    );

    setQueryState(nextQuery);

    setCategoryState(nextCategory);

    setBrandState(nextBrand);

    setSortState(
      nextSort === "cheap" ||
        nextSort === "expensive" ||
        nextSort === "stock"
        ? nextSort
        : "popular",
    );

    setStockState(
      nextStock === "available"
        ? "available"
        : "all",
    );

    setMaxPriceState(
      Number.isFinite(nextMaxPrice) && nextMaxPrice >= 0
        ? nextMaxPrice
        : null,
    );

    setPage(
      Number.isFinite(nextPage) && nextPage > 0
        ? nextPage
        : 1,
    );
  }, [
    searchParams,
    initialQuery,
    initialCategory,
    initialBrand,
  ]);

  /* =======================================================
     ACTIVE CATEGORIES
  ======================================================= */

  const activeCategories = useMemo(
    () =>
      categories.filter(
        (item) => item.active !== false,
      ),
    [categories],
  );

  /* =======================================================
     BRANDS
  ======================================================= */

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((item) => item.brand)
          .filter(
            (item): item is string =>
              typeof item === "string" &&
              item.trim().length > 0,
          ),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, "fa"),
    );
  }, [products]);

  const filteredBrands = useMemo(() => {
    const value = brandSearch
      .trim()
      .toLocaleLowerCase("fa");

    if (!value) return brands;

    return brands.filter((item) =>
      item
        .toLocaleLowerCase("fa")
        .includes(value),
    );
  }, [brands, brandSearch]);

  /* =======================================================
     HIGHEST PRICE
  ======================================================= */

  const highestPrice = useMemo(() => {
    return products.reduce(
      (highest, product) =>
        Math.max(
          highest,
          Number(product.price ?? 0),
        ),
      0,
    );
  }, [products]);

  /* =======================================================
     FILTERED PRODUCTS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const search = query
      .trim()
      .toLocaleLowerCase("fa");

    const result = products.filter((product) => {
      const searchable = [
        product.title,
        product.brand,
        product.sku,
        product.description,
        product.category,
      ]
        .filter(
          (item): item is string =>
            typeof item === "string" &&
            Boolean(item),
        )
        .join(" ")
        .toLocaleLowerCase("fa");

      const matchesSearch =
        !search ||
        searchable.includes(search);

      const matchesCategory =
        category === "all" ||
        product.category === category;

      const matchesBrand =
        brand === "all" ||
        product.brand === brand;

      const matchesStock =
        stock === "all" ||
        Number(product.stock ?? 0) > 0;

      const matchesPrice =
        maxPrice === null ||
        Number(product.price ?? 0) <= maxPrice;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesStock &&
        matchesPrice
      );
    });

    return [...result].sort((a, b) => {
      switch (sort) {
        case "cheap":
          return (
            Number(a.price ?? 0) -
            Number(b.price ?? 0)
          );

        case "expensive":
          return (
            Number(b.price ?? 0) -
            Number(a.price ?? 0)
          );

        case "stock":
          return (
            Number(b.stock ?? 0) -
            Number(a.stock ?? 0)
          );

        case "popular":
        default:
          return 0;
      }
    });
  }, [
    products,
    query,
    category,
    brand,
    stock,
    maxPrice,
    sort,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length / PAGE_SIZE,
    ),
  );

  const safePage = Math.min(
    Math.max(page, 1),
    totalPages,
  );

  const startIndex =
    (safePage - 1) * PAGE_SIZE;

  const visibleProducts =
    filteredProducts.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);

      replaceUrl({
        page: String(safePage),
      });
    }
  }, [page, safePage]);

  const goToPage = (nextPage: number) => {
    const normalized = Math.min(
      Math.max(nextPage, 1),
      totalPages,
    );

    setPage(normalized);

    replaceUrl({
      page: String(normalized),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     SELECTED CATEGORY
  ======================================================= */

  const selectedCategory =
    activeCategories.find(
      (item) =>
        item.id === category ||
        item.name === category,
    );

  /* =======================================================
     ACTIVE FILTERS
  ======================================================= */

  const activeFilterCount = [
    Boolean(query.trim()),
    category !== "all",
    brand !== "all",
    stock !== "all",
    maxPrice !== null,
  ].filter(Boolean).length;

  const hasFilters =
    activeFilterCount > 0;

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setQueryState("");

    setCategoryState("all");

    setBrandState("all");

    setStockState("all");

    setMaxPriceState(null);

    setSortState("popular");

    setBrandSearch("");

    setPage(1);

    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    [
      "q",
      "category",
      "brand",
      "sort",
      "stock",
      "maxPrice",
    ].forEach((key) => {
      params.delete(key);
    });

    params.set("page", "1");

    const queryString =
      params.toString();

    router.replace(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
      {
        scroll: false,
      },
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      dir="rtl"
      className="
        min-w-0
        bg-[var(--bg)]
        text-[var(--text)]
      "
    >
      {/* ===================================================
          MOBILE HEADER
      ==================================================== */}

      <div className="lg:hidden">
        <MobileHeader
          query={query}
          setQuery={setQuery}
          resultCount={filteredProducts.length}
        />

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-[var(--muted)]">
              دسته‌بندی
            </span>

            <button
              type="button"
              onClick={() =>
                setMobileFilterOpen(true)
              }
              className="
                flex
                items-center
                gap-1
                text-[10px]
                font-black
                text-[var(--primary)]
              "
            >
              فیلتر

              <ChevronLeft className="h-3 w-3" />
            </button>
          </div>

          <div
            className="
              scrollbar-none
              -mx-1
              flex
              gap-2
              overflow-x-auto
              px-1
              pb-1
            "
          >
            <MobileCategory
              active={category === "all"}
              label="همه"
              count={products.length}
              onClick={() =>
                setCategory("all")
              }
            />

            {activeCategories.map((item) => {
              const count =
                products.filter(
                  (product) =>
                    product.category ===
                      item.id ||
                    product.category ===
                      item.name,
                ).length;

              return (
                <MobileCategory
                  key={item.id}
                  active={
                    category === item.id
                  }
                  label={item.name}
                  count={count}
                  onClick={() =>
                    setCategory(
                      item.id,
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ===================================================
          DESKTOP HEADER
      ==================================================== */}

      <div className="hidden lg:block">
        <DesktopHeader
          query={query}
          setQuery={setQuery}
          resultCount={
            filteredProducts.length
          }
          selectedCategory={
            selectedCategory?.name
          }
        />
      </div>

      {/* ===================================================
          MAIN
      ==================================================== */}

      <div
        className={[
          "mt-5 lg:mt-7",
          desktopFiltersOpen
            ? "lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[270px_minmax(0,1fr)] xl:gap-8"
            : "",
        ].join(" ")}
      >
        {/* =================================================
            DESKTOP FILTER
        ================================================== */}

        {desktopFiltersOpen && (
          <DesktopFilters
            products={products}
            categories={activeCategories}
            brands={filteredBrands}
            selectedCategory={category}
            setCategory={setCategory}
            selectedBrand={brand}
            setBrand={setBrand}
            stock={stock}
            setStock={setStock}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            highestPrice={highestPrice}
            brandSearch={brandSearch}
            setBrandSearch={
              setBrandSearch
            }
            hasFilters={hasFilters}
            clearFilters={
              clearFilters
            }
          />
        )}

        {/* =================================================
            PRODUCTS
        ================================================== */}

        <main className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-[var(--primary)]
                  "
                />

                <span
                  className="
                    truncate
                    text-[9px]
                    font-black
                    tracking-[0.12em]
                    text-[var(--primary)]
                  "
                >
                  PRODUCTS
                </span>
              </div>

              <h1
                className="
                  mt-1
                  truncate
                  text-lg
                  font-black
                  tracking-tight
                  lg:text-xl
                "
              >
                {selectedCategory
                  ? selectedCategory.name
                  : "همه محصولات"}
              </h1>
            </div>

            {/* DESKTOP TOOLBAR */}

            <div className="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                onClick={() =>
                  setDesktopFiltersOpen(
                    (value) => !value,
                  )
                }
                className="
                  btn
                  btn-secondary
                  h-10
                  px-3
                  text-[10px]
                "
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />

                فیلترها

                {activeFilterCount > 0 && (
                  <span
                    className="
                      flex
                      h-5
                      min-w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-[var(--primary)]
                      px-1
                      text-[9px]
                      text-white
                    "
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <SortSelect
                value={sort}
                onChange={setSort}
              />
            </div>

            {/* MOBILE SORT */}

            <button
              type="button"
              onClick={() =>
                setMobileSortOpen(true)
              }
              className="
                flex
                h-9
                shrink-0
                items-center
                gap-1.5
                rounded-xl
                border
                border-[var(--border)]
                bg-[var(--surface)]
                px-3
                text-[10px]
                font-black
                text-[var(--text)]
                lg:hidden
              "
            >
              <ListFilter className="h-3.5 w-3.5 text-[var(--primary)]" />

              مرتب‌سازی

              <ChevronDown className="h-3 w-3 text-[var(--muted)]" />
            </button>
          </div>

          {/* ACTIVE FILTERS */}

          {hasFilters && (
            <div
              className="
                scrollbar-none
                mt-3
                flex
                gap-1.5
                overflow-x-auto
                pb-1
              "
            >
              {query.trim() && (
                <ActiveFilter
                  label={`«${query}»`}
                  onRemove={() =>
                    setQuery("")
                  }
                />
              )}

              {selectedCategory && (
                <ActiveFilter
                  label={
                    selectedCategory.name
                  }
                  onRemove={() =>
                    setCategory("all")
                  }
                />
              )}

              {brand !== "all" && (
                <ActiveFilter
                  label={brand}
                  onRemove={() =>
                    setBrand("all")
                  }
                />
              )}

              {stock === "available" && (
                <ActiveFilter
                  label="فقط موجود"
                  onRemove={() =>
                    setStock("all")
                  }
                />
              )}

              {maxPrice !== null && (
                <ActiveFilter
                  label={`تا ${formatPrice(
                    maxPrice,
                  )}`}
                  onRemove={() =>
                    setMaxPrice(null)
                  }
                />
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="
                  shrink-0
                  px-2
                  text-[9px]
                  font-black
                  text-[var(--danger)]
                "
              >
                حذف همه
              </button>
            </div>
          )}

          {/* RESULT INFO */}

          <div
            className="
              mt-4
              flex
              items-center
              justify-between
              border-b
              border-[var(--border)]
              pb-3
            "
          >
            <p className="text-[10px] text-[var(--muted)]">
              نمایش{" "}
              <strong className="font-black text-[var(--text)]">
                {visibleProducts.length.toLocaleString(
                  "fa-IR",
                )}
              </strong>{" "}
              از{" "}
              <strong className="font-black text-[var(--text)]">
                {filteredProducts.length.toLocaleString(
                  "fa-IR",
                )}
              </strong>{" "}
              محصول
            </p>

            <div className="hidden items-center gap-1 text-[9px] text-[var(--muted)] sm:flex">
              <Zap className="h-3 w-3 text-[var(--primary)]" />

              ارسال سریع
            </div>
          </div>

          {/* PRODUCTS */}

          {visibleProducts.length > 0 ? (
            <>
              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-2.5
                  sm:grid-cols-3
                  sm:gap-4
                  xl:grid-cols-4
                "
              >
                {visibleProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      p={product}
                    />
                  ),
                )}
              </div>

              {totalPages > 1 && (
                <Pagination
                  page={safePage}
                  totalPages={totalPages}
                  onPageChange={
                    goToPage
                  }
                />
              )}
            </>
          ) : (
            <EmptyProducts
              hasFilters={hasFilters}
              clearFilters={
                clearFilters
              }
            />
          )}
        </main>
      </div>

      {/* ===================================================
          MOBILE FILTER
      ==================================================== */}

      {mobileFilterOpen && (
        <MobileFilterSheet
          products={products}
          categories={activeCategories}
          brands={filteredBrands}
          selectedCategory={category}
          setCategory={setCategory}
          selectedBrand={brand}
          setBrand={setBrand}
          stock={stock}
          setStock={setStock}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          highestPrice={highestPrice}
          brandSearch={brandSearch}
          setBrandSearch={
            setBrandSearch
          }
          hasFilters={hasFilters}
          clearFilters={
            clearFilters
          }
          resultCount={
            filteredProducts.length
          }
          onClose={() =>
            setMobileFilterOpen(false)
          }
        />
      )}

      {/* ===================================================
          MOBILE SORT
      ==================================================== */}

      {mobileSortOpen && (
        <MobileSortSheet
          value={sort}
          onChange={(value) => {
            setSort(value);
            setMobileSortOpen(false);
          }}
          onClose={() =>
            setMobileSortOpen(false)
          }
        />
      )}
    </section>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1,
      );
    }

    const values: Array<
      number | "ellipsis-left" | "ellipsis-right"
    > = [1];

    const start = Math.max(
      2,
      page - 1,
    );

    const end = Math.min(
      totalPages - 1,
      page + 1,
    );

    if (start > 2) {
      values.push("ellipsis-left");
    }

    for (
      let value = start;
      value <= end;
      value += 1
    ) {
      values.push(value);
    }

    if (end < totalPages - 1) {
      values.push("ellipsis-right");
    }

    values.push(totalPages);

    return values;
  }, [page, totalPages]);

  return (
    <nav
      aria-label="صفحه‌بندی محصولات"
      className="
        mt-8
        flex
        flex-wrap
        items-center
        justify-center
        gap-1.5
        sm:gap-2
      "
      dir="rtl"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() =>
          onPageChange(page - 1)
        }
        className="
          flex
          h-10
          min-w-10
          items-center
          justify-center
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--surface)]
          px-3
          text-[10px]
          font-black
          transition
          hover:border-[var(--primary)]
          disabled:cursor-not-allowed
          disabled:opacity-35
        "
        aria-label="صفحه قبلی"
      >
        <ChevronDown className="h-4 w-4 rotate-90" />
      </button>

      {pages.map((item, index) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            onClick={() =>
              onPageChange(item)
            }
            aria-current={
              item === page
                ? "page"
                : undefined
            }
            className={[
              "flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-[10px] font-black transition",
              item === page
                ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
            ].join(" ")}
          >
            {item.toLocaleString(
              "fa-IR",
            )}
          </button>
        ) : (
          <span
            key={`${item}-${index}`}
            className="
              flex
              h-10
              min-w-8
              items-center
              justify-center
              text-[10px]
              font-black
              text-[var(--muted)]
            "
            aria-hidden="true"
          >
            …
          </span>
        ),
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() =>
          onPageChange(page + 1)
        }
        className="
          flex
          h-10
          min-w-10
          items-center
          justify-center
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--surface)]
          px-3
          text-[10px]
          font-black
          transition
          hover:border-[var(--primary)]
          disabled:cursor-not-allowed
          disabled:opacity-35
        "
        aria-label="صفحه بعدی"
      >
        <ChevronDown className="h-4 w-4 -rotate-90" />
      </button>
    </nav>
  );
}

/* =========================================================
   MOBILE HEADER
========================================================= */

function MobileHeader({
  query,
  setQuery,
  resultCount,
}: {
  query: string;
  setQuery: (value: string) => void;
  resultCount: number;
}) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[24px]
        border
        border-[var(--border)]
        bg-[var(--surface)]
        p-4
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -left-12
          -top-12
          h-32
          w-32
          rounded-full
          bg-[var(--primary)]
          opacity-[0.07]
          blur-3xl
        "
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                bg-[var(--primary)]
                text-white
              "
            >
              <Sparkles className="h-3.5 w-3.5" />
            </span>

            <div>
              <span className="block text-[10px] font-black">
                فروشگاه ابزار
              </span>

              <span className="block text-[8px] text-[var(--muted)]">
                ابزار احمدی
              </span>
            </div>
          </div>

          <div
            className="
              rounded-full
              border
              border-[var(--border)]
              bg-[var(--surface-2)]
              px-2.5
              py-1.5
            "
          >
            <span className="text-[9px] font-black text-[var(--muted)]">
              {resultCount.toLocaleString(
                "fa-IR",
              )}{" "}
              نتیجه
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-[21px] font-black leading-[1.5]">
            چی می‌خوای
            <span className="text-[var(--primary)]">
              {" "}
              پیدا کنی؟
            </span>
          </h2>

          <p className="mt-1 text-[9px] leading-5 text-[var(--muted)]">
            نام محصول، برند یا مدل را جستجو کن.
          </p>
        </div>

        <div
          className="
            mt-4
            flex
            h-[50px]
            items-center
            gap-2.5
            rounded-2xl
            border
            border-[var(--border)]
            bg-[var(--surface-2)]
            px-3
            transition
            focus-within:border-[var(--primary)]
          "
        >
          <Search className="h-4 w-4 shrink-0 text-[var(--primary)]" />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="جستجوی ابزار..."
            className="
              min-w-0
              flex-1
              bg-transparent
              text-[11px]
              font-medium
              outline-none
              placeholder:text-[var(--muted)]
            "
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-[var(--surface)]
                text-[var(--muted)]
              "
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DESKTOP HEADER
========================================================= */

function DesktopHeader({
  query,
  setQuery,
  resultCount,
  selectedCategory,
}: {
  query: string;
  setQuery: (value: string) => void;
  resultCount: number;
  selectedCategory?: string;
}) {
  return (
    <header
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-[var(--border)]
        bg-[var(--surface)]
        p-7
        xl:p-8
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -left-24
          -top-24
          h-72
          w-72
          rounded-full
          bg-[var(--primary)]
          opacity-[0.06]
          blur-3xl
        "
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-[var(--primary)]
                "
              />

              <span
                className="
                  text-[9px]
                  font-black
                  tracking-[0.16em]
                  text-[var(--primary)]
                "
              >
                PROFESSIONAL TOOLS
              </span>
            </div>

            <h1
              className="
                mt-3
                text-3xl
                font-black
                tracking-tight
                xl:text-4xl
              "
            >
              {selectedCategory
                ? selectedCategory
                : "ابزار حرفه‌ای برای کار حرفه‌ای"}
            </h1>

            <p className="mt-2 text-xs leading-7 text-[var(--muted)]">
              از بین ابزارهای تخصصی و برندهای مختلف،
              محصول مورد نیازت را سریع پیدا کن.
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <MiniStat
              label="نتیجه"
              value={resultCount}
            />

            <MiniStat
              label="ارسال"
              value="سریع"
            />

            <MiniStat
              label="پشتیبانی"
              value="۷/۲۴"
            />
          </div>
        </div>

        <div className="mt-7">
          <div
            className="
              flex
              h-14
              items-center
              gap-3
              rounded-2xl
              border
              border-[var(--border)]
              bg-[var(--surface-2)]
              px-4
              transition
              focus-within:border-[var(--primary)]
            "
          >
            <Search className="h-5 w-5 text-[var(--primary)]" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="جستجو بین محصولات، برندها، SKU و مدل..."
              className="
                min-w-0
                flex-1
                bg-transparent
                text-xs
                outline-none
                placeholder:text-[var(--muted)]
              "
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-[var(--surface)]
                  text-[var(--muted)]
                "
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <div
              className="
                hidden
                items-center
                gap-2
                border-r
                border-[var(--border)]
                pr-4
                md:flex
              "
            >
              <kbd
                className="
                  rounded-md
                  border
                  border-[var(--border)]
                  bg-[var(--surface)]
                  px-2
                  py-1
                  text-[9px]
                  text-[var(--muted)]
                "
              >
                /
              </kbd>

              <span className="text-[9px] text-[var(--muted)]">
                جستجو
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="
        min-w-[82px]
        rounded-2xl
        border
        border-[var(--border)]
        bg-[var(--surface-2)]
        px-4
        py-3
        text-center
      "
    >
      <strong className="block text-sm font-black">
        {typeof value === "number"
          ? value.toLocaleString("fa-IR")
          : value}
      </strong>

      <span className="mt-1 block text-[8px] text-[var(--muted)]">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   MOBILE CATEGORY
========================================================= */

function MobileCategory({
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
      className={[
        "flex h-[48px] min-w-[88px] shrink-0 flex-col items-center justify-center rounded-2xl border px-3 transition-all",
        active
          ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-[0_7px_20px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]",
      ].join(" ")}
    >
      <span className="max-w-[80px] truncate text-[10px] font-black">
        {label}
      </span>

      <span
        className={[
          "mt-0.5 text-[7px]",
          active
            ? "text-white/70"
            : "text-[var(--muted)]",
        ].join(" ")}
      >
        {count.toLocaleString("fa-IR")} کالا
      </span>
    </button>
  );
}

/* =========================================================
   DESKTOP FILTERS
========================================================= */

function DesktopFilters({
  products,
  categories,
  brands,
  selectedCategory,
  setCategory,
  selectedBrand,
  setBrand,
  stock,
  setStock,
  maxPrice,
  setMaxPrice,
  highestPrice,
  brandSearch,
  setBrandSearch,
  hasFilters,
  clearFilters,
}: {
  products: Product[];
  categories: Category[];
  brands: string[];
  selectedCategory: string;
  setCategory: (value: string) => void;
  selectedBrand: string;
  setBrand: (value: string) => void;
  stock: StockFilter;
  setStock: (value: StockFilter) => void;
  maxPrice: number | null;
  setMaxPrice: (value: number | null) => void;
  highestPrice: number;
  brandSearch: string;
  setBrandSearch: (value: string) => void;
  hasFilters: boolean;
  clearFilters: () => void;
}) {
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();

    products.forEach((product) => {
      if (!product.category) return;

      const key = String(
        product.category,
      );

      map.set(
        key,
        (map.get(key) ?? 0) + 1,
      );
    });

    return map;
  }, [products]);

  return (
    <aside className="hidden lg:block">
      <div
        className="
          sticky
          top-5
          overflow-hidden
          rounded-[24px]
          border
          border-[var(--border)]
          bg-[var(--surface)]
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-[var(--border)]
            px-5
            py-4
          "
        >
          <div className="flex items-center gap-2.5">
            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                bg-[var(--primary)]
                text-white
              "
            >
              <Filter className="h-3.5 w-3.5" />
            </span>

            <div>
              <h2 className="text-xs font-black">
                فیلتر محصولات
              </h2>

              <p className="mt-0.5 text-[8px] text-[var(--muted)]">
                انتخاب دقیق‌تر
              </p>
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                text-[var(--danger)]
                transition
                hover:bg-[var(--surface-2)]
              "
              title="پاک کردن فیلترها"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="px-5">
          <FilterSection title="دسته‌بندی">
            <button
              type="button"
              onClick={() =>
                setCategory("all")
              }
              className={[
                "mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-[10px] font-bold transition",
                selectedCategory === "all"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)]",
              ].join(" ")}
            >
              <span>همه محصولات</span>

              <span className="text-[8px] opacity-60">
                {products.length.toLocaleString(
                  "fa-IR",
                )}
              </span>
            </button>

            <div className="max-h-64 space-y-0.5 overflow-y-auto">
              {categories.map((item) => {
                const count =
                  (categoryCounts.get(
                    String(item.id),
                  ) ?? 0) +
                  (categoryCounts.get(
                    String(item.name),
                  ) ?? 0);

                const active =
                  selectedCategory ===
                  item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setCategory(
                        item.id,
                      )
                    }
                    className={[
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-right text-[10px] font-semibold transition",
                      active
                        ? "bg-[var(--primary-light)] text-[var(--primary)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface-2)]",
                    ].join(" ")}
                  >
                    <span className="truncate">
                      {item.name}
                    </span>

                    <span className="text-[8px] opacity-60">
                      {count.toLocaleString(
                        "fa-IR",
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="برند">
            <div
              className="
                flex
                h-9
                items-center
                gap-2
                rounded-xl
                border
                border-[var(--border)]
                bg-[var(--surface-2)]
                px-3
              "
            >
              <Search className="h-3 w-3 text-[var(--muted)]" />

              <input
                value={brandSearch}
                onChange={(event) =>
                  setBrandSearch(
                    event.target.value,
                  )
                }
                placeholder="جستجوی برند"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[10px]
                  outline-none
                  placeholder:text-[var(--muted)]
                "
              />
            </div>

            <div className="mt-2 max-h-48 overflow-y-auto">
              <FilterRadio
                active={
                  selectedBrand === "all"
                }
                label="همه برندها"
                onClick={() =>
                  setBrand("all")
                }
              />

              {brands.map((item) => (
                <FilterRadio
                  key={item}
                  active={
                    selectedBrand === item
                  }
                  label={item}
                  onClick={() =>
                    setBrand(item)
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="محدوده قیمت">
            <div
              className="
                rounded-2xl
                bg-[var(--surface-2)]
                p-4
              "
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[9px] text-[var(--muted)]">
                  حداکثر
                </span>

                <strong className="text-[10px] font-black">
                  {formatPrice(
                    maxPrice ??
                      highestPrice,
                  )}
                </strong>
              </div>

              <input
                type="range"
                min={0}
                max={Math.max(
                  highestPrice,
                  1,
                )}
                value={
                  maxPrice ??
                  highestPrice
                }
                onChange={(event) =>
                  setMaxPrice(
                    Number(
                      event.target
                        .value,
                    ),
                  )
                }
                className="
                  w-full
                  accent-[var(--primary)]
                "
              />

              {maxPrice !== null && (
                <button
                  type="button"
                  onClick={() =>
                    setMaxPrice(null)
                  }
                  className="
                    mt-3
                    text-[9px]
                    font-bold
                    text-[var(--primary)]
                  "
                >
                  حذف محدودیت
                </button>
              )}
            </div>
          </FilterSection>

          <FilterSection title="موجودی">
            <button
              type="button"
              onClick={() =>
                setStock(
                  stock === "available"
                    ? "all"
                    : "available",
                )
              }
              className="
                flex
                w-full
                items-center
                justify-between
                rounded-xl
                px-2
                py-2
              "
            >
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "flex h-5 w-5 items-center justify-center rounded-md border",
                    stock === "available"
                      ? "border-[var(--primary)] bg-[var(--primary)]"
                      : "border-[var(--border)]",
                  ].join(" ")}
                >
                  {stock ===
                    "available" && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </span>

                <span className="text-[10px] font-bold text-[var(--muted)]">
                  فقط کالاهای موجود
                </span>
              </div>

              <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
            </button>
          </FilterSection>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="
                mb-5
                flex
                h-10
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-[var(--border)]
                text-[10px]
                font-black
                text-[var(--danger)]
                transition
                hover:bg-[var(--surface-2)]
              "
            >
              <RotateCcw className="h-3 w-3" />

              پاک کردن فیلترها
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

/* =========================================================
   FILTER SECTION
========================================================= */

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="
        border-b
        border-[var(--border)]
        py-5
      "
    >
      <h3 className="mb-3 text-[10px] font-black">
        {title}
      </h3>

      {children}
    </section>
  );
}

/* =========================================================
   FILTER RADIO
========================================================= */

function FilterRadio({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-2
        rounded-lg
        px-2
        py-2
        text-right
      "
    >
      <span
        className={[
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          active
            ? "border-[var(--primary)] bg-[var(--primary)]"
            : "border-[var(--border)]",
        ].join(" ")}
      >
        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        )}
      </span>

      <span
        className={[
          "truncate text-[10px] font-semibold",
          active
            ? "text-[var(--primary)]"
            : "text-[var(--muted)]",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}

/* =========================================================
   SORT SELECT
========================================================= */

function SortSelect({
  value,
  onChange,
}: {
  value: Sort;
  onChange: (value: Sort) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value as Sort,
          )
        }
        className="
          h-10
          appearance-none
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--surface)]
          py-0
          pl-9
          pr-3
          text-[10px]
          font-black
          text-[var(--text)]
          outline-none
          focus:border-[var(--primary)]
        "
      >
        <option value="popular">
          پیشنهادی
        </option>

        <option value="cheap">
          ارزان‌ترین
        </option>

        <option value="expensive">
          گران‌ترین
        </option>

        <option value="stock">
          بیشترین موجودی
        </option>
      </select>

      <ChevronDown
        className="
          pointer-events-none
          absolute
          left-3
          top-1/2
          h-3
          w-3
          -translate-y-1/2
          text-[var(--muted)]
        "
      />
    </div>
  );
}

/* =========================================================
   ACTIVE FILTER
========================================================= */

function ActiveFilter({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="
        flex
        max-w-[180px]
        shrink-0
        items-center
        gap-1.5
        rounded-lg
        border
        border-[var(--primary)]
        bg-[var(--primary-light)]
        px-2.5
        py-1.5
        text-[8px]
        font-black
        text-[var(--primary)]
      "
    >
      <span className="truncate">
        {label}
      </span>

      <X className="h-2.5 w-2.5 shrink-0" />
    </button>
  );
}

/* =========================================================
   MOBILE FILTER SHEET
========================================================= */

function MobileFilterSheet({
  products,
  categories,
  brands: _brands,
  selectedCategory,
  setCategory,
  selectedBrand,
  setBrand,
  stock,
  setStock,
  maxPrice,
  setMaxPrice,
  highestPrice,
  brandSearch,
  setBrandSearch,
  hasFilters,
  clearFilters,
  resultCount,
  onClose,
}: {
  products: Product[];
  categories: Category[];
  brands: string[];
  selectedCategory: string;
  setCategory: (value: string) => void;
  selectedBrand: string;
  setBrand: (value: string) => void;
  stock: StockFilter;
  setStock: (value: StockFilter) => void;
  maxPrice: number | null;
  setMaxPrice: (value: number | null) => void;
  highestPrice: number;
  brandSearch: string;
  setBrandSearch: (value: string) => void;
  hasFilters: boolean;
  clearFilters: () => void;
  resultCount: number;
  onClose: () => void;
}) {
  const [activePanel, setActivePanel] =
    useState<
      "main" | "categories" | "brands"
    >("main");

  /* =======================================================
     BODY LOCK
  ======================================================= */

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  /* =======================================================
     ESC
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key !== "Escape") return;

      if (activePanel !== "main") {
        setActivePanel("main");
      } else {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [activePanel, onClose]);

  /* =======================================================
     ALL BRANDS
  ======================================================= */

  const allBrands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.brand)
          .filter(
            (brand): brand is string =>
              typeof brand === "string" &&
              brand.trim().length > 0,
          ),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, "fa"),
    );
  }, [products]);

  /* =======================================================
     SEARCH BRANDS
  ======================================================= */

  const searchedBrands = useMemo(() => {
    const search = brandSearch
      .trim()
      .toLocaleLowerCase("fa");

    if (!search) {
      return allBrands;
    }

    return allBrands.filter((brand) =>
      brand
        .toLocaleLowerCase("fa")
        .includes(search),
    );
  }, [
    allBrands,
    brandSearch,
  ]);

  /* =======================================================
     CATEGORY COUNTS
  ======================================================= */

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();

    for (const product of products) {
      if (!product.category) continue;

      const key = String(
        product.category,
      );

      map.set(
        key,
        (map.get(key) ?? 0) + 1,
      );
    }

    return map;
  }, [products]);

  /* =======================================================
     BRAND COUNTS
  ======================================================= */

  const brandCounts = useMemo(() => {
    const map = new Map<string, number>();

    for (const product of products) {
      if (!product.brand) continue;

      const key = String(
        product.brand,
      );

      map.set(
        key,
        (map.get(key) ?? 0) + 1,
      );
    }

    return map;
  }, [products]);

  /* =======================================================
     CATEGORY COUNT
  ======================================================= */

  const getCategoryCount = (
    category: Category,
  ) => {
    const byId =
      categoryCounts.get(
        String(category.id),
      ) ?? 0;

    const byName =
      categoryCounts.get(
        String(category.name),
      ) ?? 0;

    if (
      String(category.id) ===
      String(category.name)
    ) {
      return byId;
    }

    return byId + byName;
  };

  /* =======================================================
     ACTIVE CATEGORY
  ======================================================= */

  const activeCategory =
    categories.find(
      (item) =>
        String(item.id) ===
          String(selectedCategory) ||
        String(item.name) ===
          String(selectedCategory),
    );

  /* =======================================================
     ACTIVE BRAND PRODUCT COUNT
  ======================================================= */

  const selectedBrandCount =
    selectedBrand !== "all"
      ? brandCounts.get(
          selectedBrand,
        ) ?? 0
      : allBrands.reduce(
          (total, item) =>
            total +
            (brandCounts.get(
              item,
            ) ?? 0),
          0,
        );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="بستن فیلترها"
        onClick={onClose}
        className="
          absolute
          inset-0
          bg-black/60
          backdrop-blur-[3px]
        "
      />

      {/* SHEET */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          flex
          max-h-[94dvh]
          flex-col
          overflow-hidden
          rounded-t-[28px]
          border-t
          border-[var(--border)]
          bg-[var(--surface)]
          shadow-[0_-20px_80px_rgba(0,0,0,0.3)]
        "
      >
        {/* HANDLE */}

        <div className="flex shrink-0 justify-center pt-3">
          <span className="h-1 w-11 rounded-full bg-[var(--border)]" />
        </div>

        {/* HEADER */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-[var(--border)]
            px-5
            py-4
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[var(--primary)]
                text-white
              "
            >
              <SlidersHorizontal className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-black">
                {activePanel ===
                "categories"
                  ? "دسته‌بندی محصولات"
                  : activePanel ===
                      "brands"
                    ? "انتخاب برند"
                    : "فیلتر محصولات"}
              </h2>

              <p className="mt-1 truncate text-[9px] text-[var(--muted)]">
                {activePanel ===
                "categories"
                  ? `${categories.length.toLocaleString(
                      "fa-IR",
                    )} دسته‌بندی`
                  : activePanel ===
                      "brands"
                    ? `${allBrands.length.toLocaleString(
                        "fa-IR",
                      )} برند`
                    : `${resultCount.toLocaleString(
                        "fa-IR",
                      )} محصول`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[var(--surface-2)]
              text-[var(--muted)]
              transition
              active:scale-95
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CONTENT */}

        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
          <div className="px-5 pb-6">
            {/* =================================================
                MAIN
            ================================================== */}

            {activePanel === "main" && (
              <div className="space-y-3 pt-4">
                {/* SUMMARY */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface-2)]
                    p-3.5
                  "
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-[var(--muted)]">
                        نتیجه فعلی
                      </span>

                      <strong className="mt-1 block text-sm font-black">
                        {resultCount.toLocaleString(
                          "fa-IR",
                        )}{" "}
                        محصول
                      </strong>
                    </div>

                    {hasFilters && (
                      <span
                        className="
                          flex
                          h-8
                          min-w-8
                          items-center
                          justify-center
                          rounded-full
                          bg-[var(--primary)]
                          px-2
                          text-[10px]
                          font-black
                          text-white
                        "
                      >
                        فیلتر فعال
                      </span>
                    )}
                  </div>
                </div>

                {/* CATEGORY */}

                <button
                  type="button"
                  onClick={() =>
                    setActivePanel(
                      "categories",
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface)]
                    p-3.5
                    text-right
                    transition
                    active:scale-[0.99]
                  "
                >
                  <span
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[var(--surface-2)]
                      text-[var(--primary)]
                    "
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold text-[var(--muted)]">
                      دسته‌بندی
                    </span>

                    <span className="mt-1 block truncate text-[12px] font-black">
                      {activeCategory?.name ??
                        "همه محصولات"}
                    </span>
                  </span>

                  <ChevronLeft className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                </button>

                {/* BRAND */}

                <button
                  type="button"
                  onClick={() =>
                    setActivePanel("brands")
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface)]
                    p-3.5
                    text-right
                    transition
                    active:scale-[0.99]
                  "
                >
                  <span
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[var(--surface-2)]
                      text-[var(--primary)]
                    "
                  >
                    <Sparkles className="h-4 w-4" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold text-[var(--muted)]">
                      برند
                    </span>

                    <span className="mt-1 block truncate text-[12px] font-black">
                      {selectedBrand ===
                      "all"
                        ? "همه برندها"
                        : selectedBrand}
                    </span>

                    <span className="mt-1 block text-[8px] text-[var(--muted)]">
                      {selectedBrandCount.toLocaleString(
                        "fa-IR",
                      )}{" "}
                      کالا
                    </span>
                  </span>

                  <ChevronLeft className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                </button>

                {/* PRICE */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface)]
                    p-4
                  "
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black">
                        محدوده قیمت
                      </span>

                      <span className="mt-1 block text-[8px] text-[var(--muted)]">
                        حداکثر قیمت
                      </span>
                    </div>

                    <strong className="text-[11px] font-black text-[var(--primary)]">
                      {formatPrice(
                        maxPrice ??
                          highestPrice,
                      )}
                    </strong>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={Math.max(
                      highestPrice,
                      1,
                    )}
                    value={
                      maxPrice ??
                      highestPrice
                    }
                    onChange={(event) =>
                      setMaxPrice(
                        Number(
                          event.target
                            .value,
                        ),
                      )
                    }
                    className="
                      mt-5
                      w-full
                      accent-[var(--primary)]
                    "
                  />

                  <div className="mt-2 flex justify-between">
                    <span className="text-[8px] text-[var(--muted)]">
                      ۰ تومان
                    </span>

                    <span className="text-[8px] text-[var(--muted)]">
                      {formatPrice(
                        highestPrice,
                      )}
                    </span>
                  </div>

                  {maxPrice !== null && (
                    <button
                      type="button"
                      onClick={() =>
                        setMaxPrice(null)
                      }
                      className="
                        mt-3
                        text-[9px]
                        font-black
                        text-[var(--primary)]
                      "
                    >
                      حذف محدودیت قیمت
                    </button>
                  )}
                </div>

                {/* STOCK */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface)]
                    p-4
                  "
                >
                  <div className="mb-3">
                    <span className="text-[10px] font-black">
                      وضعیت موجودی
                    </span>

                    <span className="mt-1 block text-[8px] text-[var(--muted)]">
                      نمایش فقط کالاهای موجود
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setStock(
                        stock ===
                          "available"
                          ? "all"
                          : "available",
                      )
                    }
                    className={[
                      "flex w-full items-center justify-between rounded-xl border p-3 transition",
                      stock ===
                        "available"
                        ? "border-[var(--primary)] bg-[var(--primary-light)]"
                        : "border-[var(--border)] bg-[var(--surface-2)]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "flex h-6 w-6 items-center justify-center rounded-lg border",
                          stock ===
                            "available"
                            ? "border-[var(--primary)] bg-[var(--primary)]"
                            : "border-[var(--border)] bg-[var(--surface)]",
                        ].join(" ")}
                      >
                        {stock ===
                          "available" && (
                          <Check className="h-3.5 w-3.5 text-white" />
                        )}
                      </span>

                      <span className="text-[10px] font-black">
                        فقط کالاهای موجود
                      </span>
                    </div>

                    <span
                      className={[
                        "h-2.5 w-2.5 rounded-full",
                        stock ===
                          "available"
                          ? "bg-[var(--primary)]"
                          : "bg-[var(--success)]",
                      ].join(" ")}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                CATEGORIES
            ================================================== */}

            {activePanel ===
              "categories" && (
              <div className="pt-4">
                <MobileNestedHeader
                  title="دسته‌بندی محصولات"
                  description={`${categories.length.toLocaleString(
                    "fa-IR",
                  )} دسته‌بندی`}
                  onBack={() =>
                    setActivePanel(
                      "main",
                    )
                  }
                />

                <div className="mt-4 space-y-2">
                  {/* ALL */}

                  <button
                    type="button"
                    onClick={() => {
                      setCategory("all");
                      setActivePanel(
                        "main",
                      );
                    }}
                    className={[
                      "flex w-full items-center justify-between rounded-2xl border p-3.5 text-right transition",
                      selectedCategory ===
                        "all"
                        ? "border-[var(--primary)] bg-[var(--primary-light)]"
                        : "border-[var(--border)] bg-[var(--surface-2)]",
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={[
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          selectedCategory ===
                            "all"
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[var(--surface)] text-[var(--muted)]",
                        ].join(" ")}
                      >
                        <Grid2X2 className="h-4 w-4" />
                      </span>

                      <div>
                        <span className="block text-[11px] font-black">
                          همه محصولات
                        </span>

                        <span className="mt-1 block text-[8px] text-[var(--muted)]">
                          {products.length.toLocaleString(
                            "fa-IR",
                          )}{" "}
                          کالا
                        </span>
                      </div>
                    </div>

                    {selectedCategory ===
                      "all" && (
                      <span
                        className="
                          flex
                          h-6
                          w-6
                          items-center
                          justify-center
                          rounded-full
                          bg-[var(--primary)]
                        "
                      >
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                    )}
                  </button>

                  {/* CATEGORIES */}

                  {categories.map(
                    (item) => {
                      const active =
                        String(
                          selectedCategory,
                        ) ===
                        String(
                          item.id,
                        );

                      const count =
                        getCategoryCount(
                          item,
                        );

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setCategory(
                              String(
                                item.id,
                              ),
                            );

                            setActivePanel(
                              "main",
                            );
                          }}
                          className={[
                            "flex w-full items-center justify-between rounded-2xl border p-3.5 text-right transition active:scale-[0.99]",
                            active
                              ? "border-[var(--primary)] bg-[var(--primary-light)]"
                              : "border-[var(--border)] bg-[var(--surface-2)]",
                          ].join(" ")}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={[
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                active
                                  ? "bg-[var(--primary)] text-white"
                                  : "bg-[var(--surface)] text-[var(--muted)]",
                              ].join(" ")}
                            >
                              <Grid2X2 className="h-4 w-4" />
                            </span>

                            <div className="min-w-0">
                              <span className="block truncate text-[10px] font-black">
                                {
                                  item.name
                                }
                              </span>

                              <span className="mt-1 block text-[8px] text-[var(--muted)]">
                                {count.toLocaleString(
                                  "fa-IR",
                                )}{" "}
                                کالا
                              </span>
                            </div>
                          </div>

                          {active && (
                            <span
                              className="
                                flex
                                h-6
                                w-6
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-[var(--primary)]
                              "
                            >
                              <Check className="h-3.5 w-3.5 text-white" />
                            </span>
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                BRANDS
            ================================================== */}

            {activePanel ===
              "brands" && (
              <div className="pt-4">
                <MobileNestedHeader
                  title="انتخاب برند"
                  description={`${allBrands.length.toLocaleString(
                    "fa-IR",
                  )} برند`}
                  onBack={() =>
                    setActivePanel(
                      "main",
                    )
                  }
                />

                {/* SEARCH */}

                <div
                  className="
                    mt-4
                    flex
                    h-12
                    items-center
                    gap-2.5
                    rounded-2xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface-2)]
                    px-3.5
                    focus-within:border-[var(--primary)]
                  "
                >
                  <Search className="h-4 w-4 shrink-0 text-[var(--primary)]" />

                  <input
                    autoFocus
                    value={brandSearch}
                    onChange={(event) =>
                      setBrandSearch(
                        event.target
                          .value,
                      )
                    }
                    placeholder="نام برند را جستجو کن..."
                    className="
                      min-w-0
                      flex-1
                      bg-transparent
                      text-[11px]
                      outline-none
                      placeholder:text-[var(--muted)]
                    "
                  />

                  {brandSearch && (
                    <button
                      type="button"
                      onClick={() =>
                        setBrandSearch("")
                      }
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        bg-[var(--surface)]
                        text-[var(--muted)]
                      "
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* RESULT */}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[var(--muted)]">
                    {searchedBrands.length.toLocaleString(
                      "fa-IR",
                    )}{" "}
                    برند
                  </span>

                  {selectedBrand !==
                    "all" && (
                    <button
                      type="button"
                      onClick={() => {
                        setBrand("all");

                        setActivePanel(
                          "main",
                        );
                      }}
                      className="
                        text-[9px]
                        font-black
                        text-[var(--danger)]
                      "
                    >
                      حذف برند
                    </button>
                  )}
                </div>

                {/* BRAND LIST */}

                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBrand("all");

                      setActivePanel(
                        "main",
                      );
                    }}
                    className={[
                      "flex w-full items-center justify-between rounded-2xl border p-3.5 text-right transition",
                      selectedBrand ===
                        "all"
                        ? "border-[var(--primary)] bg-[var(--primary-light)]"
                        : "border-[var(--border)] bg-[var(--surface-2)]",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          selectedBrand ===
                            "all"
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[var(--surface)] text-[var(--muted)]",
                        ].join(" ")}
                      >
                        <Sparkles className="h-4 w-4" />
                      </span>

                      <div>
                        <span className="block text-[11px] font-black">
                          همه برندها
                        </span>

                        <span className="mt-1 block text-[8px] text-[var(--muted)]">
                          بدون محدودیت برند
                        </span>
                      </div>
                    </div>

                    {selectedBrand ===
                      "all" && (
                      <span
                        className="
                          flex
                          h-6
                          w-6
                          items-center
                          justify-center
                          rounded-full
                          bg-[var(--primary)]
                        "
                      >
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                    )}
                  </button>

                  {searchedBrands.length >
                  0 ? (
                    searchedBrands.map(
                      (item) => {
                        const active =
                          selectedBrand ===
                          item;

                        const count =
                          brandCounts.get(
                            item,
                          ) ?? 0;

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setBrand(
                                item,
                              );

                              setActivePanel(
                                "main",
                              );
                            }}
                            className={[
                              "flex w-full items-center justify-between rounded-2xl border p-3.5 text-right transition active:scale-[0.99]",
                              active
                                ? "border-[var(--primary)] bg-[var(--primary-light)]"
                                : "border-[var(--border)] bg-[var(--surface-2)]",
                            ].join(" ")}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={[
                                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-black",
                                  active
                                    ? "bg-[var(--primary)] text-white"
                                    : "bg-[var(--surface)] text-[var(--primary)]",
                                ].join(" ")}
                              >
                                {item
                                  .slice(
                                    0,
                                    1,
                                  )
                                  .toUpperCase()}
                              </span>

                              <div className="min-w-0">
                                <span className="block truncate text-[11px] font-black">
                                  {
                                    item
                                  }
                                </span>

                                <span className="mt-1 block text-[8px] text-[var(--muted)]">
                                  {count.toLocaleString(
                                    "fa-IR",
                                  )}{" "}
                                  کالا
                                </span>
                              </div>
                            </div>

                            {active && (
                              <span
                                className="
                                  flex
                                  h-6
                                  w-6
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-[var(--primary)]
                                "
                              >
                                <Check className="h-3.5 w-3.5 text-white" />
                              </span>
                            )}
                          </button>
                        );
                      },
                    )
                  ) : (
                    <div
                      className="
                        rounded-2xl
                        border
                        border-dashed
                        border-[var(--border)]
                        bg-[var(--surface-2)]
                        px-5
                        py-12
                        text-center
                      "
                    >
                      <Search className="mx-auto h-7 w-7 text-[var(--muted)]" />

                      <p className="mt-3 text-[10px] font-black">
                        برندی پیدا نشد
                      </p>

                      <p className="mt-1 text-[8px] text-[var(--muted)]">
                        عبارت جستجو را تغییر بده.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================== */}

        {activePanel ===
          "main" && (
          <div
            className="
              safe-area-pb
              shrink-0
              border-t
              border-[var(--border)]
              bg-[var(--surface)]
              p-4
            "
          >
            <div className="flex gap-2">
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    flex
                    h-12
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface-2)]
                    px-4
                    text-[10px]
                    font-black
                    text-[var(--danger)]
                    transition
                    active:scale-95
                  "
                >
                  <RotateCcw className="h-3.5 w-3.5" />

                  پاک کردن
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="
                  flex
                  h-12
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[var(--primary)]
                  text-[11px]
                  font-black
                  text-white
                  shadow-[0_8px_25px_color-mix(in_srgb,var(--primary)_25%,transparent)]
                  transition
                  active:scale-[0.98]
                "
              >
                نمایش

                <span>
                  {resultCount.toLocaleString(
                    "fa-IR",
                  )}
                </span>

                محصول
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE NESTED HEADER
========================================================= */

function MobileNestedHeader({
  title,
  description,
  onBack,
}: {
  title: string;
  description: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="بازگشت"
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-[var(--border)]
          bg-[var(--surface-2)]
          text-[var(--text)]
          transition
          active:scale-95
        "
      >
        <ChevronLeft className="h-4 w-4 rotate-180" />
      </button>

      <div className="min-w-0">
        <h3 className="truncate text-sm font-black">
          {title}
        </h3>

        <p className="mt-1 text-[8px] text-[var(--muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE SORT SHEET
========================================================= */

function MobileSortSheet({
  value,
  onChange,
  onClose,
}: {
  value: Sort;
  onChange: (value: Sort) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      <button
        type="button"
        aria-label="بستن"
        onClick={onClose}
        className="
          absolute
          inset-0
          bg-black/55
          backdrop-blur-sm
        "
      />

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          rounded-t-[30px]
          border-t
          border-[var(--border)]
          bg-[var(--surface)]
          p-5
          shadow-[0_-20px_70px_rgba(0,0,0,0.25)]
        "
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black">
              مرتب‌سازی
            </h2>

            <p className="mt-1 text-[9px] text-[var(--muted)]">
              ترتیب نمایش محصولات را انتخاب کن
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-[var(--surface-2)]
              text-[var(--muted)]
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 pb-3">
          <SortOption
            active={value === "popular"}
            label="پیشنهادی"
            description="نمایش بر اساس ترتیب فروشگاه"
            icon={
              <Sparkles className="h-4 w-4" />
            }
            onClick={() =>
              onChange("popular")
            }
          />

          <SortOption
            active={value === "cheap"}
            label="ارزان‌ترین"
            description="کمترین قیمت ابتدا نمایش داده شود"
            icon={
              <ArrowDownAZ className="h-4 w-4" />
            }
            onClick={() =>
              onChange("cheap")
            }
          />

          <SortOption
            active={
              value === "expensive"
            }
            label="گران‌ترین"
            description="بیشترین قیمت ابتدا نمایش داده شود"
            icon={
              <ArrowUpAZ className="h-4 w-4" />
            }
            onClick={() =>
              onChange("expensive")
            }
          />

          <SortOption
            active={value === "stock"}
            label="بیشترین موجودی"
            description="کالاهای موجودتر ابتدا نمایش داده شوند"
            icon={
              <Zap className="h-4 w-4" />
            }
            onClick={() =>
              onChange("stock")
            }
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SORT OPTION
========================================================= */

function SortOption({
  active,
  label,
  description,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-right transition",
        active
          ? "border-[var(--primary)] bg-[var(--primary-light)]"
          : "border-[var(--border)] bg-[var(--surface-2)]",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          active
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--surface)] text-[var(--muted)]",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-black">
          {label}
        </span>

        <span className="mt-1 block text-[8px] leading-4 text-[var(--muted)]">
          {description}
        </span>
      </span>

      {active && (
        <span
          className="
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[var(--primary)]
          "
        >
          <Check className="h-3.5 w-3.5 text-white" />
        </span>
      )}
    </button>
  );
}

/* =========================================================
   EMPTY PRODUCTS
========================================================= */

function EmptyProducts({
  hasFilters,
  clearFilters,
}: {
  hasFilters: boolean;
  clearFilters: () => void;
}) {
  return (
    <div
      className="
        mt-5
        flex
        min-h-[400px]
        flex-col
        items-center
        justify-center
        rounded-[24px]
        border
        border-dashed
        border-[var(--border)]
        bg-[var(--surface)]
        px-6
        text-center
      "
    >
      <div
        className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-[var(--primary-light)]
          text-[var(--primary)]
        "
      >
        <Search className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-base font-black">
        محصولی پیدا نشد
      </h2>

      <p className="mt-2 max-w-xs text-[10px] leading-6 text-[var(--muted)]">
        عبارت جستجو یا فیلترهای انتخابی را تغییر
        بده و دوباره امتحان کن.
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="
            btn
            btn-primary
            mt-5
            h-10
            text-[10px]
          "
        >
          <RotateCcw className="h-3.5 w-3.5" />

          حذف فیلترها
        </button>
      )}
    </div>
  );
}

/* =========================================================
   PRICE FORMAT
========================================================= */

function formatPrice(value: number) {
  if (!value) {
    return "۰ تومان";
  }

  return `${Math.round(
    value,
  ).toLocaleString("fa-IR")} تومان`;
}