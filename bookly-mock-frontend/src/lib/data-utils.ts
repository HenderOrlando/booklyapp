/**
 * utilidades para manejo de datos de la API
 */

/**
 * Extrae un array de datos de una respuesta de API que puede estar envuelta
 * en diferentes formatos (directo, items, resources, etc.)
 *
 * @param data - El objeto de datos de la respuesta
 * @param preferredKey - Clave preferida para buscar el array
 * @returns Un array de elementos o un array vacío si no se encuentra nada
 */
export function extractArray<T>(data: unknown, preferredKey?: string): T[] {
  if (!data || typeof data !== "object") {
    console.warn("[extractArray] Data is null or not an object:", data);
    return [];
  }

  const dataObj = data as Record<string, unknown>;

  // Caso 1: Es directamente un array
  if (Array.isArray(data)) {
    return data as T[];
  }

  // Caso 2: Clave preferida proporcionada
  if (preferredKey && Array.isArray(dataObj[preferredKey])) {
    return dataObj[preferredKey] as T[];
  }

  // Caso 3: Claves estándar comunes en Bookly
  const commonKeys = ["items", "resources", "categories", "data", "results"];
  for (const key of commonKeys) {
    if (Array.isArray(dataObj[key])) {
      return dataObj[key] as T[];
    }
  }

  // Caso 4: Doble wrapping (data.data) o anidación profunda
  // Buscamos recursivamente en cualquier objeto que tenga una propiedad 'data' o 'items' o 'resources'
  for (const key of ["data", "items", "resources"]) {
    if (
      dataObj[key] &&
      typeof dataObj[key] === "object" &&
      !Array.isArray(dataObj[key])
    ) {
      const nested = extractArray<T>(dataObj[key], preferredKey);
      if (nested.length > 0) return nested;
    }
  }

  // Caso 5: Búsqueda exhaustiva - retornar el primer array encontrado en cualquier nivel superficial
  const anyArrayKey = Object.keys(dataObj).find((key) =>
    Array.isArray(dataObj[key]),
  );
  if (anyArrayKey) {
    return dataObj[anyArrayKey] as T[];
  }

  return [];
}
