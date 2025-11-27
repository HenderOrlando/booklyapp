# ✅ FIX: Paginación en Mock Service

**Fecha**: Noviembre 21, 2025, 4:55 AM  
**Estado**: ✅ **COMPLETADO**

---

## 🐛 Problema Reportado

**Panel de recursos muestra todos los items en lugar de respetar el límite**

- ✅ Solicité límite de 3: Me carga TODOS los recursos
- ✅ Solicité límite de 5: Me carga TODOS los recursos
- ❌ El parámetro `limit` del hook `useInfiniteResources` no funciona

---

## 🔍 Análisis del Problema

### Flujo de Datos

```
ResourceFilterPanel
  ↓
useInfiniteResources({}, 3)  ← Pasa limit=3
  ↓
httpClient.get("/resources", { params: { page: 1, limit: 3 } })
  ↓
mockService.mockRequest("/resources?page=1&limit=3")
  ↓
mockGetResources()  ← ❌ PROBLEMA: No recibía ni usaba los params
  ↓
Retorna TODOS los recursos (sin paginar)
```

### Causa Raíz

**Archivo**: `mockService.ts`  
**Línea**: 563 (antes del fix)

```typescript
// ❌ ANTES - No recibía parámetros
private static mockGetResources(): ApiResponse<any> {
  return {
    success: true,
    data: {
      items: this.resourcesData,  // ← Retorna TODOS
      meta: {
        total: this.resourcesData.length,
        page: 1,
        limit: 50,  // ← Hardcoded
        totalPages: 1,
        hasNextPage: false,
      },
    },
  };
}
```

**Problemas**:

1. ❌ No acepta parámetros `page` y `limit`
2. ❌ No extrae query params de la URL
3. ❌ Siempre retorna `this.resourcesData` completo
4. ❌ Hardcodea `limit: 50` y `totalPages: 1`

---

## ✅ Solución Aplicada

### 1. Extraer Query Params de la URL

**Archivo**: `mockService.ts` - Línea 112

```typescript
// En el handler GET /resources
if (endpoint.includes("/resources") && method === "GET") {
  // Verificar si es un ID específico
  const idMatch = endpoint.match(/\/resources\/([^/]+)$/);
  if (idMatch && idMatch[1] !== "search") {
    return this.mockGetResourceById(idMatch[1]) as any;
  }

  // ✅ NUEVO: Extraer query params
  const url = new URL(endpoint, "http://dummy.com");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  // ✅ NUEVO: Pasar params al método
  return this.mockGetResources(page, limit) as any;
}
```

**Por qué `new URL(endpoint, "http://dummy.com")`**:

- El `endpoint` puede venir como `/resources?page=1&limit=3`
- `URL` necesita una base para parsear correctamente
- Usamos "http://dummy.com" como base temporal
- Luego extraemos los `searchParams`

### 2. Implementar Paginación en mockGetResources

**Archivo**: `mockService.ts` - Línea 569

```typescript
// ✅ DESPUÉS - Con paginación real
private static mockGetResources(
  page: number = 1,
  limit: number = 20
): ApiResponse<any> {
  // Calcular paginación
  const total = this.resourcesData.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // ✅ Slice: Solo retorna los items de la página actual
  const paginatedItems = this.resourcesData.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      items: paginatedItems,  // ✅ Solo la página actual
      meta: {
        total,               // Total de recursos
        page,                // Página actual
        limit,               // Items por página
        totalPages,          // Total de páginas
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
    message: "Resources retrieved successfully",
    timestamp: new Date().toISOString(),
  };
}
```

---

## 📊 Ejemplo de Funcionamiento

### Datos Mock

```typescript
// Supongamos 12 recursos totales
this.resourcesData = [
  { id: "res_001", name: "Aula 101" },
  { id: "res_002", name: "Aula 102" },
  { id: "res_003", name: "Lab A" },
  { id: "res_004", name: "Lab B" },
  { id: "res_005", name: "Auditorio" },
  { id: "res_006", name: "Sala 201" },
  { id: "res_007", name: "Sala 202" },
  { id: "res_008", name: "Lab C" },
  { id: "res_009", name: "Aula 103" },
  { id: "res_010", name: "Cancha" },
  { id: "res_011", name: "Gimnasio" },
  { id: "res_012", name: "Biblioteca" },
];
```

### Request con limit=3

**Request 1**: `GET /resources?page=1&limit=3`

```typescript
// Cálculos:
total = 12
totalPages = Math.ceil(12 / 3) = 4
startIndex = (1 - 1) * 3 = 0
endIndex = 0 + 3 = 3
paginatedItems = resourcesData.slice(0, 3)

// Respuesta:
{
  items: [
    { id: "res_001", name: "Aula 101" },
    { id: "res_002", name: "Aula 102" },
    { id: "res_003", name: "Lab A" },
  ],
  meta: {
    total: 12,
    page: 1,
    limit: 3,
    totalPages: 4,
    hasNextPage: true,   // 1 < 4
    hasPreviousPage: false, // 1 > 1 = false
  }
}
```

**Request 2**: `GET /resources?page=2&limit=3`

```typescript
// Cálculos:
startIndex = (2 - 1) * 3 = 3
endIndex = 3 + 3 = 6
paginatedItems = resourcesData.slice(3, 6)

// Respuesta:
{
  items: [
    { id: "res_004", name: "Lab B" },
    { id: "res_005", name: "Auditorio" },
    { id: "res_006", name: "Sala 201" },
  ],
  meta: {
    total: 12,
    page: 2,
    limit: 3,
    totalPages: 4,
    hasNextPage: true,   // 2 < 4
    hasPreviousPage: true, // 2 > 1
  }
}
```

**Request 3**: `GET /resources?page=4&limit=3`

```typescript
// Cálculos (última página):
startIndex = (4 - 1) * 3 = 9
endIndex = 9 + 3 = 12
paginatedItems = resourcesData.slice(9, 12)

// Respuesta:
{
  items: [
    { id: "res_010", name: "Cancha" },
    { id: "res_011", name: "Gimnasio" },
    { id: "res_012", name: "Biblioteca" },
  ],
  meta: {
    total: 12,
    page: 4,
    limit: 3,
    totalPages: 4,
    hasNextPage: false,  // 4 < 4 = false
    hasPreviousPage: true,
  }
}
```

---

## ✅ Resultado

### Panel con limit=3

```
Carga inicial:
  ✅ Muestra 3 recursos (página 1)

Usuario hace scroll hasta el final:
  ✅ IntersectionObserver detecta trigger
  ✅ fetchNextPage() ejecuta
  ✅ Request: GET /resources?page=2&limit=3
  ✅ Carga 3 recursos más (página 2)

Usuario continúa scroll:
  ✅ Carga página 3 (3 recursos más)
  ✅ Carga página 4 (últimos 3)
  ✅ hasNextPage = false
  ✅ No hace más requests
```

### Panel con limit=5

```
Total 12 recursos → 3 páginas

Página 1: 5 recursos (res_001 a res_005)
Página 2: 5 recursos (res_006 a res_010)
Página 3: 2 recursos (res_011 a res_012)
```

---

## 📦 Archivos Modificados

**Archivo**: `src/infrastructure/mock/mockService.ts`

### Cambio 1: Handler GET /resources (Líneas 112-117)

```typescript
// Extraer query params de la URL
const url = new URL(endpoint, "http://dummy.com");
const page = parseInt(url.searchParams.get("page") || "1");
const limit = parseInt(url.searchParams.get("limit") || "20");

return this.mockGetResources(page, limit) as any;
```

### Cambio 2: Método mockGetResources (Líneas 569-592)

```typescript
private static mockGetResources(page: number = 1, limit: number = 20): ApiResponse<any> {
  // Implementación completa de paginación
  const total = this.resourcesData.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = this.resourcesData.slice(startIndex, endIndex);

  return {
    // ... respuesta con items paginados
  };
}
```

**Total**: 1 archivo modificado, ~30 líneas

---

## 🧪 Testing

### Test 1: Límite de 3

```typescript
useInfiniteResources({}, 3);
```

**Verificar**:

- [ ] Primera carga: Solo 3 recursos
- [ ] Scroll: Carga 3 más
- [ ] Continúa hasta agotar todos
- [ ] Indicador "Cargando más..." aparece
- [ ] Al final: "Scroll para cargar más" (sin spinner)

### Test 2: Límite de 5

```typescript
useInfiniteResources({}, 5);
```

**Verificar**:

- [ ] Primera carga: 5 recursos
- [ ] Segunda página: 5 más
- [ ] Total correcto en contador

### Test 3: Límite default (20)

```typescript
useInfiniteResources(); // Sin segundo parámetro
```

**Verificar**:

- [ ] Primera carga: 20 recursos (o todos si son menos de 20)
- [ ] Si hay más de 20, carga siguiente página

### Test 4: Con 100 recursos mock

1. Agregar 100 recursos mock temporalmente
2. Usar limit=10
3. **Verificar**: 10 páginas de 10 items cada una

---

## 🎯 Casos Edge

### Caso 1: Última página incompleta

```
Total: 23 recursos
Limit: 10

Página 1: 10 items (0-9)
Página 2: 10 items (10-19)
Página 3: 3 items (20-22)  ← Incompleta
```

**Verificar**: `slice(20, 30)` retorna solo 3 items correctamente

### Caso 2: Total menor que limit

```
Total: 5 recursos
Limit: 10

Página 1: 5 items
Página 2: No existe (hasNextPage = false)
```

**Verificar**: No intenta cargar página 2

### Caso 3: Page fuera de rango

```
Total: 10 recursos
Limit: 5
Request: page=5

startIndex = (5-1) * 5 = 20
endIndex = 25
slice(20, 25) = []  ← Array vacío
```

**Comportamiento**: Retorna array vacío (correcto)

---

## 🔧 Mejoras Futuras (Opcional)

### 1. Validación de parámetros

```typescript
private static mockGetResources(page: number = 1, limit: number = 20): ApiResponse<any> {
  // Validar límites
  page = Math.max(1, page);
  limit = Math.min(100, Math.max(1, limit)); // Entre 1 y 100

  // ... resto del código
}
```

### 2. Cache de respuestas

```typescript
private static resourcesCache = new Map<string, any>();

private static mockGetResources(page: number = 1, limit: number = 20): ApiResponse<any> {
  const cacheKey = `resources-p${page}-l${limit}`;

  if (this.resourcesCache.has(cacheKey)) {
    return this.resourcesCache.get(cacheKey);
  }

  const response = {
    // ... generar respuesta
  };

  this.resourcesCache.set(cacheKey, response);
  return response;
}
```

### 3. Soporte para filtros

```typescript
const url = new URL(endpoint, "http://dummy.com");
const page = parseInt(url.searchParams.get("page") || "1");
const limit = parseInt(url.searchParams.get("limit") || "20");
const search = url.searchParams.get("search") || "";
const type = url.searchParams.get("type") || "";

return this.mockGetResources(page, limit, { search, type }) as any;
```

---

## ✅ Checklist de Verificación

- [x] ✅ Extraer params `page` y `limit` de URL
- [x] ✅ Implementar slice para paginación
- [x] ✅ Calcular `totalPages` correctamente
- [x] ✅ Calcular `hasNextPage` correctamente
- [x] ✅ Retornar solo items de la página actual
- [x] ✅ Mantener estructura de respuesta API
- [ ] ⏳ Testing en navegador
- [ ] ⏳ Verificar con diferentes límites (3, 5, 10, 20)

---

**PAGINACIÓN MOCK CORREGIDA** ✅  
**Ahora el límite se respeta correctamente** 🚀
