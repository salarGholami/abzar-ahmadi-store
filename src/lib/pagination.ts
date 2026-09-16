export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { pageSize?: number; maxPageSize?: number } = {},
) {
  const defaultPageSize = defaults.pageSize ?? 20;
  const maxPageSize = defaults.maxPageSize ?? 100;
  const rawPage = Number(searchParams.get("page") || 1);
  const rawPageSize = Number(searchParams.get("pageSize") || defaultPageSize);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize =
    Number.isInteger(rawPageSize) && rawPageSize > 0
      ? Math.min(rawPageSize, maxPageSize)
      : defaultPageSize;

  return { page, pageSize };
}

export function paginate<T>(
  rows: T[],
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: rows.slice(start, start + pageSize),
    pagination: {
      page: safePage,
      pageSize,
      total,
      totalPages,
    },
  };
}

export function matchesSearch(
  row: Record<string, unknown>,
  query: string,
) {
  const q = query.trim().toLocaleLowerCase("fa-IR");
  if (!q) return true;

  return Object.values(row).some((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "object") return JSON.stringify(value).toLocaleLowerCase("fa-IR").includes(q);
    return String(value).toLocaleLowerCase("fa-IR").includes(q);
  });
}
