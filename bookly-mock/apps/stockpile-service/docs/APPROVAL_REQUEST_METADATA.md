# Metadata de ApprovalRequest

## Estructura Requerida

Al crear una `ApprovalRequest`, el campo `metadata` debe incluir ciertos campos obligatorios para el correcto funcionamiento de las funcionalidades del sistema.

### Campos Obligatorios

```typescript
{
  // Fecha de inicio de la reserva (ISO 8601)
  // OBLIGATORIO para RF-23 (vista de vigilante)
  reservationStartDate: string; // "2025-01-05T09:00:00.000Z"

  // Fecha de fin de la reserva (ISO 8601)
  // RECOMENDADO
  reservationEndDate: string; // "2025-01-05T11:00:00.000Z"

  // ID del recurso reservado
  // RECOMENDADO
  resourceId: string;

  // Nombre del recurso (para mostrar en UI)
  // OPCIONAL
  resourceName?: string;

  // Información adicional del usuario
  // OPCIONAL
  requesterName?: string;
  requesterEmail?: string;

  // Propósito de la reserva
  // OPCIONAL
  purpose?: string;
}
```

## Ejemplo de Creación

```typescript
const metadata = {
  reservationStartDate: "2025-01-05T09:00:00.000Z",
  reservationEndDate: "2025-01-05T11:00:00.000Z",
  resourceId: "resource-123",
  resourceName: "Auditorio Principal",
  requesterName: "Juan Pérez",
  requesterEmail: "juan.perez@ufps.edu.co",
  purpose: "Conferencia de Investigación",
};

const command = new CreateApprovalRequestCommand(
  reservationId,
  requesterId,
  approvalFlowId,
  metadata, // ← Incluir metadata con reservationStartDate
  createdBy
);
```

## Validación en CreateApprovalRequestDto

```typescript
@ApiProperty({
  description: "Metadata adicional (DEBE incluir reservationStartDate)",
  example: {
    reservationStartDate: "2025-01-05T09:00:00.000Z",
    reservationEndDate: "2025-01-05T11:00:00.000Z",
    resourceId: "resource-123",
    resourceName: "Auditorio Principal",
  },
})
@IsOptional()
@IsObject()
metadata?: Record<string, any>;
```

## Funcionalidades que Dependen de Metadata

### RF-23: Vista para Vigilante

El endpoint `GET /approval-requests/active-today` filtra usando `metadata.reservationStartDate`:

```typescript
// Query MongoDB
{
  status: "approved",
  "metadata.reservationStartDate": {
    $gte: startOfDay,
    $lte: endOfDay
  }
}
```

### Futuras Funcionalidades

- **RF-29: Recordatorios** - Usará `reservationStartDate` para calcular cuándo enviar recordatorios
- **RF-30: Notificaciones Real-Time** - Usará `resourceId` para suscripciones
- **Dashboards** - Usará fechas para analytics temporales

## Recomendaciones

1. **Siempre incluir `reservationStartDate`** al crear ApprovalRequest
2. **Validar formato ISO 8601** antes de persistir
3. **Obtener datos desde availability-service** al crear la aprobación
4. **Mantener sincronizado** con cambios en la reserva

## Migración de Datos Existentes

Para ApprovalRequests existentes sin metadata.reservationStartDate:

```typescript
// Script de migración (ejecutar una vez)
const requests = await ApprovalRequest.find({
  "metadata.reservationStartDate": { $exists: false },
});

for (const request of requests) {
  // Obtener fecha desde availability-service
  const reservation = await getReservationById(request.reservationId);

  await ApprovalRequest.updateOne(
    { _id: request._id },
    {
      $set: {
        "metadata.reservationStartDate": reservation.startDate,
        "metadata.reservationEndDate": reservation.endDate,
        "metadata.resourceId": reservation.resourceId,
      },
    }
  );
}
```

## Integración con Availability-Service

Al crear una ApprovalRequest desde el availability-service:

```typescript
// En availability-service
async function createApprovalRequestForReservation(reservation) {
  const metadata = {
    reservationStartDate: reservation.startDate,
    reservationEndDate: reservation.endDate,
    resourceId: reservation.resourceId,
    resourceName: reservation.resource?.name,
    purpose: reservation.purpose,
  };

  // Llamar a stockpile-service vía HTTP o evento
  await stockpileService.createApprovalRequest({
    reservationId: reservation.id,
    requesterId: reservation.userId,
    approvalFlowId: determineApprovalFlow(reservation),
    metadata,
  });
}
```
