/**
 * Tipos de respuesta estándar del API Gateway
 * Basados en el backend bookly-mock
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiFieldError[];
  meta?: PaginationMeta;
  timestamp?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  context?: Record<string, unknown>;
}

export interface ApiFieldError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  code: string;
  message: string;
  type: "error" | "warning" | "info";
  exception_code?: string;
  http_code: number;
  http_exception: string;
  timestamp: string;
  path?: string;
  details?: unknown;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  data?: T[];
  meta: PaginationMeta;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  search?: string;
  filters?: Record<string, unknown>;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface FilterOptions {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "like";
  value: string | number | boolean | string[] | number[];
}
