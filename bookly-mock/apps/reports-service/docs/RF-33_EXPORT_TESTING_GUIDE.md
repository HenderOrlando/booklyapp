# RF-33: Sistema de Exportación - Guía de Pruebas

## 📋 Resumen

Esta guía describe cómo probar el sistema completo de exportación de reportes en los formatos CSV, PDF y Excel.

---

## 🎯 Funcionalidades a Probar

1. **Solicitar Exportación** - Crear solicitud de exportación
2. **Consultar Estado** - Ver estado de procesamiento
3. **Descargar Archivo** - Obtener el archivo generado
4. **Historial** - Ver historial de exportaciones del usuario

---

## 🔧 Configuración Previa

### Variables de Entorno

```bash
JWT_SECRET=bookly-secret-key
MONGODB_URI=mongodb://localhost:27017/reports-service
RABBITMQ_URL=amqp://localhost:5672
```

### Estructura de Directorio

El servicio crea automáticamente el directorio `exports/` en la raíz del proyecto para almacenar los archivos generados.

---

## 🧪 Casos de Prueba

### 1. Solicitar Exportación CSV

**Endpoint**: `POST /api/v1/reports/export`

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body**:

```json
{
  "reportType": "USAGE",
  "format": "CSV",
  "filters": {
    "resourceId": "123e4567-e89b-12d3-a456-426614174000",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

**Respuesta Esperada** (201 Created):

```json
{
  "id": "export-uuid-123",
  "userId": "user-uuid-456",
  "reportType": "USAGE",
  "format": "CSV",
  "status": "PENDING",
  "filters": { ... },
  "filePath": null,
  "fileSize": null,
  "errorMessage": null,
  "metadata": {
    "createdBy": "user-uuid-456"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Consultar Estado de Exportación

**Endpoint**: `GET /api/v1/reports/export/{exportId}`

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Respuestas Esperadas**:

**Estado PENDING**:

```json
{
  "id": "export-uuid-123",
  "status": "PENDING",
  ...
}
```

**Estado PROCESSING**:

```json
{
  "id": "export-uuid-123",
  "status": "PROCESSING",
  ...
}
```

**Estado COMPLETED**:

```json
{
  "id": "export-uuid-123",
  "status": "COMPLETED",
  "filePath": "/path/to/exports/USAGE_1234567890.csv",
  "fileSize": 2048,
  "downloadUrl": "/api/v1/reports/export/export-uuid-123/download",
  ...
}
```

**Estado FAILED**:

```json
{
  "id": "export-uuid-123",
  "status": "FAILED",
  "errorMessage": "No data found for report type: USAGE",
  ...
}
```

---

### 3. Descargar Archivo Exportado

**Endpoint**: `GET /api/v1/reports/export/{exportId}/download`

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Respuesta Esperada** (200 OK):

- **Headers**:
  - `Content-Type`: Según formato
    - CSV: `text/csv`
    - PDF: `application/pdf`
    - Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `Content-Disposition`: `attachment; filename="reporte_usage_2024-01-15.csv"`
  - `Content-Length`: Tamaño del archivo en bytes

- **Body**: Stream del archivo

**Errores**:

- **404 Not Found**: Si el export no existe, no está completado, o no pertenece al usuario
- **404 Not Found**: Si el archivo físico no existe en disco

---

### 4. Historial de Exportaciones

**Endpoint**: `GET /api/v1/reports/export?page=1&limit=20`

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters**:

- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Registros por página (default: 20)

**Respuesta Esperada** (200 OK):

```json
{
  "exports": [
    {
      "id": "export-uuid-123",
      "reportType": "USAGE",
      "format": "CSV",
      "status": "COMPLETED",
      "downloadUrl": "/api/v1/reports/export/export-uuid-123/download",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "export-uuid-456",
      "reportType": "USER",
      "format": "PDF",
      "status": "PENDING",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "pages": 1
}
```

---

## 📝 Formatos de Exportación

### CSV (Comma-Separated Values)

**Características**:

- Texto plano separado por comas
- Compatible con Excel, LibreOffice, Google Sheets
- Ligero y rápido de generar

**Ejemplo de Contenido**:

```csv
recurso,tipo,periodo_inicio,periodo_fin,total_reservas,ocupacion_porcentaje
Sala 101,ROOM,2024-01-01,2024-01-31,45,75.5
```

---

### PDF (Portable Document Format)

**Características**:

- Documento profesional con formato HTML+CSS
- Headers, tablas de estadísticas, y footer
- No editable, ideal para reportes oficiales

**Contenido**:

- Logo y título de Bookly
- Información del recurso/usuario
- Tabla de estadísticas
- Footer con fecha de generación

---

### Excel (XLSX - SpreadsheetML)

**Características**:

- Compatible con Microsoft Excel y LibreOffice
- Headers con formato (bold + color)
- Datos tipados (String, Number)

**Contenido**:

- Hoja "Reporte de Uso" con headers formateados
- Datos tabulados con tipos correctos
- Compatible con fórmulas y gráficos

---

## 🔄 Flujo Completo de Prueba

### Paso 1: Crear Datos de Prueba

Primero, asegúrate de tener reportes de uso creados en la base de datos:

```bash
# Ejecutar seeds si es necesario
npm run prisma:db:seed
```

### Paso 2: Solicitar Exportación

```bash
curl -X POST http://localhost:3005/api/v1/reports/export \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "USAGE",
    "format": "CSV",
    "filters": {}
  }'
```

**Guardar el `id` de la respuesta.**

### Paso 3: Monitorear Estado

```bash
export EXPORT_ID="export-uuid-123"

# Verificar cada 5 segundos
watch -n 5 "curl -s http://localhost:3005/api/v1/reports/export/$EXPORT_ID \
  -H 'Authorization: Bearer $JWT_TOKEN' | jq '.status'"
```

### Paso 4: Descargar Archivo

Una vez que el estado sea `COMPLETED`:

```bash
curl -O -J http://localhost:3005/api/v1/reports/export/$EXPORT_ID/download \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Paso 5: Verificar Archivo

```bash
# Para CSV
cat reporte_usage_*.csv

# Para Excel (usar libreoffice)
libreoffice reporte_usage_*.xlsx

# Para PDF (usar navegador)
open reporte_usage_*.pdf
```

---

## ⚠️ Casos de Error

### 1. Export No Encontrado

**Request**:

```bash
curl http://localhost:3005/api/v1/reports/export/invalid-id/download \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Respuesta** (404):

```json
{
  "statusCode": 404,
  "message": "Export not found, not completed, or not authorized",
  "error": "Not Found"
}
```

---

### 2. Export No Completado

Intentar descargar un export con status `PENDING` o `PROCESSING`.

**Respuesta** (404):

```json
{
  "statusCode": 404,
  "message": "Export not found, not completed, or not authorized",
  "error": "Not Found"
}
```

---

### 3. Acceso No Autorizado

Intentar descargar un export de otro usuario.

**Respuesta** (404):

```json
{
  "statusCode": 404,
  "message": "Export not found, not completed, or not authorized",
  "error": "Not Found"
}
```

---

### 4. Archivo No Existe en Disco

El export está `COMPLETED` pero el archivo fue eliminado.

**Respuesta** (404):

```json
{
  "statusCode": 404,
  "message": "Export file not found on disk",
  "error": "Not Found"
}
```

---

## 🧹 Limpieza Automática

El servicio limpia automáticamente exportaciones antiguas (>30 días).

**Método**: `ExportService.cleanupOldExports()`

**Ejecución**: Puede configurarse como cron job:

```typescript
@Cron('0 0 * * *') // Diario a medianoche
async handleCleanup() {
  await this.exportService.cleanupOldExports();
}
```

---

## 📊 Métricas de Rendimiento

### Tiempos Esperados

| Formato | Tamaño Dato | Tiempo Generación | Tamaño Archivo |
| ------- | ----------- | ----------------- | -------------- |
| CSV     | 1 registro  | ~50ms             | ~500 bytes     |
| PDF     | 1 registro  | ~100ms            | ~5 KB          |
| Excel   | 1 registro  | ~150ms            | ~10 KB         |

### Uso de Memoria

- **CSV**: Bajo (~1 MB)
- **PDF**: Medio (~5 MB)
- **Excel**: Medio (~5 MB)

---

## ✅ Checklist de Validación

- [ ] Exportación CSV se crea correctamente
- [ ] Exportación PDF se crea correctamente
- [ ] Exportación Excel se crea correctamente
- [ ] Estado cambia de PENDING → PROCESSING → COMPLETED
- [ ] URL de descarga se genera en estado COMPLETED
- [ ] Descarga funciona con headers correctos
- [ ] Content-Type es correcto para cada formato
- [ ] Archivo descargado es válido
- [ ] Historial muestra todas las exportaciones del usuario
- [ ] No se puede descargar export de otro usuario
- [ ] Error 404 cuando export no existe
- [ ] Error 404 cuando export no está completado
- [ ] Limpieza automática elimina exports antiguos

---

## 🎯 Resultado Esperado

**RF-33 Sistema de Exportación**: ✅ **100% FUNCIONAL**

- ✅ 3 formatos soportados (CSV, PDF, Excel)
- ✅ Procesamiento asíncrono
- ✅ Estados bien definidos
- ✅ Descarga segura con autorización
- ✅ URLs de descarga generadas
- ✅ Historial paginado
- ✅ Manejo de errores completo
- ✅ Limpieza automática
