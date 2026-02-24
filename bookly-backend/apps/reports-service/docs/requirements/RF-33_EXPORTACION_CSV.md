# RF-33: Exportación en múltiples formatos (CSV, PDF, Excel)

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Noviembre 6, 2025

---

## 📋 Descripción

Permite exportar reportes y datos en múltiples formatos (CSV, PDF, Excel) para análisis externo, presentaciones o respaldos. Los usuarios pueden personalizar las columnas y descargar directamente o recibir por email.

---

## ✅ Criterios de Aceptación

- [x] Exportación a formato CSV con delimitadores configurables
- [x] Generación de PDF con gráficos y tablas
- [x] Exportación a Excel con múltiples hojas
- [x] Personalización de columnas a exportar
- [x] Descarga directa o envío por email
- [x] Procesamiento asíncrono para exportaciones grandes
- [x] Notificación cuando la exportación está lista

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `ExportController` - Maneja solicitudes de exportación

**Services**:

- `ExportService` - Lógica de exportación
- `CSVGeneratorService` - Generación de archivos CSV
- `PDFGeneratorService` - Generación de archivos PDF
- `ExcelGeneratorService` - Generación de archivos Excel

**Repositories**:

- `ExportRepository` - Persistencia de exportaciones

**Commands** (CQRS):

- `ExportReportCommand` - Comando de exportación
- `GenerateCSVCommand` - Generación CSV
- `GeneratePDFCommand` - Generación PDF
- `GenerateExcelCommand` - Generación Excel

**Queries** (CQRS):

- `GetExportStatusQuery` - Estado de exportación
- `GetExportHistoryQuery` - Historial de exportaciones

---

### Endpoints Creados

```http
POST   /api/v1/reports/export              # Solicitar exportación
GET    /api/v1/reports/export/:id          # Obtener estado
GET    /api/v1/reports/export/:id/download # Descargar archivo
GET    /api/v1/reports/export/history      # Historial de exportaciones
```

**Request Body** (POST):

```json
{
  "reportType": "usage|user|feedback|demand",
  "format": "csv|pdf|excel",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "resourceId": "optional"
  },
  "columns": ["column1", "column2"],
  "sendEmail": false
}
```

**Permisos Requeridos**:

- `reports:export` - Exportar reportes
- Limitación: 5 exportaciones por día

---

### Eventos Publicados

- `ExportCompletedEvent` - Exportación completada
- `ExportFailedEvent` - Error en exportación

**Routing Keys**:

- `reports.export.completed`
- `reports.export.failed`

---

## 🗄️ Base de Datos

### Entidades

**Export**:

```prisma
model Export {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId

  format        String   // csv, pdf, excel
  dataType      String   // usage, user, feedback, demand

  filters       Json
  fileUrl       String?
  fileSize      Int?

  status        String   @default("PROCESSING") // PROCESSING, COMPLETED, FAILED
  error         String?

  requestedBy   String   @db.ObjectId
  requestedAt   DateTime @default(now())
  completedAt   DateTime?

  @@index([requestedBy, requestedAt])
  @@index([status])
  @@map("exports")
}
```

### Índices

```javascript
db.exports.createIndex({ requestedBy: 1, requestedAt: -1 });
db.exports.createIndex({ status: 1 });
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- export.service.spec.ts
npm run test -- csv-generator.service.spec.ts
npm run test -- pdf-generator.service.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- export.e2e-spec.ts
```

### Cobertura

- **Líneas**: 82%
- **Funciones**: 85%
- **Ramas**: 78%

---

## 🔒 Seguridad

- Rate limiting: 5 exportaciones por día por usuario
- Validación de permisos antes de exportar
- Archivos con TTL de 24 horas
- URLs firmadas para descargas seguras

---

## ⚡ Performance

- Procesamiento asíncrono con Bull Queue
- Generación en background para archivos >1000 registros
- Notificación por email cuando está listo
- Almacenamiento temporal en S3/MinIO
- Compresión automática para archivos grandes

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#exportaciones)
- [Base de Datos](../DATABASE.md#export)
- [Endpoints](../ENDPOINTS.md#exportacion)

---

## 🔄 Changelog

| Fecha      | Cambio                        | Autor |
| ---------- | ----------------------------- | ----- |
| 2025-11-06 | Implementación inicial RF-33  | Team  |
| 2025-11-06 | Agregado procesamiento async  | Team  |
| 2025-11-06 | Soporte para Excel multi-hoja | Team  |

---

## 📝 Notas Adicionales

- Los archivos CSV usan UTF-8 con BOM para compatibilidad Excel
- Los PDF incluyen logo institucional y fecha de generación
- Excel permite múltiples hojas (datos, gráficos, resumen)
- Límite de tamaño: 10MB por exportación

---

**Mantenedor**: Bookly Development Team
