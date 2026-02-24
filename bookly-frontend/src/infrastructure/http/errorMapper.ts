/**
 * Error Mapper — Maps BE error codes to i18n translation keys
 *
 * BE error format:
 * { code: "RSRC-0301", message: "...", type: "error", exception_code: "R-20", http_code: 404 }
 *
 * This mapper converts BE error codes into i18n keys so the FE can display
 * localized error messages instead of hardcoded Spanish strings.
 */

import type { ApiErrorResponse } from "@/types/api/response";

export interface MappedError {
  i18nKey: string;
  fallbackMessage: string;
  code: string;
  httpCode: number;
  type: "error" | "warning" | "info";
  field?: string;
}

/**
 * Module prefix → i18n namespace mapping
 */
const MODULE_NAMESPACE: Record<string, string> = {
  AUTH: "errors.auth",
  RSRC: "errors.resources",
  AVAIL: "errors.availability",
  STCK: "errors.stockpile",
  RPT: "errors.reports",
  GW: "errors.gateway",
};

/**
 * Map a BE ApiErrorResponse to an i18n-ready MappedError
 */
export function mapApiErrorToI18n(error: ApiErrorResponse): MappedError {
  const modulePrefix = error.code?.split("-")[0] || "UNKNOWN";
  const namespace = MODULE_NAMESPACE[modulePrefix] || "errors.generic";
  const i18nKey = `${namespace}.${error.code}`;

  return {
    i18nKey,
    fallbackMessage: error.message,
    code: error.code,
    httpCode: error.http_code,
    type: error.type,
  };
}

/**
 * Map an HTTP status code to a generic i18n key when no BE error body is available
 */
export function mapHttpStatusToI18n(status: number): MappedError {
  const statusMap: Record<number, { key: string; message: string }> = {
    400: { key: "errors.http.bad_request", message: "Solicitud inválida" },
    401: { key: "errors.http.unauthorized", message: "No autorizado" },
    403: { key: "errors.http.forbidden", message: "Acceso denegado" },
    404: { key: "errors.http.not_found", message: "Recurso no encontrado" },
    409: { key: "errors.http.conflict", message: "Conflicto de datos" },
    422: { key: "errors.http.unprocessable", message: "Datos no procesables" },
    429: { key: "errors.http.rate_limited", message: "Demasiadas solicitudes" },
    500: { key: "errors.http.server_error", message: "Error interno del servidor" },
    502: { key: "errors.http.bad_gateway", message: "Servicio no disponible" },
    503: { key: "errors.http.unavailable", message: "Servicio temporalmente no disponible" },
  };

  const mapped = statusMap[status] || {
    key: "errors.http.unknown",
    message: "Error desconocido",
  };

  return {
    i18nKey: mapped.key,
    fallbackMessage: mapped.message,
    code: `HTTP-${status}`,
    httpCode: status,
    type: "error",
  };
}

/**
 * Extract a MappedError from any error object (Axios error, BE error, or generic)
 */
export function extractMappedError(error: any): MappedError {
  // BE structured error response
  if (error?.response?.data?.code && error?.response?.data?.http_code) {
    return mapApiErrorToI18n(error.response.data as ApiErrorResponse);
  }

  // HTTP error with status but no structured body
  if (error?.response?.status) {
    const mapped = mapHttpStatusToI18n(error.response.status);
    if (error.response.data?.message) {
      mapped.fallbackMessage = error.response.data.message;
    }
    return mapped;
  }

  // Network error
  if (error?.code === "ERR_NETWORK" || !error?.response) {
    return {
      i18nKey: "errors.network.connection",
      fallbackMessage: "No se pudo conectar con el servidor",
      code: "NETWORK",
      httpCode: 0,
      type: "error",
    };
  }

  // Generic fallback
  return {
    i18nKey: "errors.generic.unknown",
    fallbackMessage: error?.message || "Error desconocido",
    code: "UNKNOWN",
    httpCode: 0,
    type: "error",
  };
}
