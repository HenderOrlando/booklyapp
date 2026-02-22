# Auditoría de Traducción - Bookly Frontend

## Fecha: 2025-01-23

## Páginas Auditadas

1. `/src/app/[locale]/recursos/[id]/page.tsx`
2. `/src/app/[locale]/programas/page.tsx`
3. `/src/app/[locale]/programas/[id]/page.tsx`
4. `/src/app/[locale]/recursos-virtual/page.tsx`

---

## ❌ PROBLEMAS ENCONTRADOS

### 1. **Strings Hardcodeados Visibles al Usuario**

#### `/src/app/[locale]/recursos/[id]/page.tsx`

- **Línea 339**: `"Sin categoría"` → Debe usar traducción
- **Línea 348**: `toLocaleDateString("es-ES")` → Debe usar locale dinámico
- **Líneas 547, 573, 586**: `toLocaleDateString("es-ES")` → Debe usar locale dinámico

#### `/src/app/[locale]/programas/page.tsx`

- **Línea 126**: `alert("Error al guardar el programa")` → Debe usar traducción
- **Línea 143**: `alert("Error al guardar el programa")` → Debe usar traducción
- **Línea 159**: `alert("Error al cambiar el estado del programa")` → Debe usar traducción

#### `/src/app/[locale]/programas/[id]/page.tsx`

- **Línea 175**: `alert("Error al guardar los cambios en recursos")` → Debe usar traducción
- **Línea 196**: `alert("Error al agregar el usuario al programa")` → Debe usar traducción
- **Línea 209**: `alert("Error al quitar el usuario del programa")` → Debe usar traducción
- **Línea 215**: `.replace("Crear ", "")` → Lógica hardcodeada en español

---

### 2. **Console Logs en Español (No crítico, pero debe estar en inglés)**

#### `/src/app/[locale]/recursos/[id]/page.tsx`

- **Línea 90**: `console.error("Error al cargar programas:", err)`
- **Línea 113**: `console.error("Error al eliminar recurso:", err)`
- **Línea 176**: `console.error("Error al guardar programas:", err)`

#### `/src/app/[locale]/programas/page.tsx`

- **Línea 125**: `console.error("Error al crear programa:", err)`
- **Línea 142**: `console.error("Error al actualizar programa:", err)`
- **Línea 158**: `console.error("Error al cambiar estado:", err)`

#### `/src/app/[locale]/programas/[id]/page.tsx`

- **Línea 89**: `console.error("Error al cargar datos:", err)`
- **Línea 174**: `console.error("Error al guardar recursos:", err)`
- **Línea 195**: `console.error("Error al agregar usuario:", err)`
- **Línea 208**: `console.error("Error al quitar usuario:", err)`

---

## ✅ CORRECCIONES NECESARIAS

### 1. Agregar claves faltantes a archivos de traducción

#### `resource_detail.json` (es/en)

```json
{
  "no_category": "Sin categoría / No category"
}
```

#### `programs.json` (es/en)

```json
{
  "save_error": "Error al guardar el programa / Error saving program",
  "status_change_error": "Error al cambiar el estado del programa / Error changing program status",
  "save_resources_error": "Error al guardar los cambios en recursos / Error saving resource changes",
  "add_user_error": "Error al agregar el usuario al programa / Error adding user to program",
  "remove_user_error": "Error al quitar el usuario del programa / Error removing user from program"
}
```

### 2. Usar `useParams()` para obtener locale dinámico

```typescript
const params = useParams();
const locale = (params.locale as string) || "es";

// Usar en lugar de "es-ES":
toLocaleDateString(locale);
```

### 3. Cambiar console.error a inglés

```typescript
// En lugar de:
console.error("Error al cargar programas:", err);

// Usar:
console.error("Error loading programs:", err);
```

---

## 📊 RESUMEN

- **Total de problemas críticos**: 10 (strings visibles al usuario)
- **Total de problemas menores**: 11 (console logs)
- **Archivos de traducción a actualizar**: 2 (`resource_detail.json`, `programs.json`)

---

## 🚀 PRÓXIMOS PASOS

1. Agregar claves faltantes a archivos JSON de traducción
2. Reemplazar strings hardcodeados con `t(key)`
3. Implementar uso de locale dinámico
4. Cambiar console.error a inglés
5. Verificar compilación sin errores
6. Pruebas de funcionalidad en ambos idiomas
