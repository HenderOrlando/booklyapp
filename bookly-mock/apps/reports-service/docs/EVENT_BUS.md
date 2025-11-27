# 🔄 Reports Service - Event Bus

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Eventos Publicados](#eventos-publicados)
- [Eventos Consumidos](#eventos-consumidos)

---

## 🎯 Visión General

Reports Service consume eventos de otros servicios para actualizar métricas y publica eventos sobre reportes generados.

---

## 📤 Eventos Publicados

### 1. ReportGeneratedEvent

**Routing Key**: `reports.report.generated`

**Payload**:

```json
{
  "eventId": "uuid",
  "timestamp": "2025-11-06T22:00:00Z",
  "data": {
    "reportId": "507f1f77bcf86cd799439011",
    "type": "USAGE_BY_RESOURCE",
    "format": "PDF",
    "generatedBy": "507f1f77bcf86cd799439020",
    "fileUrl": "https://storage.bookly.com/reports/..."
  }
}
```

**Consumidores**: Notification Service

---

### 2. FeedbackSubmittedEvent

**Routing Key**: `reports.feedback.submitted`

**Payload**:

```json
{
  "eventId": "uuid",
  "timestamp": "2025-11-06T22:05:00Z",
  "data": {
    "feedbackId": "507f1f77bcf86cd799439030",
    "userId": "507f1f77bcf86cd799439040",
    "resourceId": "507f1f77bcf86cd799439050",
    "rating": 5
  }
}
```

---

## 📥 Eventos Consumidos

### availability.reservation.created

Actualizar métricas de uso de recursos.

### availability.reservation.cancelled

Actualizar estadísticas de cancelaciones.

### resources.resource.created

Agregar recurso a reportes disponibles.

### auth.user.registered

Actualizar métricas de usuarios activos.

---

## 📚 Documentación Relacionada

- [Arquitectura](ARCHITECTURE.md)
- [Endpoints](ENDPOINTS.md)

---

**Mantenedor**: Bookly Development Team
