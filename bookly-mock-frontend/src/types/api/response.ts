/**
 * Tipos de respuesta estándar del API Gateway
 * Basados en el backend bookly-mock
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path?: string;
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
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  search?: string;
  filters?: Record<string, any>;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface FilterOptions {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "like";
  value: any;
}
