# 🎯 Plan de Mejoras del Calendario - Bookly

**Fecha**: 21 de Noviembre 2025, 00:40  
**Estado**: 🚧 En Progreso

---

## 📋 Requerimientos del Usuario

### 1. Modal Integrado en Calendario ✅

- ❌ **Antes**: Modal separado que abre en nueva página
- ✅ **Después**: Interfaz integrada en el calendario (panel lateral/modal inline)

### 2. Drag & Drop de Recursos 🎯

- Mostrar/ocultar recursos con checkbox
- Arrastrar recurso a día específico → Crea reserva
- Ver disponibilidad del recurso en calendario

### 3. Drag & Drop de Reservas para Reagendar 🔄

- Arrastrar reserva existente a otra fecha
- Solicita reagendamiento automático

### 4. Reserva Rápida desde Recurso 📅

- Click en "Reserva Rápida" en recurso
- Abre calendario en vista día con recurso pre-seleccionado

### 5. Leyenda Consistente con Colores 🎨

- Actualizar colores de leyenda para que coincidan exactamente

### 6. Theme Automático (Dark/Light) 🌓

- CalendarView detecta theme actual
- Se adapta automáticamente

### 7. Selector de Theme 🔆

- Toggle dark/light en header
- Por defecto: sistema o dark
- Persistente entre sesiones

### 8. Tooltips en Reservas 💬

- Hover sobre reserva → Muestra nombre completo
- Información adicional (hora, usuario, etc.)

---

## 🏗️ Arquitectura de la Solución

### Componentes Nuevos a Crear:

1. **ThemeToggle** (Atom) ✅
   - Toggle visual dark/light
   - Integrado con next-themes

2. **ResourcePanel** (Molecule)
   - Lista de recursos con checkboxes
   - Draggable resources
   - Filtro por tipo

3. **ReservationTooltip** (Atom)
   - Muestra info completa de reserva
   - Aparece en hover

4. **DraggableResource** (Atom)
   - Recurso arrastrable
   - Visual feedback durante drag

5. **DroppableDay** (Atom)
   - Día que acepta drops
   - Highlight en hover

### Componentes a Modificar:

1. **CalendarView** (Organism)
   - Agregar soporte drag & drop
   - Integrar panel de recursos
   - Adaptar a theme
   - Agregar tooltips

2. **calendario/page.tsx**
   - Agregar ThemeToggle
   - Integrar ResourcePanel
   - Actualizar leyenda

3. **CalendarGrid** (Molecule)
   - Hacer días droppable
   - Hacer eventos draggable
   - Visual feedback

---

## 🎨 Colores del Calendario (Ajustados)

### Estados de Reserva:

```typescript
const reservationColors = {
  PENDING: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500",
    text: "text-yellow-400",
    dot: "#eab308", // yellow-500
  },
  CONFIRMED: {
    bg: "bg-blue-500/20",
    border: "border-blue-500",
    text: "text-blue-400",
    dot: "#3b82f6", // blue-500
  },
  IN_PROGRESS: {
    bg: "bg-green-500/20",
    border: "border-green-500",
    text: "text-green-400",
    dot: "#22c55e", // green-500
  },
  COMPLETED: {
    bg: "bg-gray-500/20",
    border: "border-gray-500",
    text: "text-gray-400",
    dot: "#6b7280", // gray-500
  },
  CANCELLED: {
    bg: "bg-red-500/20",
    border: "border-red-500",
    text: "text-red-400",
    dot: "#ef4444", // red-500
  },
  REJECTED: {
    bg: "bg-red-700/20",
    border: "border-red-700",
    text: "text-red-500",
    dot: "#b91c1c", // red-700
  },
};
```

---

## 🔧 Implementación Técnica

### 1. Drag & Drop con react-beautiful-dnd

**Instalación**:

```bash
npm install react-beautiful-dnd @types/react-beautiful-dnd
```

**Estructura**:

```typescript
<DragDropContext onDragEnd={handleDragEnd}>
  {/* Panel de recursos */}
  <Droppable droppableId="resources">
    <Resource draggableId="res-1" />
    <Resource draggableId="res-2" />
  </Droppable>

  {/* Calendario */}
  <CalendarGrid>
    {days.map(day => (
      <Droppable droppableId={`day-${day.date}`}>
        {day.events.map(event => (
          <Draggable draggableId={event.id}>
            <ReservationCard />
          </Draggable>
        ))}
      </Droppable>
    ))}
  </CalendarGrid>
</DragDropContext>
```

### 2. Theme Detection

```typescript
// En CalendarView
import { useTheme } from "next-themes";

export function CalendarView() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={isDark ? "calendar-dark" : "calendar-light"}>
      {/* ... */}
    </div>
  );
}
```

### 3. Tooltips con Radix UI

**Instalación**:

```bash
npm install @radix-ui/react-tooltip
```

**Uso**:

```typescript
<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger>
      <ReservationCard />
    </Tooltip.Trigger>
    <Tooltip.Content>
      <div className="p-2 bg-gray-800 text-white rounded">
        <p className="font-semibold">{event.title}</p>
        <p className="text-sm">{event.resourceName}</p>
        <p className="text-sm">{event.time}</p>
      </div>
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
```

---

## 📝 Casos de Uso

### Caso 1: Crear reserva con Drag & Drop

```
Usuario:
1. Abre /calendario
2. Activa checkbox "Aula 101" en panel
3. Ve disponibilidad de Aula 101 en calendario
4. Arrastra "Aula 101" al día 25/Nov
5. Suelta sobre el día

Sistema:
1. Detecta drop de recurso en día
2. Abre modal inline/panel con:
   - Recurso: Aula 101
   - Fecha: 25/Nov
   - Formulario de reserva rápido
3. Usuario completa horario y título
4. Click "Crear Reserva"
5. Reserva creada, aparece en calendario
```

### Caso 2: Reagendar con Drag & Drop

```
Usuario:
1. Ve reserva "Reunión X" el día 20/Nov
2. Arrastra la reserva al día 22/Nov
3. Suelta

Sistema:
1. Detecta movimiento de reserva
2. Muestra confirmación:
   "¿Reagendar 'Reunión X' del 20/Nov al 22/Nov?"
3. Usuario confirma
4. Crea solicitud de reagendamiento
5. Actualiza UI (reserva en nueva fecha con status PENDING)
```

### Caso 3: Ver disponibilidad de recurso

```
Usuario:
1. Activa checkbox "Laboratorio 3"
2. Ve en calendario:
   - Días con fondo verde: Disponible
   - Días con eventos rojos: Ocupado
   - Número de horas disponibles
3. Desactiva checkbox
4. Vuelve a ver todas las reservas
```

---

## 🎯 Fases de Implementación

### Fase 1: Theme (2 horas) ✅

- [x] Crear ThemeToggle component
- [ ] Integrar en AppHeader
- [ ] Configurar por defecto: sistema/dark
- [ ] CalendarView detecta theme

### Fase 2: Tooltips (1 hora)

- [ ] Instalar @radix-ui/react-tooltip
- [ ] Crear ReservationTooltip component
- [ ] Integrar en CalendarEventBadge
- [ ] Mostrar nombre completo + info

### Fase 3: Leyenda Correcta (30 min)

- [ ] Mapear colores exactos de calendario
- [ ] Actualizar leyenda en /calendario/page.tsx
- [ ] Agregar variante REJECTED

### Fase 4: Drag & Drop Básico (4 horas)

- [ ] Instalar react-beautiful-dnd
- [ ] Crear DraggableResource component
- [ ] Crear DroppableDay component
- [ ] Implementar onDragEnd handler
- [ ] Modal/panel inline para crear reserva

### Fase 5: Panel de Recursos (3 horas)

- [ ] Crear ResourcePanel component
- [ ] Lista con checkboxes
- [ ] Filtro por tipo/categoría
- [ ] Highlight disponibilidad en calendario

### Fase 6: Reagendamiento Drag & Drop (2 horas)

- [ ] Hacer eventos draggable
- [ ] Detectar drop en otro día
- [ ] Mostrar confirmación
- [ ] Crear solicitud de reagendamiento

### Fase 7: Reserva Rápida (1 hora)

- [ ] Botón en recurso
- [ ] Abrir calendario en vista día
- [ ] Pre-seleccionar recurso

---

## 🚀 Implementación Inmediata (MVP)

Dado el alcance, voy a implementar una **versión simplificada inicial** con:

1. ✅ **ThemeToggle** - Ya creado
2. ✅ **Theme automático en CalendarView** - Próximo
3. ✅ **Tooltips en reservas** - Próximo
4. ✅ **Leyenda corregida** - Próximo
5. 🔜 **Panel de recursos (básico)** - Sin drag & drop
6. 🔜 **Estructura para drag & drop** - Base preparada

**Tiempo estimado**: 2-3 horas

**Características avanzadas (drag & drop completo)**: Fase 2 (4-6 horas adicionales)

---

## 📊 Estado Actual

- [x] ThemeToggle creado
- [ ] Integrar ThemeToggle
- [ ] CalendarView con theme
- [ ] Tooltips implementados
- [ ] Leyenda corregida
- [ ] Panel de recursos básico
- [ ] Drag & Drop (fase 2)

---

**🎯 Comenzando implementación MVP ahora...**
