/**
 * API response types - aligned with backend contract.
 * Same shape for Admin Panel, User Panel, and Mobile.
 */

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export interface ListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: ListMeta;
}

export function isApiError(r: unknown): r is ApiErrorResponse {
  return typeof r === 'object' && r !== null && 'success' in r && (r as ApiErrorResponse).success === false;
}
