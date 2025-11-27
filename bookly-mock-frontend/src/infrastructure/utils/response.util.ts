/**
 * Response Utility Functions (Frontend)
 * Helper functions to handle standardized API responses from backend
 *
 * Basado en: bookly-backend/src/libs/common/utils/response.util.ts
 */

// ============================================
// INTERFACES (Deben coincidir con backend)
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdvancedSearchPaginationMeta {
  pagination: PaginationMeta;
  executionTimeMs: number;
  timestamp: Date;
  filters: any;
}

export interface ApiResponseBookly<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta | AdvancedSearchPaginationMeta;
  errors?: Record<string, string[]>;
}

// ============================================
// RESPONSE UTILITY CLASS (Frontend)
// ============================================

export class ResponseUtil {
  /**
   * Valida si una respuesta es exitosa
   */
  static isSuccess<T>(response: ApiResponseBookly<T>): boolean {
    return response.success === true;
  }

  /**
   * Extrae los datos de una respuesta exitosa
   * Lanza error si la respuesta no es exitosa
   */
  static getData<T>(response: ApiResponseBookly<T>): T {
    if (!this.isSuccess(response)) {
      throw new Error(response.message || "Request failed");
    }
    return response.data!;
  }

  /**
   * Extrae los datos de una respuesta exitosa de forma segura
   * Retorna null si la respuesta no es exitosa
   */
  static getDataSafe<T>(response: ApiResponseBookly<T>): T | null {
    if (!this.isSuccess(response)) {
      return null;
    }
    return response.data || null;
  }

  /**
   * Obtiene el mensaje de error de una respuesta
   */
  static getErrorMessage<T>(response: ApiResponseBookly<T>): string {
    return response.message || "Unknown error occurred";
  }

  /**
   * Obtiene todos los errores de validación
   */
  static getValidationErrors<T>(
    response: ApiResponseBookly<T>
  ): Record<string, string[]> | null {
    return response.errors || null;
  }

  /**
   * Verifica si la respuesta es paginada
   */
  static isPaginated<T>(response: ApiResponseBookly<T>): boolean {
    return response.meta !== undefined && "page" in response.meta;
  }

  /**
   * Obtiene la metadata de paginación
   */
  static getPaginationMeta<T>(
    response: ApiResponseBookly<T>
  ): PaginationMeta | null {
    if (!this.isPaginated(response)) {
      return null;
    }

    const meta = response.meta;
    if ("pagination" in meta!) {
      // AdvancedSearchPaginationMeta
      return (meta as AdvancedSearchPaginationMeta).pagination;
    }

    // PaginationMeta simple
    return meta as PaginationMeta;
  }

  /**
   * Verifica si hay una página siguiente
   */
  static hasNextPage<T>(response: ApiResponseBookly<T>): boolean {
    const meta = this.getPaginationMeta(response);
    if (!meta) return false;
    return meta.page < meta.totalPages;
  }

  /**
   * Verifica si hay una página anterior
   */
  static hasPrevPage<T>(response: ApiResponseBookly<T>): boolean {
    const meta = this.getPaginationMeta(response);
    if (!meta) return false;
    return meta.page > 1;
  }

  /**
   * Crea una respuesta exitosa mock (para testing/desarrollo)
   */
  static mockSuccess<T>(
    data: T,
    message?: string,
    meta?: PaginationMeta
  ): ApiResponseBookly<T> {
    const response: ApiResponseBookly<T> = {
      success: true,
      data,
    };

    if (message) {
      response.message = message;
    }

    if (meta) {
      response.meta = meta;
    }

    return response;
  }

  /**
   * Crea una respuesta paginada mock (para testing/desarrollo)
   */
  static mockPaginated<T>(
    data: T[],
    total: number,
    page: number = 1,
    limit: number = 20,
    message?: string
  ): ApiResponseBookly<T[]> {
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return this.mockSuccess<T[]>(data, message, meta);
  }

  /**
   * Crea una respuesta de error mock (para testing/desarrollo)
   */
  static mockError(
    message: string,
    errors?: Record<string, string[]>
  ): ApiResponseBookly<null> {
    const response: ApiResponseBookly<null> = {
      success: false,
      data: null,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return response;
  }

  /**
   * Transforma una respuesta de error HTTP en ApiResponseBookly
   */
  static fromHttpError(error: any): ApiResponseBookly<null> {
    // Si el error ya tiene el formato ApiResponseBookly
    if (error.response?.data?.success !== undefined) {
      return error.response.data;
    }

    // Error genérico
    return {
      success: false,
      data: null,
      message: error.message || "An unexpected error occurred",
    };
  }

  /**
   * Maneja una respuesta de forma type-safe
   * Ejecuta onSuccess si es exitosa, onError si falla
   */
  static handle<T>(
    response: ApiResponseBookly<T>,
    handlers: {
      onSuccess: (data: T, message?: string) => void;
      onError: (message: string, errors?: Record<string, string[]>) => void;
    }
  ): void {
    if (this.isSuccess(response)) {
      handlers.onSuccess(response.data!, response.message);
    } else {
      handlers.onError(response.message || "Request failed", response.errors);
    }
  }

  /**
   * Maneja una respuesta de forma async con Promise
   */
  static async handleAsync<T>(
    responsePromise: Promise<ApiResponseBookly<T>>
  ): Promise<T> {
    const response = await responsePromise;

    if (!this.isSuccess(response)) {
      throw new Error(response.message || "Request failed");
    }

    return response.data!;
  }
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Type guard para verificar si es una respuesta paginada
 */
export function isApiResponsePaginated<T>(
  response: ApiResponseBookly<T>
): response is ApiResponseBookly<T> & { meta: PaginationMeta } {
  return ResponseUtil.isPaginated(response);
}

/**
 * Type guard para verificar si es una respuesta exitosa
 */
export function isApiResponseSuccess<T>(
  response: ApiResponseBookly<T>
): response is ApiResponseBookly<T> & { data: T } {
  return ResponseUtil.isSuccess(response);
}

/**
 * Type guard para verificar si es una respuesta con errores de validación
 */
export function hasValidationErrors<T>(
  response: ApiResponseBookly<T>
): response is ApiResponseBookly<T> & { errors: Record<string, string[]> } {
  return (
    response.errors !== undefined && Object.keys(response.errors).length > 0
  );
}
