# Próximos Pasos - Refactor Atomic Design

## 🎯 Acción Inmediata Requerida

### 1. Modificar DetailLayout Component

**Archivo a editar**: `src/components/templates/DetailLayout/DetailLayout.tsx`

**Problema**: DetailLayout actualmente solo acepta `badge` como objeto con `{text, variant}`, pero necesitamos pasar componentes React como `<StatusBadge />`.

**Solución**:

```typescript
// En DetailLayoutProps interface (línea ~40)
interface DetailLayoutProps {
  // ... props existentes
  badge?: {
    text: string;
    variant?: "default" | "success" | "warning" | "error" | "primary" | "secondary";
  };
  badgeSlot?: React.ReactNode; // AGREGAR ESTA LÍNEA
  // ... resto de props
}

// En el render (buscar donde se renderiza el badge, línea ~120-130)
// REEMPLAZAR:
{badge && (
  <Badge variant={badge.variant}>{badge.text}</Badge>
)}

// POR:
{badgeSlot ? (
  badgeSlot
) : badge ? (
  <Badge variant={badge.variant}>{badge.text}</Badge>
) : null}
```

**Impacto**: Permite retro-compatibilidad con código existente mientras soporta nuevos componentes.

---

### 2. Verificar Compilación

Después de modificar DetailLayout:

```bash
cd bookly-mock-frontend
npm run build
# o
npm run dev
```

**Resultado esperado**: Sin errores de TypeScript

---

### 3. Continuar con categorias/page.tsx

Una vez DetailLayout esté ajustado, continuar con:

**Archivo**: `src/app/categorias/page.tsx`

**Componentes a aplicar**:

- `<StatusBadge type="category" status={...} />`
- `<ColorSwatch color={category.color} />`
- `<SearchBar .../>`
- `<ConfirmDialog .../>`
- `<LoadingSpinner .../>`

**Ahorro estimado**: ~40 líneas

---

## 📋 Checklist de Validación

Antes de dar por completado cada paso:

- [ ] TypeScript compila sin errores
- [ ] Página renderiza correctamente en navegador
- [ ] Funcionalidad existente no se rompe
- [ ] Design system respetado
- [ ] Imports correctos y ordenados
- [ ] Documentación actualizada

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Linter
npm run lint

# Type check
npx tsc --noEmit
```

---

## 📊 Estado Actual

- **Componentes creados**: 7/7 (100%)
- **Páginas refactorizadas**: 1.9/5 (38%)
- **Próximo hito**: DetailLayout + categorias/page.tsx
- **ETA completar Fase 1**: ~2 horas

---

**Prioridad**: 🔴 Alta  
**Bloqueante**: Modificar DetailLayout para continuar
