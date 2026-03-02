export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
}

/**
 * Parse page and pageSize from URL search params or a plain object.
 * Safe for use with Next.js App Router searchParams (can be string | string[]).
 */
export function parsePaginationParams(
  params:
    | { page?: string | string[]; pageSize?: string | string[] }
    | Record<string, string | string[] | undefined>
): PaginationParams {
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const pageSizeParam = Array.isArray(params.pageSize)
    ? params.pageSize[0]
    : params.pageSize;

  const page = Math.max(1, parseInt(String(pageParam ?? DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(String(pageSizeParam ?? DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
}
