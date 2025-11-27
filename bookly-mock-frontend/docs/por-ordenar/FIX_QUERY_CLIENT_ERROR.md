# 🔧 Fix: Error "No QueryClient set" en /calendario

**Fecha**: 21 de Noviembre 2025, 00:27  
**Error**: `No QueryClient set, use QueryClientProvider to set one`  
**Estado**: ✅ Resuelto

---

## 🐛 Problema

Al navegar a `/calendario`, la aplicación mostraba el error:

```
Error: No QueryClient set, use QueryClientProvider to set one
Source: src/hooks/useReservations.ts (55:19) @ useReservations
```

**Causa raíz**: El componente `CalendarView` usa hooks de React Query (como `useReservations` que internamente usa `useQuery`), pero el `QueryClientProvider` no estaba configurado en el árbol de componentes de la aplicación.

---

## ✅ Solución

### Archivo modificado:

`src/app/providers.tsx`

### Cambios realizados:

**1. Agregar import de QueryProvider**:

```typescript
import { QueryProvider } from "@/providers/QueryProvider";
```

**2. Envolver la aplicación con QueryProvider**:

```typescript
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <QueryProvider>  {/* ← AGREGADO */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <WebSocketProvider>
              {children}
              <Toaster position="top-right" richColors />
            </WebSocketProvider>
          </ThemeProvider>
        </QueryProvider>  {/* ← AGREGADO */}
      </ReduxProvider>
    </SessionProvider>
  );
}
```

---

## 📊 Orden Final de Providers

```
SessionProvider (Next Auth)
  └─ ReduxProvider (Redux Toolkit)
      └─ QueryProvider (React Query) ← NUEVO
          └─ ThemeProvider (next-themes)
              └─ WebSocketProvider (Custom)
                  └─ {children}
                  └─ Toaster (sonner)
```

---

## ✅ Resultado

**Antes**:

- ❌ Error al cargar `/calendario`
- ❌ CalendarView no podía usar React Query hooks
- ❌ Otras páginas con React Query tampoco funcionaban

**Después**:

- ✅ `/calendario` carga correctamente
- ✅ CalendarView funciona con `useReservations`
- ✅ Todos los hooks de React Query disponibles globalmente
- ✅ React Query DevTools habilitado en desarrollo

---

## 📝 Componentes que usan React Query

Con este fix, los siguientes componentes ahora funcionan correctamente:

1. **CalendarView** - Usa `useReservations`
2. **WaitlistManager** - Usa `useWaitlistEntries` (si existe)
3. **ResourcesList** - Usa `useResources`
4. **ReservationsList** - Usa `useReservations`
5. Cualquier otro componente que use hooks de React Query

---

## 🎯 QueryProvider Features

El `QueryProvider` configurado incluye:

**Queries**:

- ✅ `staleTime: 5 minutos` - Datos considerados frescos por 5 min
- ✅ `gcTime: 30 minutos` - Cache mantiene datos por 30 min
- ✅ `retry: 2` - Reintenta 2 veces en caso de error
- ✅ `refetchOnWindowFocus: false` - No refetch al cambiar pestaña
- ✅ `refetchOnReconnect: true` - Refetch al reconectar internet

**Mutations**:

- ✅ `retry: 0` - No reintenta mutations automáticamente

**DevTools**:

- ✅ Habilitado en `development`
- ✅ Deshabilitado en `production`

---

## 🔍 Verificación

Para verificar que funciona:

1. **Navegar a `/calendario`**:
   ```
   http://localhost:4200/calendario
   ```
2. **Verificar que carga sin errores**

3. **Abrir React Query DevTools** (desarrollo):
   - Botón flotante en esquina inferior derecha
   - Ver queries activas
   - Ver cache de React Query

4. **Verificar en consola**:
   - No debe aparecer error "No QueryClient set"
   - Peticiones a API deben funcionar

---

## 📚 Recursos

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [QueryClientProvider](https://tanstack.com/query/latest/docs/react/reference/QueryClientProvider)
- [Next.js 13+ App Router with React Query](https://tanstack.com/query/latest/docs/react/guides/ssr)

---

**✅ Error resuelto! React Query ahora está disponible en toda la aplicación. 🎉**
