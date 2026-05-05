import { config } from "../config/constants.js";

export interface PaginationParams {
  cursor?: string;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function parsePagination(query: {
  cursor?: string;
  limit?: string;
}): PaginationParams {
  return {
    cursor: query.cursor,
    limit: Math.min(
      Math.max(1, Number(query.limit) || config.PAGINATION_DEFAULT_LIMIT),
      config.PAGINATION_MAX_LIMIT
    ),
  };
}

export function paginate<T extends { id: string }>(
  items: T[],
  limit: number
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  return {
    data,
    nextCursor: data.length > 0 ? data[data.length - 1].id : null,
    hasMore,
  };
}
