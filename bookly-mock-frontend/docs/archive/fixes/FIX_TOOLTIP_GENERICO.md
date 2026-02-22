# ✅ FIX: Tooltip Genérico + Paginación sin URL Externa

**Fecha**: Noviembre 21, 2025, 5:00 AM  
**Estado**: ✅ **COMPLETADO**

---

## 🐛 Problemas Reportados

1. **Tooltip específico para reservas**: El tooltip en `CalendarDayCell` decía "reserva" pero el calendario puede mostrar otros tipos de eventos
2. **Uso de URL externa**: La paginación usaba `new URL(endpoint, "http://dummy.com")` en lugar de solo parsear los params mock

---

## ✅ Soluciones Aplicadas

### 1. Tooltip Genérico en CalendarDayCell

#### Cambio 1: Texto del contador

**ANTES**:

```typescript
<span className="ml-2 text-xs text-gray-400">
  ({eventCount} reserva{eventCount > 1 ? 's' : ''})
</span>
```

**DESPUÉS**:

```typescript
<span className="ml-2 text-xs text-gray-400">
  ({eventCount} evento{eventCount > 1 ? 's' : ''})
</span>
```

**Por qué**: "Evento" es más genérico que "reserva" y aplica a cualquier tipo de entrada en el calendario.

#### Cambio 2: Recurso opcional

**ANTES**:

```typescript
<div className="text-xs text-gray-500 mt-1">
  📍 {event.resourceName}
</div>
```

**DESPUÉS**:

```typescript
{event.resourceName && (
  <div className="text-xs text-gray-500 mt-1">
    📍 {event.resourceName}
  </div>
)}
```

**Por qué**: No todos los eventos tienen necesariamente un recurso asociado (ej. eventos personales, recordatorios, etc.)

---

### 2. Paginación sin URL Externa

**Archivo**: `mockService.ts` - Línea 112

#### ANTES

```typescript
// ❌ Usaba URL externa
const url = new URL(endpoint, "http://dummy.com");
const page = parseInt(url.searchParams.get("page") || "1");
const limit = parseInt(url.searchParams.get("limit") || "20");
```

**Problemas**:

- Usa dominio externo `http://dummy.com`
- Innecesariamente complejo
- Agrega dependencia de URL API

#### DESPUÉS

```typescript
// ✅ Solo parsea el query string
const queryString = endpoint.split("?")[1] || "";
const params = new URLSearchParams(queryString);
const page = parseInt(params.get("page") || "1");
const limit = parseInt(params.get("limit") || "20");
```

**Ventajas**:

- ✅ No usa URL externa
- ✅ Más simple y directo
- ✅ Solo trabaja con los datos mock
- ✅ URLSearchParams nativo funciona sin base URL

---

## 🔍 Cómo Funciona

### Parsing de Query Params

#### Ejemplo de endpoint

```typescript
const endpoint = "/resources?page=2&limit=5";
```

#### Paso 1: Extraer query string

```typescript
const queryString = endpoint.split("?")[1];
// queryString = "page=2&limit=5"
```

**Si no hay params**:

```typescript
const endpoint = "/resources";
const queryString = endpoint.split("?")[1] || "";
// queryString = ""
```

#### Paso 2: Crear URLSearchParams

```typescript
const params = new URLSearchParams(queryString);
// params puede leer: page, limit, etc.
```

#### Paso 3: Extraer valores

```typescript
const page = parseInt(params.get("page") || "1");
// page = 2

const limit = parseInt(params.get("limit") || "20");
// limit = 5
```

**Defaults**:

- Si `page` no existe → `"1"` → `1`
- Si `limit` no existe → `"20"` → `20`

---

## 📊 Casos de Uso del Tooltip Genérico

### Caso 1: Reservas (uso actual)

```typescript
{
  id: "event-1",
  title: "Clase de Programación",
  start: "2025-11-21T09:00:00",
  end: "2025-11-21T11:00:00",
  resourceName: "Aula 101",  // ✅ Presente
  userName: "Prof. García",  // ✅ Presente
}
```

**Tooltip muestra**:

```
21 de noviembre de 2025 (1 evento)
─────────────────────────────────
🟡 Clase de Programación
   09:00 - 11:00
   📍 Aula 101
   👤 Prof. García
```

### Caso 2: Eventos sin recurso

```typescript
{
  id: "event-2",
  title: "Reunión de equipo",
  start: "2025-11-21T14:00:00",
  end: "2025-11-21T15:00:00",
  resourceName: undefined,  // ❌ No tiene recurso
  userName: "Equipo Dev",   // ✅ Presente
}
```

**Tooltip muestra**:

```
21 de noviembre de 2025 (1 evento)
─────────────────────────────────
🔵 Reunión de equipo
   14:00 - 15:00
   👤 Equipo Dev
```

**Nota**: El icono 📍 NO aparece porque `resourceName` es `undefined`

### Caso 3: Eventos personales

```typescript
{
  id: "event-3",
  title: "Recordatorio: Entregar proyecto",
  start: "2025-11-21T16:00:00",
  end: "2025-11-21T16:30:00",
  resourceName: undefined,  // ❌ No tiene recurso
  userName: undefined,      // ❌ No tiene usuario
}
```

**Tooltip muestra**:

```
21 de noviembre de 2025 (1 evento)
─────────────────────────────────
🟢 Recordatorio: Entregar proyecto
   16:00 - 16:30
```

**Nota**: Solo muestra título y horario

### Caso 4: Múltiples eventos mixtos

```
21 de noviembre de 2025 (3 eventos)
─────────────────────────────────
🟡 Clase de Programación
   09:00 - 11:00
   📍 Aula 101
   👤 Prof. García

🔵 Reunión de equipo
   14:00 - 15:00
   👤 Equipo Dev

🟢 Recordatorio: Entregar proyecto
   16:00 - 16:30
```

---

## 🎨 Flexibilidad del Tooltip

### Campos siempre presentes

- ✅ `title` - Título del evento
- ✅ `start` - Hora de inicio
- ✅ `end` - Hora de fin
- ✅ `color` - Color del dot

### Campos opcionales

- ⚪ `resourceName` - Solo si está presente
- ⚪ `userName` - Solo si está presente

### Extensibilidad futura

El tooltip ahora puede mostrar cualquier tipo de evento:

1. **Reservas** (actual)
2. **Clases programadas**
3. **Eventos institucionales**
4. **Mantenimientos**
5. **Recordatorios**
6. **Feriados**
7. **Exámenes**
8. **Conferencias**

Todos se renderizan correctamente con la información disponible.

---

## 📦 Archivos Modificados

### 1. CalendarDayCell.tsx

**Línea 131**: Cambio de "reserva" a "evento"

```typescript
({eventCount} evento{eventCount > 1 ? "s" : ""})
```

**Línea 152-156**: Recurso condicional

```typescript
{event.resourceName && (
  <div className="text-xs text-gray-500 mt-1">
    📍 {event.resourceName}
  </div>
)}
```

### 2. mockService.ts

**Líneas 112-116**: Parsing sin URL externa

```typescript
const queryString = endpoint.split("?")[1] || "";
const params = new URLSearchParams(queryString);
const page = parseInt(params.get("page") || "1");
const limit = parseInt(params.get("limit") || "20");
```

---

## ✅ Ventajas de los Cambios

### Tooltip Genérico

| Antes                     | Después                         |
| ------------------------- | ------------------------------- |
| Solo para "reservas"      | Para cualquier "evento" ✅      |
| Recurso siempre visible   | Recurso opcional ✅             |
| Limitado a un caso de uso | Extensible a múltiples casos ✅ |
| Hardcoded para reservas   | Genérico y reutilizable ✅      |

### Paginación Limpia

| Antes                              | Después                     |
| ---------------------------------- | --------------------------- |
| `new URL(..., "http://dummy.com")` | `endpoint.split("?")[1]` ✅ |
| Usa dominio externo                | Solo datos mock ✅          |
| Más complejo                       | Más simple ✅               |
| 2 pasos                            | 3 pasos claros ✅           |

---

## 🧪 Testing

### Test 1: Tooltip con todos los campos

```typescript
const event = {
  title: "Clase de Matemáticas",
  start: "2025-11-21T10:00:00",
  end: "2025-11-21T12:00:00",
  resourceName: "Aula 202",
  userName: "Prof. López",
  color: "#fbbf24",
};
```

**Verificar**:

- [ ] Muestra "1 evento"
- [ ] Muestra título, horario, recurso y usuario
- [ ] Icono 📍 visible
- [ ] Icono 👤 visible

### Test 2: Tooltip sin recurso

```typescript
const event = {
  title: "Meeting Online",
  start: "2025-11-21T15:00:00",
  end: "2025-11-21T16:00:00",
  resourceName: undefined,
  userName: "Team",
  color: "#3b82f6",
};
```

**Verificar**:

- [ ] Muestra "1 evento"
- [ ] NO muestra icono 📍
- [ ] SÍ muestra icono 👤

### Test 3: Tooltip solo título y horario

```typescript
const event = {
  title: "Recordatorio",
  start: "2025-11-21T18:00:00",
  end: "2025-11-21T18:30:00",
  resourceName: undefined,
  userName: undefined,
  color: "#10b981",
};
```

**Verificar**:

- [ ] Muestra "1 evento"
- [ ] Solo título y horario
- [ ] NO muestra 📍 ni 👤

### Test 4: Paginación con limit=3

```typescript
GET /resources?page=2&limit=3
```

**Verificar**:

- [ ] Extrae `page=2` correctamente
- [ ] Extrae `limit=3` correctamente
- [ ] Retorna solo 3 items
- [ ] No usa URL externa

---

## 🎯 Impacto de los Cambios

### Tooltip Genérico

**Permite**:

- ✅ Usar el mismo componente para diferentes tipos de calendarios
- ✅ Agregar nuevos tipos de eventos sin modificar el tooltip
- ✅ Campos opcionales se muestran solo si existen
- ✅ Menos acoplamiento con el dominio de "reservas"

**Casos de uso futuros**:

- Calendario académico (clases, exámenes)
- Calendario de mantenimientos
- Calendario personal
- Calendario de eventos públicos

### Paginación Limpia

**Permite**:

- ✅ Código más legible y mantenible
- ✅ No depende de APIs externas
- ✅ Más fácil de entender para otros desarrolladores
- ✅ Consistente con el enfoque "solo mock"

---

## 📝 Notas Técnicas

### URLSearchParams sin base URL

**Es válido hacer**:

```typescript
const params = new URLSearchParams("page=2&limit=5");
params.get("page"); // "2"
params.get("limit"); // "5"
```

**No requiere**:

```typescript
// ❌ Innecesario
new URL("/resources?page=2&limit=5", "http://dummy.com");
```

### Campos opcionales en TypeScript

**Interface CalendarEvent**:

```typescript
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  resourceName: string; // Podría ser opcional
  color?: string;
  userId?: string;
  userName?: string; // Ya es opcional
  reservation?: Reservation;
}
```

**Sugerencia futura**: Hacer `resourceName` opcional en el type

```typescript
resourceName?: string;  // ✅ Mejor
```

---

**TOOLTIP GENÉRICO + PAGINACIÓN LIMPIA** ✅  
**Código más flexible y mantenible** 🚀
