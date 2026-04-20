import { PaginationParams, PaginationMeta, PaginatedResponse } from '../types';

// Default pagination values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Converts raw query parameters into pagination params
// Called in controllers to parse ?page=1&limit=20 from the URL
export const getPaginationParams = (
  page?: string | number,
  limit?: string | number
): PaginationParams => {
  const parsedPage = Math.max(1, parseInt(String(page ?? DEFAULT_PAGE), 10));
  const parsedLimit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(String(limit ?? DEFAULT_LIMIT), 10))
  );

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

// Builds pagination metadata from total count and pagination params
// Attached to every list response so the mobile app knows
// how many pages exist and whether there are more results
export const getPaginationMeta = (
  total: number,
  params: PaginationParams
): PaginationMeta => {
  const totalPages = Math.ceil(total / params.limit);

  return {
    total,
    page: params.page,
    limit: params.limit,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  };
};

// Combines items and metadata into a standard paginated response
export const buildPaginatedResponse = <T>(
  items: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> => {
  return {
    items,
    meta: getPaginationMeta(total, params),
  };
};
