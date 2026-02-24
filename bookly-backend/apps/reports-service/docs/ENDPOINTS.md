# 🔌 Reports Service - Endpoints

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Tabla de Contenidos

- [Reportes](#reportes)
- [Dashboard](#dashboard)
- [Feedback](#feedback)
- [Exportaciones](#exportaciones)

---

## 📊 Reportes

### Generar Reporte de Uso por Recurso

**POST** `/api/reports/usage/resource`

**Body**:

```json
{
  "resourceId": "507f1f77bcf86cd799439011",
  "dateRange": {
    "from": "2025-01-01",
    "to": "2025-12-31"
  },
  "format": "PDF"
}
```

**Response 201**: Reporte generado

**Permisos**: `reports:generate`

---

### Generar Reporte por Usuario

**POST** `/api/reports/usage/user`

**Body**:

```json
{
  "userId": "507f1f77bcf86cd799439020",
  "dateRange": {
    "from": "2025-01-01",
    "to": "2025-12-31"
  }
}
```

---

### Listar Reportes

**GET** `/api/reports`

**Query**: `?page=1&limit=20&type=USAGE_BY_RESOURCE`

**Response 200**: Lista paginada de reportes

---

## 📈 Dashboard

### Obtener Métricas de Dashboard

**GET** `/api/dashboard/metrics`

**Query**: `?period=DAILY&metricType=TOTAL_RESERVATIONS`

**Response 200**:

```json
{
  "metrics": [
    {
      "metricType": "TOTAL_RESERVATIONS",
      "value": 1250,
      "periodStart": "2025-11-01",
      "periodEnd": "2025-11-30"
    }
  ]
}
```

**Permisos**: `dashboard:read`

---

## 💬 Feedback

### Enviar Feedback

**POST** `/api/feedback`

**Body**:

```json
{
  "reservationId": "507f1f77bcf86cd799439030",
  "resourceId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "comment": "Excelente sala",
  "category": "RESOURCE_QUALITY"
}
```

**Response 201**: Feedback registrado

---

### Listar Feedback

**GET** `/api/feedback`

**Query**: `?resourceId=xxx&status=PENDING`

**Permisos**: `feedback:read`

---

## 📥 Exportaciones

### Exportar Datos

**POST** `/api/exports`

**Body**:

```json
{
  "dataType": "RESERVATIONS",
  "format": "CSV",
  "filters": {
    "dateRange": {
      "from": "2025-01-01",
      "to": "2025-12-31"
    }
  }
}
```

**Response 202**: Exportación iniciada

---

### Ver Estado de Exportación

**GET** `/api/exports/:id`

**Response 200**:

```json
{
  "id": "507f1f77bcf86cd799439040",
  "status": "COMPLETED",
  "fileUrl": "https://storage.bookly.com/exports/..."
}
```

---

## 📚 Documentación Relacionada

- [Arquitectura](ARCHITECTURE.md)
- [Base de Datos](DATABASE.md)

---

**Mantenedor**: Bookly Development Team
