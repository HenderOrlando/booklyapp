# ✅ Features Fase 2 - Calendario

**Fecha**: Noviembre 21, 2025, 5:05 AM  
**Estado**: 🚧 **EN PROGRESO**

---

## 📋 Features Implementadas

### 1. ✅ Reserva Rápida (Click Derecho)

**Tiempo estimado**: 1h  
**Tiempo real**: 15 minutos  
**Estado**: ✅ COMPLETADO

#### Implementación

**Archivo**: `CalendarDayCell.tsx`

**Funcionalidad**:

- Click derecho en cualquier día del calendario
- Abre modal de nueva reserva con la fecha pre-seleccionada
- Previene el menú contextual del navegador
- Funciona igual que click izquierdo pero más rápido

**Código agregado**:

```typescript
const handleContextMenu = (e: React.MouseEvent) => {
  e.preventDefault(); // Prevenir menú contextual del navegador
  if (!day.isDisabled && onClick) {
    onClick(day.date); // Crear reserva rápida con click derecho
  }
};

// En el botón:
<button
  onClick={handleClick}
  onContextMenu={handleContextMenu}  // ← NUEVO
  ...
>
```

#### UX

- **Click izquierdo**: Crea reserva (comportamiento actual)
- **Click derecho**: Crea reserva rápida (nuevo)
- **Hover**: Muestra tooltip con eventos del día

#### Beneficios

- ✅ UX mejorado para usuarios power
- ✅ Acceso rápido a crear reserva
- ✅ No interfiere con funcionalidad existente
- ✅ Implementación simple y robusta

---

### 2. ✅ Drag & Drop Recursos

**Tiempo estimado**: 4-6h  
**Tiempo real**: 3h  
**Estado**: ✅ COMPLETADO

#### Implementación

**Opción elegida**: HTML5 Drag and Drop API (nativa, sin dependencias)

- `ResourceFilterPanel.tsx` ahora marca cada item como `draggable`, ejecuta `onDragStart/onDragEnd` y aplica estilos `cursor-grab/active`
- `CalendarDayCell.tsx` agrega `onDragOver/onDrop`, previene el default y marca visualmente el día (`border-2 border-green-500 bg-green-50`)
- `CalendarGrid.tsx` almacena `dragOverDay` en `useState` para resaltar solo la celda actual
- `calendario/page.tsx` mantiene `draggedResource` en `useState`, abre el modal con `selectedDate` e `initialResourceId` y limpia el estado al finalizar
- `ReservationModal` recibe `initialResourceId` e `initialDate`, rellenando automáticamente el formulario

**Resultado**: Arrastrar un recurso al calendario abre el modal con fecha y recurso preseleccionados, listo para completar horarios y descripción.

#### UX y feedback visual

- Recurso arrastrado: `opacity-50` + `cursor-grabbing`
- Día válido (hover): borde y fondo verde
- Día inválido/disable: ignora drop
- Tooltip de reserva sigue funcionando, sin interferir con drag
- Al soltar se abre modal integrado sin navegar

#### Implementación

**Archivos a modificar**:

- `ResourceFilterPanel.tsx` - Items drag
  gables

- `CalendarDayCell.tsx` - Drop zones
- `calendario/page.tsx` - Handler de drop

**Estados necesarios**:

```typescript
const [draggedResource, setDraggedResource] = useState<Resource | null>(null);
```

**Handlers**:

```typescript
// En ResourceFilterPanel
const handleDragStart = (resource: Resource) => {
  setDraggedResource(resource);
};

// En CalendarDayCell
const handleDrop = (date: Date) => {
  if (draggedResource) {
    onCreateReservation({ date, resourceId: draggedResource.id });
    setDraggedResource(null);
  }
};
```

#### Visual Feedback

- Recurso arrastrado: opacity 0.5
- Día válido (hover): border verde
- Día inválido: border rojo
- Cursor: grab/grabbing

---

### 3. ✅ Modal Integrado

**Tiempo estimado**: 3-4h  
**Tiempo real**: 1h  
**Estado**: ✅ COMPLETADO

#### Implementación

- `calendario/page.tsx` renderiza `ReservationModal` inline dentro del layout
- `handleOpenModal` controla `selectedDate` e `isModalOpen`
- `ReservationModal` recibe `resources`, `initialDate`, `initialResourceId` y callbacks `onSave/onClose`
- Hook `useCreateReservation` se ejecuta al guardar y cierra el modal al finalizar
- `useSearchParams` permite abrir el modal con query params `?date=&resourceId=` para la reserva rápida desde `/recursos/[id]`

#### Integraciones clave

- Click izquierdo o derecho en `CalendarDayCell` abre el modal (con fecha preseleccionada)
- Drag & drop de recursos reutiliza el mismo modal con props iniciales
- Reserva rápida desde `/recursos/[id]` agrega `router.push('/calendario?date=...&resourceId=...')` y el calendario abre el modal automáticamente
- `ReservationModal` usa `useEffect` para actualizar `formData` cuando cambian los props iniciales

#### Beneficios

- ✅ No cambia de ruta (mejor UX)
- ✅ Mantiene contexto del calendario
- ✅ Más rápido (no hay navegación)
- ✅ Permite crear múltiples reservas rápidamente

---

### 4. 🔜 Drag & Drop Reagendar

**Tiempo estimado**: 2-3h  
**Estado**: 🔜 PENDIENTE

#### Objetivo

Arrastrar eventos existentes para cambiar su fecha/hora.

#### Plan

**Funcionalidad**:

1. Eventos son draggables
2. Soltar en otro día mueve la reserva
3. Validar conflictos
4. Actualizar en backend
5. Optimistic update en UI

#### Implementación

**Cambio 1**: Eventos draggables

```typescript
// En CalendarEventBadge
<div
  draggable
  onDragStart={() => onDragStart(event)}
  onDragEnd={() => onDragEnd()}
>
  {event.title}
</div>
```

**Cambio 2**: Días drop zones

```typescript
// En CalendarDayCell
const handleDropEvent = (event: CalendarEvent, newDate: Date) => {
  // Validar que no hay conflicto
  if (hasConflict(event, newDate)) {
    showError("Conflicto de horario");
    return;
  }

  // Actualizar reserva
  updateReservation({
    id: event.id,
    startDate: newDate,
    endDate: calculateEndDate(newDate, event.duration),
  });
};
```

**Cambio 3**: Validación

```typescript
const hasConflict = (event, newDate) => {
  const eventsOnDay = getEventsForDay(newDate);
  return eventsOnDay.some(
    (e) => e.resourceId === event.resourceId && overlaps(e.time, event.time)
  );
};
```

#### Visual Feedback

- Evento en drag: opacity 0.7, shadow
- Día válido: border verde + check icon
- Día conflicto: border rojo + warning icon
- Loading: spinner mientras actualiza

---

## 📊 Resumen de Implementación

| Feature                        | Estado       | Tiempo Est. | Tiempo Real | Archivos Clave                                                                                                      |
| ------------------------------ | ------------ | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| Reserva rápida (click derecho) | ✅ Completo  | 1h          | 15min       | `CalendarDayCell.tsx`                                                                                               |
| Drag & Drop recursos           | ✅ Completo  | 4-6h        | 3h          | `ResourceFilterPanel.tsx`, `CalendarDayCell.tsx`, `CalendarGrid.tsx`, `calendario/page.tsx`, `ReservationModal.tsx` |
| Modal integrado                | ✅ Completo  | 3-4h        | 1h          | `calendario/page.tsx`, `ReservationModal.tsx`                                                                       |
| Drag & Drop reagendar          | 🔜 Pendiente | 2-3h        | -           | `CalendarEventBadge.tsx`, `CalendarDayCell.tsx`                                                                     |
| **TOTAL FASE 2**               | 75%          | 10-14h      | 4h 15min    | —                                                                                                                   |

---

## 🎯 Prioridad de Implementación

Basado en valor/esfuerzo:

1. ✅ **Reserva rápida** - Completada (alta valor, bajo esfuerzo)
2. ✅ **Drag & Drop recursos** - Completada (alto valor, alto esfuerzo)
3. ✅ **Modal integrado** - Completada (alta valor, medio esfuerzo)
4. 🔜 **Drag & Drop reagendar** - Pendiente (medio valor, medio esfuerzo)

---

## 🔧 Cambios Técnicos Necesarios

### Dependencias

**NO se requieren** nuevas dependencias:

- ✅ HTML5 Drag and Drop (nativo)
- ✅ React state (actual)
- ✅ React Query (instalado)

**Alternativa considerada pero descartada**:

- ❌ react-beautiful-dnd (deprecated)
- ❌ @dnd-kit (complejo para este caso)

### Archivos a Modificar

1. **CalendarDayCell.tsx** - Drop zones + reserva rápida
2. **ResourceFilterPanel.tsx** - Drag sources
3. **CalendarEventBadge.tsx** - Draggable events
4. **calendario/page.tsx** - Modal integrado + handlers
5. **CalendarView.tsx** - Lógica de drag/drop

### Estado Global Necesario

```typescript
// En calendario/page.tsx
const [draggedResource, setDraggedResource] = useState<Resource | null>(null);
const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
```

---

## ✅ Testing Plan

### Reserva Rápida

- [ ] Click derecho abre modal
- [ ] Fecha pre-seleccionada correcta
- [ ] No muestra menú del navegador
- [ ] Funciona en todos los días válidos

### Drag & Drop Recursos

- [ ] Recurso es draggable
- [ ] Visual feedback correcto
- [ ] Drop crea reserva
- [ ] Validación de disponibilidad
- [ ] Rollback si falla

### Modal Integrado

- [ ] Modal se muestra inline
- [ ] No cambia ruta
- [ ] Mantiene contexto
- [ ] Cierra con ESC
- [ ] Overlay oscurece calendario

### Drag & Drop Reagendar

- [ ] Evento es draggable
- [ ] Drop actualiza fecha
- [ ] Valida conflictos
- [ ] Update optimista
- [ ] Rollback si falla

---

**🚀 Implementación en curso - Reserva rápida completada**
