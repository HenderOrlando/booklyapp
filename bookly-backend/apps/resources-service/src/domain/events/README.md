# Domain Events - Resources Service

Esta carpeta contiene los eventos de dominio del servicio de recursos.

## Propósito

Los eventos de dominio representan hechos que han ocurrido en el dominio del negocio y que son relevantes para otras partes del sistema.

## Ejemplos de eventos

- `ResourceCreatedEvent` - Cuando se crea un recurso
- `ResourceUpdatedEvent` - Cuando se actualiza un recurso
- `ResourceDeletedEvent` - Cuando se elimina un recurso
- `MaintenanceScheduledEvent` - Cuando se programa un mantenimiento
- `MaintenanceCompletedEvent` - Cuando se completa un mantenimiento

## Estructura de un evento

```typescript
export class ResourceCreatedEvent {
  constructor(
    public readonly resourceId: string,
    public readonly name: string,
    public readonly type: string,
    public readonly categoryId: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
```

## Uso

Los eventos se publican desde los servicios de aplicación y se consumen por event handlers.
