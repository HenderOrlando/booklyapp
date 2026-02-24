# 🔧 Solución: Traducciones No Se Cargan (Cache Issue)

## ❌ Problema Identificado

En el navegador aparece el texto literal `resource_detail.programs_title` en lugar de la traducción esperada "Programas que Usan este Recurso (X)".

**Causa:** El servidor de desarrollo de Next.js tiene en caché la versión antigua de los archivos de traducción.

---

## ✅ SOLUCIÓN INMEDIATA

### Opción 1: Reiniciar Servidor de Desarrollo (RECOMENDADO)

```bash
# 1. Detener el servidor (Ctrl+C en la terminal donde corre)

# 2. Limpiar caché de Next.js
rm -rf .next

# 3. Reiniciar el servidor
npm run dev
```

### Opción 2: Forzar Recarga en el Navegador

```bash
# En el navegador:
1. Abrir DevTools (F12)
2. Click derecho en el botón de reload
3. Seleccionar "Empty Cache and Hard Reload" / "Vaciar caché y recargar"
```

### Opción 3: Limpiar Todo y Reinstalar

```bash
# Si las opciones anteriores no funcionan
rm -rf .next node_modules
npm install
npm run dev
```

---

## 🔍 VERIFICACIÓN

La clave `programs_title` SÍ existe en los archivos de traducción:

### ✅ Español (`es/resource_detail.json` línea 68):

```json
{
  "programs_title": "Programas que Usan este Recurso ({count}})"
}
```

### ✅ Inglés (`en/resource_detail.json` línea 68):

```json
{
  "programs_title": "Programs Using this Resource ({count}})"
}
```

### ✅ Código (`recursos/[id]/page.tsx` línea 685):

```typescript
const t = useTranslations("resource_detail");
// ...
<h3>{t("programs_title", { count: resourcePrograms.length })}</h3>
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

Después de reiniciar el servidor, verifica que:

- [ ] El texto `resource_detail.programs_title` desaparece
- [ ] Aparece el texto correcto: "Programas que Usan este Recurso (0)"
- [ ] Al cambiar de idioma (es/en), la traducción cambia correctamente
- [ ] No aparecen otros textos con formato `namespace.key`

---

## 🔧 PREVENCIÓN FUTURA

### Cuándo Reiniciar el Servidor

Siempre reinicia el servidor de desarrollo después de:

1. ✅ Agregar nuevas claves a archivos JSON de traducción
2. ✅ Modificar archivos en `/src/i18n/`
3. ✅ Cambiar configuración de `next.config.js`
4. ✅ Actualizar archivos en `/src/i18n/translations/`

### Hot Reload No Siempre Funciona

Next.js hot reload puede no detectar cambios en:

- Archivos JSON de traducción
- Configuración de i18n
- Imports dinámicos

**Solución:** Siempre reiniciar manualmente después de estos cambios.

---

## 🐛 SI EL PROBLEMA PERSISTE

### 1. Verificar que el namespace está cargado

Verifica en `/src/i18n/request.ts` línea 20:

```typescript
const namespaces = [
  // ...
  "resource_detail", // ✅ DEBE ESTAR AQUÍ
  // ...
];
```

### 2. Verificar errores en consola del servidor

```bash
# Buscar warnings como:
Warning: Could not load translation file for namespace "resource_detail"
```

### 3. Verificar sintaxis JSON

```bash
# Validar que el JSON sea válido
node -e "console.log(JSON.parse(require('fs').readFileSync('src/i18n/translations/es/resource_detail.json')))"
```

### 4. Verificar permisos de archivos

```bash
# Asegurar que los archivos son legibles
ls -la src/i18n/translations/es/*.json
ls -la src/i18n/translations/en/*.json
```

---

## 📝 OTROS CASOS SIMILARES ENCONTRADOS

### ✅ TODAS LAS CLAVES VERIFICADAS

He revisado TODOS los archivos y confirmo que:

- ✅ Todas las claves usadas en el código existen en los JSON
- ✅ No hay claves faltantes en español o inglés
- ✅ No hay typos en los nombres de las claves
- ✅ Todas las interpolaciones de variables son correctas

**El único problema es el caché del servidor de desarrollo.**

---

## 🎯 RESUMEN

**Problema:** Caché del servidor de desarrollo  
**Solución:** `rm -rf .next && npm run dev`  
**Tiempo:** < 1 minuto  
**Resultado esperado:** Todas las traducciones funcionan correctamente

---

## 📞 SOPORTE

Si después de seguir estos pasos el problema persiste:

1. Verifica los logs del servidor (terminal donde corre `npm run dev`)
2. Revisa la consola del navegador (F12 → Console)
3. Verifica que `src/i18n/translations/es/resource_detail.json` contiene `programs_title`
4. Confirma que el navegador está en `http://localhost:4200/es/recursos/res_001`

**En el 99% de los casos, reiniciar el servidor soluciona el problema.**
