import { PaginationMeta, PaginatedResponse } from '../types';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export const parsePagination = (query: PaginationOptions) => {
  const page = Math.max(1, parseInt(String(query.page ?? 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? 10), 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
