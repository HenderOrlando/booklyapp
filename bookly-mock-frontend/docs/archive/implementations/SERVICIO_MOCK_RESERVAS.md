# ✅ Servicio Mock de Reservas Implementado

**Fecha**: 20 de Noviembre 2025, 20:15  
**Estado**: ✅ Completado

---

## 📦 Archivos Creados/Modificados

### 1. Nuevo: `reservations-service.mock.ts`

**Ubicación**: `src/infrastructure/mock/data/reservations-service.mock.ts`

**Contenido**:

- ✅ 12 reservas mock completas con datos reales
- ✅ 5 recursos mock para uso en formularios
- ✅ Tipos TypeScript correctos (Reservation, Resource)
- ✅ Enums importados correctamente (ResourceType, ResourceStatus)

**Reservas de ejemplo**:
| ID | Recurso | Usuario | Título | Estado |
|----|---------|---------|--------|--------|
| rsv_001 | Aula 101 | Dra. María González | Clase de Algoritmos | CONFIRMED |
| rsv_002 | Lab Sistemas | Ing. Juan Pérez | Práctica BD | PENDING |
| rsv_003 | Auditorio | Dr. Carlos Rodríguez | Conferencia IA | CONFIRMED |
| rsv_004 | Sala Conf A | Dr. Pedro Sánchez | Reunión Comité | IN_PROGRESS |
| rsv_005 | Cancha Fútbol | Ana Martínez | Torneo Interfacultades | CONFIRMED |
| rsv_006 | Aula 101 | Ing. Laura Torres | Taller React | PENDING |
| rsv_007 | Lab Sistemas | Dra. María González | Examen Final | CONFIRMED |
| rsv_008 | Auditorio | Luis Hernández | Evento Graduación | PENDING |
| rsv_009 | Aula 101 | Ing. Juan Pérez | Estructuras Datos | COMPLETED |
| rsv_010 | Sala Conf A | Miguel Castro | Defensa Tesis | CANCELLED |
| rsv_011 | Lab Sistemas | Dra. María González | Taller Docker | CONFIRMED |
| rsv_012 | Cancha Fútbol | Diego Ramírez | Entrenamiento | CONFIRMED |

---

### 2. Modificado: `mockService.ts`

**Ubicación**: `src/infrastructure/mock/mockService.ts`

**Cambios aplicados**:

1. ✅ Import de `mockReservations` agregado (línea 26)
2. ✅ Estado `reservationsData` agregado (línea 38)
3. ✅ Endpoints de reservations implementados (líneas 192-221):
   - `GET /reservations` - Listar todas
   - `GET /reservations/:id` - Obtener por ID
   - `POST /reservations` - Crear nueva
   - `PATCH /reservations/:id` - Actualizar
   - `DELETE /reservations/:id` - Cancelar (cambia status a CANCELLED)

4. ✅ Métodos mock implementados (líneas 997-1127):
   - `mockGetReservations()` - Retorna paginado
   - `mockGetReservationById(id)` - Con manejo de 404
   - `mockCreateReservation(data)` - Genera ID automático
   - `mockUpdateReservation(id, data)` - Con validación
   - `mockCancelReservation(id)` - Actualiza status

---

## 🔧 Funcionalidades Implementadas

### CRUD Completo de Reservations

#### 1. Listar Reservations (GET)

```typescript
MockService.mockRequest("/reservations", "GET");
// Retorna: { success: true, data: { items: Reservation[], meta: {...} } }
```

#### 2. Obtener por ID (GET)

```typescript
MockService.mockRequest("/reservations/rsv_001", "GET");
// Retorna: { success: true, data: Reservation }
// Error 404 si no existe
```

#### 3. Crear Reservation (POST)

```typescript
MockService.mockRequest("/reservations", "POST", {
  resourceId: "res_001",
  userId: "user_001",
  title: "Mi Reserva",
  // ... resto de datos
});
// Genera ID automático: rsv_{timestamp}
// Status inicial: PENDING
```

#### 4. Actualizar Reservation (PATCH)

```typescript
MockService.mockRequest("/reservations/rsv_001", "PATCH", {
  title: "Nuevo Título",
  status: "CONFIRMED",
});
// Actualiza updatedAt automáticamente
```

#### 5. Cancelar Reservation (DELETE)

```typescript
MockService.mockRequest("/reservations/rsv_001", "DELETE");
// Cambia status a CANCELLED
// No elimina el registro
```

---

## 📊 Estructura de Datos

### Reservation Interface

```typescript
interface Reservation {
  id: string;
  resourceId: string;
  resourceName?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  title: string;
  description?: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  status: ReservationStatus; // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED
  attendees?: number;
  recurrenceType?: RecurrenceType; // NONE, DAILY, WEEKLY, MONTHLY
  recurrenceEndDate?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Mock Resources (para formularios)

```typescript
const mockResourcesForReservations: Partial<Resource>[] = [
  { id: "res_001", name: "Aula 101", type: ResourceType.CLASSROOM },
  { id: "res_002", name: "Lab Sistemas", type: ResourceType.LABORATORY },
  { id: "res_003", name: "Auditorio", type: ResourceType.AUDITORIUM },
  { id: "res_004", name: "Sala Conf A", type: ResourceType.CONFERENCE_ROOM },
  { id: "res_005", name: "Cancha Fútbol", type: ResourceType.SPORTS_FIELD },
];
```

---

## 🎯 Uso en Páginas

### Ejemplo: Consumir desde una página

```typescript
import { MockService } from "@/infrastructure/mock/mockService";

// Listar reservas
const response = await MockService.mockRequest<any>("/reservations", "GET");
if (response.success) {
  const reservations = response.data.items;
  // Usar reservations...
}

// Obtener una reserva
const reservation = await MockService.mockRequest<any>(
  "/reservations/rsv_001",
  "GET"
);

// Crear reserva
const newReservation = await MockService.mockRequest<any>(
  "/reservations",
  "POST",
  {
    resourceId: "res_001",
    userId: "user_001",
    title: "Nueva Reserva",
    startDate: "2025-11-26T10:00:00",
    endDate: "2025-11-26T12:00:00",
    attendees: 25,
  }
);

// Actualizar reserva
const updated = await MockService.mockRequest<any>(
  "/reservations/rsv_001",
  "PATCH",
  {
    status: "CONFIRMED",
  }
);

// Cancelar reserva
const cancelled = await MockService.mockRequest<any>(
  "/reservations/rsv_001",
  "DELETE"
);
```

---

## ✅ Ventajas de esta Implementación

### 1. Centralización

- ✅ Todos los datos en un solo lugar
- ✅ Fácil de mantener y actualizar
- ✅ Sin data hardcoded en las páginas

### 2. Consistencia

- ✅ Mismo formato que el backend real
- ✅ Respuestas API estandarizadas (ApiResponse<T>)
- ✅ Códigos de error consistentes (404, etc.)

### 3. Realismo

- ✅ Simula delay de red (300ms)
- ✅ Maneja errores (404, validaciones)
- ✅ Datos mutables (se actualizan durante la sesión)

### 4. Escalabilidad

- ✅ Fácil agregar más reservas
- ✅ Fácil agregar más endpoints
- ✅ Preparado para integración con backend real

---

## 🔄 Próximos Pasos

### 1. Actualizar Páginas para Usar el Servicio

**Archivos a modificar**:

- `src/app/reservas/page.tsx`
- `src/app/reservas/nueva/page.tsx`
- `src/app/reservas/[id]/page.tsx`

**Eliminar**:

- ❌ Data hardcoded (mockReservations inline)
- ❌ mockResources inline

**Agregar**:

- ✅ Llamadas a MockService
- ✅ Loading states mientras carga
- ✅ Error handling

### 2. Crear Cliente HTTP (Opcional)

**Archivo**: `src/infrastructure/api/reservations-client.ts`

- Wrapper sobre MockService
- Auto-detección de modo (mock/serve)
- Type-safe con generics

### 3. Agregar Redux Slice (Opcional)

**Archivo**: `src/store/slices/reservationsSlice.ts`

- Estado global de reservas
- Acciones async (fetchReservations, createReservation, etc.)
- Selectores memoizados

---

## 📝 Resumen

**✅ COMPLETADO**:

- Servicio mock de reservas funcional
- 12 reservas de ejemplo con datos reales
- CRUD completo implementado
- 0 errores de TypeScript
- Documentación completa

**⚠️ PENDIENTE**:

- Actualizar páginas para consumir el servicio
- Eliminar data hardcoded de las páginas
- Crear cliente HTTP (opcional)
- Agregar Redux (opcional)

**📊 Métricas**:

- Archivos creados: 1 (reservations-service.mock.ts)
- Archivos modificados: 1 (mockService.ts)
- Líneas de código: ~450
- Reservas mock: 12
- Endpoints implementados: 5

---

**¡El servicio mock está listo para ser consumido! 🎉**
