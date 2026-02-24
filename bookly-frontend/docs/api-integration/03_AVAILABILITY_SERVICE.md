# 📅 Availability Service - Plan de Frontend

**Microservicio**: Availability Service (Puerto 3003)  
**Requerimientos Funcionales**: RF-07 a RF-19  
**Endpoints Base**: `/api/v1/reservations/*`, `/api/v1/availability/*`, `/api/v1/waitlist/*`

---

## 📋 Requerimientos Funcionales

### RF-07 a RF-19: Disponibilidad y Reservas

- **RF-07**: Configurar horarios disponibles por recurso
- **RF-08**: Integración con calendarios externos (Google, Outlook)
- **RF-09**: Búsqueda avanzada de disponibilidad
- **RF-10**: Visualización en formato calendario
- **RF-11**: Historial de uso de recursos
- **RF-12**: Reservas periódicas/recurrentes
- **RF-13**: Modificación y cancelación de reservas
- **RF-14**: Lista de espera (waitlist)
- **RF-15**: Reasignación automática de recursos
- **RF-16**: Gestión de conflictos de disponibilidad
- **RF-17**: Disponibilidad por perfil de usuario
- **RF-18**: Compatibilidad con eventos institucionales
- **RF-19**: Interfaz responsive y accesible

---

## 🌐 Endpoints HTTP Disponibles

### Reservas

```typescript
GET    /api/v1/reservations                     // Listar reservas
POST   /api/v1/reservations                     // Crear reserva simple
GET    /api/v1/reservations/:id                 // Obtener detalles
PATCH  /api/v1/reservations/:id                 // Modificar reserva
DELETE /api/v1/reservations/:id                 // Cancelar reserva

// Reservas Recurrentes
POST   /api/v1/reservations/recurring           // Crear serie recurrente
GET    /api/v1/reservations/recurring/:seriesId // Obtener serie
PATCH  /api/v1/reservations/recurring/:seriesId // Modificar serie completa
DELETE /api/v1/reservations/recurring/:seriesId // Cancelar serie
POST   /api/v1/reservations/recurring/preview   // Preview de instancias
PATCH  /api/v1/reservations/recurring/:seriesId/instance/:date  // Modificar instancia
DELETE /api/v1/reservations/recurring/:seriesId/instance/:date  // Cancelar instancia

// Check-in/Check-out
POST   /api/v1/reservations/:id/check-in        // Registrar llegada
POST   /api/v1/reservations/:id/check-out       // Registrar salida

// Exportación
GET    /api/v1/reservations/:id/export/ical     // Exportar a iCal
GET    /api/v1/reservations/:id/export/pdf      // Generar PDF
```

### Disponibilidad

```typescript
GET    /api/v1/availability/resource/:id        // Disponibilidad de recurso
POST   /api/v1/availability/search              // Búsqueda avanzada
GET    /api/v1/availability/calendar            // Vista calendario
GET    /api/v1/availability/slots/:resourceId   // Slots disponibles
POST   /api/v1/availability/batch-check         // Verificar múltiples recursos
```

### Lista de Espera

```typescript
GET    /api/v1/waitlist                         // Listar espera
POST   /api/v1/waitlist                         // Unirse a lista
DELETE /api/v1/waitlist/:id                     // Salir de lista
GET    /api/v1/waitlist/:id/position            // Posición en lista
POST   /api/v1/waitlist/:id/notify              // Notificar disponibilidad
```

### Reasignación

```typescript
POST   /api/v1/reassignment/request             // Solicitar reasignación
GET    /api/v1/reassignment/:id                 // Estado de solicitud
POST   /api/v1/reassignment/:id/approve         // Aprobar reasignación
POST   /api/v1/reassignment/:id/reject          // Rechazar reasignación
GET    /api/v1/reassignment/equivalent/:resourceId  // Recursos equivalentes
```

### Conflictos

```typescript
GET    /api/v1/reservations/conflicts           // Listar conflictos
POST   /api/v1/reservations/conflicts/resolve   // Resolver conflicto
GET    /api/v1/reservations/conflicts/:id       // Detalles de conflicto
```

### Historial

```typescript
GET    /api/v1/history/user/:userId             // Historial de usuario
GET    /api/v1/history/resource/:resourceId     // Historial de recurso
GET    /api/v1/history/usage-stats              // Estadísticas de uso
```

### Integración Calendarios

```typescript
POST   /api/v1/calendar/connect/google          // Conectar Google Calendar
POST   /api/v1/calendar/connect/outlook         // Conectar Outlook
GET    /api/v1/calendar/integrations            // Integraciones activas
DELETE /api/v1/calendar/integrations/:id        // Desconectar calendario
POST   /api/v1/calendar/sync                    // Sincronizar eventos
```

---

## 📄 Páginas a Implementar

### 1. Calendario y Disponibilidad

#### `/dashboard/availability` - Vista Principal

```typescript
// app/(dashboard)/availability/page.tsx
"use client";

export default function AvailabilityPage() {
  return (
    <DashboardTemplate>
      <PageHeader title="Disponibilidad" />
      <AvailabilityFilters />
      <CalendarView />
      <ResourceSidebar />
    </DashboardTemplate>
  );
}
```

### 2. Crear Reserva

#### `/dashboard/reservations/new` - Nueva Reserva

```typescript
// app/(dashboard)/reservations/new/page.tsx
"use client";

export default function NewReservationPage() {
  return (
    <DashboardTemplate>
      <ReservationWizard>
        <Step1_SelectResource />
        <Step2_SelectDateTime />
        <Step3_ReservationDetails />
        <Step4_RecurringOptions />
        <Step5_Confirmation />
      </ReservationWizard>
    </DashboardTemplate>
  );
}
```

### 3. Mis Reservas

#### `/dashboard/reservations` - Lista de Reservas del Usuario

```typescript
// app/(dashboard)/reservations/page.tsx
"use client";

export default function MyReservationsPage() {
  return (
    <DashboardTemplate>
      <Tabs>
        <TabPanel value="upcoming">
          <UpcomingReservations />
        </TabPanel>
        <TabPanel value="past">
          <PastReservations />
        </TabPanel>
        <TabPanel value="recurring">
          <RecurringReservations />
        </TabPanel>
      </Tabs>
    </DashboardTemplate>
  );
}
```

### 4. Detalle de Reserva

#### `/dashboard/reservations/[id]` - Detalle y Gestión

```typescript
// app/(dashboard)/reservations/[id]/page.tsx
"use client";

export default function ReservationDetailPage({ params }) {
  return (
    <DashboardTemplate>
      <ReservationHeader />
      <ReservationInfo />
      <ActionButtons>
        <ModifyButton />
        <CancelButton />
        <CheckInButton />
        <ExportButton />
      </ActionButtons>
      <ParticipantsList />
    </DashboardTemplate>
  );
}
```

### 5. Lista de Espera

#### `/dashboard/waitlist` - Gestión de Lista de Espera

```typescript
// app/(dashboard)/waitlist/page.tsx
"use client";

export default function WaitlistPage() {
  return (
    <DashboardTemplate>
      <PageHeader title="Lista de Espera" />
      <WaitlistFilters />
      <WaitlistTable />
      <JoinWaitlistButton />
    </DashboardTemplate>
  );
}
```

---

## 🧩 Componentes Clave

### Organisms

```typescript
// components/organisms/CalendarView/CalendarView.tsx
interface CalendarViewProps {
  view: "day" | "week" | "month";
  selectedDate: Date;
  reservations: Reservation[];
  availability: AvailabilitySlot[];
  onDateSelect: (date: Date) => void;
  onReservationClick: (reservationId: string) => void;
  onSlotClick: (slot: AvailabilitySlot) => void;
}

// components/organisms/ReservationWizard/ReservationWizard.tsx
interface ReservationWizardProps {
  onComplete: (reservation: CreateReservationDto) => void;
  onCancel: () => void;
  initialResource?: string;
  initialDate?: Date;
}

// components/organisms/RecurringPatternSelector/RecurringPatternSelector.tsx
interface RecurringPatternSelectorProps {
  pattern: RecurringPattern;
  onChange: (pattern: RecurringPattern) => void;
  startDate: Date;
  onPreview: () => void;
}

// components/organisms/WaitlistManager/WaitlistManager.tsx
interface WaitlistManagerProps {
  resourceId: string;
  userPosition?: number;
  estimatedWaitTime?: number;
  onJoin: () => void;
  onLeave: () => void;
}
```

---

## 🗄️ Store y Estado

### Reservations Slice

```typescript
// store/slices/reservationsSlice.ts
interface ReservationsState {
  reservations: Reservation[];
  selectedReservation: Reservation | null;
  calendarView: "day" | "week" | "month";
  selectedDate: Date;
  filters: ReservationFilters;
  isLoading: boolean;
}
```

### RTK Query API

```typescript
// store/api/availabilityApi.ts
export const availabilityApi = createApi({
  reducerPath: "availabilityApi",
  endpoints: (builder) => ({
    getReservations: builder.query<
      PaginatedResponse<Reservation>,
      QueryReservationsDto
    >({
      /* ... */
    }),
    createReservation: builder.mutation<Reservation, CreateReservationDto>({
      /* ... */
    }),
    createRecurringReservation: builder.mutation<
      RecurringSeries,
      CreateRecurringDto
    >({
      /* ... */
    }),
    getAvailability: builder.query<AvailabilitySlot[], GetAvailabilityDto>({
      /* ... */
    }),
    searchAvailability: builder.mutation<Resource[], SearchAvailabilityDto>({
      /* ... */
    }),
    joinWaitlist: builder.mutation<WaitlistEntry, JoinWaitlistDto>({
      /* ... */
    }),
    requestReassignment: builder.mutation<
      ReassignmentRequest,
      CreateReassignmentDto
    >({
      /* ... */
    }),
  }),
});
```

---

## 📐 Tipos TypeScript

```typescript
export interface Reservation {
  id: string;
  resourceId: string;
  resource: Resource;
  userId: string;
  user: User;
  startDate: string;
  endDate: string;
  purpose: string;
  status: ReservationStatus;
  isRecurring: boolean;
  recurringSeriesId?: string;
  participants?: string[];
  notes?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ReservationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export interface RecurringPattern {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
  occurrences?: number;
}

export interface AvailabilitySlot {
  resourceId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
}

export interface WaitlistEntry {
  id: string;
  resourceId: string;
  userId: string;
  desiredStartDate: string;
  desiredEndDate: string;
  position: number;
  estimatedWaitTime?: number;
  notifyWhen: "IMMEDIATE" | "DAILY" | "WEEKLY";
  createdAt: string;
}
```

---

## 🎯 Casos de Uso Principales

### 1. Buscar y Reservar Recurso

```typescript
export const useResourceReservation = () => {
  const [searchAvailability] = useSearchAvailabilityMutation();
  const [createReservation] = useCreateReservationMutation();

  const searchAndBook = async (criteria: SearchCriteria) => {
    // 1. Buscar recursos disponibles
    const available = await searchAvailability(criteria).unwrap();

    // 2. Seleccionar recurso
    // 3. Confirmar horario
    // 4. Crear reserva
    const reservation = await createReservation({
      /* ... */
    }).unwrap();

    return { success: true, reservation };
  };

  return { searchAndBook };
};
```

### 2. Crear Reserva Recurrente

```typescript
export const useRecurringReservation = () => {
  const [createRecurring] = useCreateRecurringReservationMutation();
  const [preview] = usePreviewRecurringMutation();

  const createWithPreview = async (data: CreateRecurringDto) => {
    // 1. Preview de instancias
    const instances = await preview(data).unwrap();

    // 2. Usuario confirma
    // 3. Crear serie
    const series = await createRecurring(data).unwrap();

    return { success: true, series, instances };
  };

  return { createWithPreview };
};
```

### 3. Gestionar Lista de Espera

```typescript
export const useWaitlist = (resourceId: string) => {
  const [join] = useJoinWaitlistMutation();
  const [leave] = useLeaveWaitlistMutation();
  const { data: position } = useGetWaitlistPositionQuery(resourceId);

  return {
    position: position?.data.position,
    estimatedWait: position?.data.estimatedWaitTime,
    joinWaitlist: (data) => join(data),
    leaveWaitlist: () => leave(resourceId),
  };
};
```

---

## ✅ Checklist de Implementación

### Visualización

- [ ] Calendario mensual/semanal/diario
- [ ] Vista de disponibilidad de recurso
- [ ] Timeline de reservas
- [ ] Mapa de recursos (opcional)

### Reservas

- [ ] Crear reserva simple
- [ ] Crear reserva recurrente
- [ ] Modificar reserva
- [ ] Cancelar reserva
- [ ] Check-in/Check-out
- [ ] Exportar a iCal/PDF

### Búsqueda

- [ ] Búsqueda por fecha/hora
- [ ] Búsqueda por capacidad
- [ ] Búsqueda por equipamiento
- [ ] Filtros avanzados
- [ ] Ordenamiento de resultados

### Lista de Espera

- [ ] Unirse a waitlist
- [ ] Ver posición en cola
- [ ] Notificaciones de disponibilidad
- [ ] Salir de waitlist
- [ ] Convertir waitlist en reserva

### Integraciones

- [ ] Conectar Google Calendar
- [ ] Conectar Outlook Calendar
- [ ] Sincronización automática
- [ ] Exportación de eventos
- [ ] Importación de eventos

---

**Anterior**: [02_RESOURCES_SERVICE.md](./02_RESOURCES_SERVICE.md)  
**Próximo**: [04_STOCKPILE_SERVICE.md](./04_STOCKPILE_SERVICE.md)
