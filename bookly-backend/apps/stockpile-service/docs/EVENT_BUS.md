# 🔄 Stockpile Service - Event Bus

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Eventos Publicados](#eventos-publicados)
- [Eventos Consumidos](#eventos-consumidos)

---

## 🎯 Visión General

El **Stockpile Service** publica eventos sobre aprobaciones y consume eventos de reservas.

---

## 📤 Eventos Publicados

### 1. ApprovalRequestedEvent

**Routing Key**: `stockpile.approval.requested`

**Payload**:

```json
{
  "eventId": "uuid",
  "timestamp": "2025-11-06T20:00:00Z",
  "data": {
    "approvalRequestId": "507f1f77bcf86cd799439011",
    "reservationId": "507f1f77bcf86cd799439020",
    "requesterId": "507f1f77bcf86cd799439030",
    "approverRole": "coordinator"
  }
}
```

**Consumidores**:

- **Notification Service**: Notifica al aprobador
- **Reports Service**: Actualiza estadísticas

---

### 2. ApprovalGrantedEvent

**Routing Key**: `stockpile.approval.granted`

**Payload**:

```json
{
  "eventId": "uuid",
  "timestamp": "2025-11-06T20:05:00Z",
  "data": {
    "approvalRequestId": "507f1f77bcf86cd799439011",
    "reservationId": "507f1f77bcf86cd799439020",
    "approvedBy": "507f1f77bcf86cd799439040"
  }
}
```

**Consumidores**:

- **Notification Service**: Notifica al solicitante
- **Availability Service**: Confirma reserva

---

### 3. ApprovalRejectedEvent

**Routing Key**: `stockpile.approval.rejected`

**Payload**:

```json
{
  "eventId": "uuid",
  "timestamp": "2025-11-06T20:10:00Z",
  "data": {
    "approvalRequestId": "507f1f77bcf86cd799439011",
    "reservationId": "507f1f77bcf86cd799439020",
    "rejectedBy": "507f1f77bcf86cd799439040",
    "reason": "Fecha no disponible"
  }
}
```

---

## 📥 Eventos Consumidos

### availability.reservation.created

Crear solicitud de aprobación si el recurso lo requiere.

### resources.resource.created

Configurar flujo de aprobación para el nuevo recurso.

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Endpoints](ENDPOINTS.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
