# Domain Events - Stockpile Service

Esta carpeta contiene los eventos de dominio del servicio de aprobaciones.

## Propósito

Los eventos de dominio representan hechos que han ocurrido en el flujo de aprobaciones.

## Ejemplos de eventos

- `ApprovalRequestCreatedEvent` - Cuando se crea una solicitud de aprobación
- `StepApprovedEvent` - Cuando se aprueba un paso del flujo
- `StepRejectedEvent` - Cuando se rechaza un paso del flujo
- `ApprovalCompletedEvent` - Cuando se completa todo el flujo de aprobación
- `CheckInPerformedEvent` - Cuando se realiza un check-in
- `CheckOutPerformedEvent` - Cuando se realiza un check-out
