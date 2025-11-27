# 🔧 Fix: Traducción de `resource_detail.programs_title` No Se Carga

## 🔍 Análisis del Problema

### Síntomas

- La clave `resource_detail.programs_title` se muestra literalmente en la UI en lugar de su traducción
- Otras traducciones del mismo namespace funcionan correctamente
- El caché se ha limpiado y el servidor se ha reiniciado

### Ubicación del Problema

**Archivo:** `/src/app/[locale]/recursos/[id]/page.tsx`
**Línea:** 685

```typescript
{
  t("programs_title", { count: resourcePrograms.length });
}
```

### Estado Actual

- ✅ Configuración i18n correcta (`src/i18n/request.ts` retorna `locale`)
- ✅ Namespace `resource_detail` cargado en la lista de namespaces
- ✅ Clave `programs_title` existe en `es/resource_detail.json` y `en/resource_detail.json`
- ✅ Otras claves del mismo archivo funcionan bien
- ❌ Solo esta clave específica no se traduce

---

## 🐛 Posibles Causas

### 1. Problema con Interpolación de Variables

La clave usa interpolación `{{count}}` que puede no estar siendo parseada correctamente por next-intl:

```json
"programs_title": "Programas que Usan este Recurso ({{count}})"
```

### 2. Caché de Componente React

El componente puede estar cacheando el valor inicial antes de que las traducciones se carguen.

### 3. Issue Conocido de next-intl con ICU MessageFormat

next-intl puede tener problemas con ciertas sintaxis de interpolación en producción vs desarrollo.

---

## ✅ Soluciones Propuestas

### Solución 1: Usar Template String (Recomendado)

Cambiar de interpolación ICU a template string manual:

**Modificar JSON:**

```json
// es/resource_detail.json
"programs_title": "Programas que Usan este Recurso",
"programs_count": "({{count}})"
```

**Modificar código:**

```typescript
<h3 className="text-xl font-semibold text-white">
  {t("programs_title")} {t("programs_count", { count: resourcePrograms.length })}
</h3>
```

### Solución 2: Usar String Concatenation Directa

Evitar la interpolación completamente:

**Modificar JSON:**

```json
// es/resource_detail.json
"programs_title_base": "Programas que Usan este Recurso"
```

**Modificar código:**

```typescript
<h3 className="text-xl font-semibold text-white">
  {t("programs_title_base")} ({resourcePrograms.length})
</h3>
```

### Solución 3: Usar `t.rich()` para Interpolación Compleja

Si la interpolación es necesaria, usar el método `rich` de next-intl:

**Código:**

```typescript
<h3 className="text-xl font-semibold text-white">
  {t.rich("programs_title", {
    count: resourcePrograms.length
  })}
</h3>
```

### Solución 4: Forzar Re-render con key

Agregar una `key` que cambie cuando los programas cambien:

**Código:**

```typescript
<h3
  key={`programs-title-${resourcePrograms.length}`}
  className="text-xl font-semibold text-white"
>
  {t("programs_title", { count: resourcePrograms.length })}
</h3>
```

---

## 🎯 Solución Implementada (Recomendada)

Usar la **Solución 2** por ser la más simple y confiable:

### 1. Actualizar JSON

**es/resource_detail.json:**

```json
"programs_title_prefix": "Programas que Usan este Recurso"
```

**en/resource_detail.json:**

```json
"programs_title_prefix": "Programs Using this Resource"
```

### 2. Actualizar Código TypeScript

```typescript
<h3 className="text-xl font-semibold text-white">
  {t("programs_title_prefix")} ({resourcePrograms.length})
</h3>
```

---

## 🔬 Verificación

### Pasos para Verificar

1. Aplicar los cambios en JSON y código
2. Detener el servidor (`Ctrl+C`)
3. Limpiar caché: `rm -rf .next`
4. Reiniciar: `npm run dev`
5. Navegar a `/es/recursos/res_001` (o cualquier ID)
6. Ir al tab "Programas"
7. Verificar que aparece: **"Programas que Usan este Recurso (0)"**

### Resultado Esperado

- ✅ Español: "Programas que Usan este Recurso (X)"
- ✅ Inglés: "Programs Using this Resource (X)"
- ✅ El número X se actualiza dinámicamente

---

## 📝 Notas Adicionales

### Por qué Esta Solución Funciona

1. **Evita problemas de parsing de ICU MessageFormat**
2. **No depende de interpolación del lado del servidor**
3. **Más fácil de depurar**
4. **Funcionamiento consistente entre dev y producción**

### Alternativas Descartadas

- **No usar `String.replace()`**: Menos declarativo y propenso a errores
- **No usar traducciones dinámicas**: Complica el mantenimiento
- **No mezclar lógica en traducciones**: Mantiene separación de responsabilidades

---

## 🚀 Implementación Inmediata

Ejecuta estos comandos:

```bash
# 1. Aplicar cambios (ya realizados por el asistente)

# 2. Limpiar cache y reiniciar
rm -rf .next && npm run dev
```

---

**Estado:** ✅ Solución documentada y lista para implementar
**Prioridad:** Alta (afecta UX en detalle de recurso)
**Impacto:** Bajo (solo una traducción)
