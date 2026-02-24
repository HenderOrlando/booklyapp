# 🔌 Resources Service - Endpoints

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Tabla de Contenidos

- [Recursos (Resources)](#recursos-resources)
- [Categorías (Categories)](#categorías-categories)
- [Mantenimiento (Maintenance)](#mantenimiento-maintenance)
- [Importación Masiva](#importación-masiva)

---

## 🏢 Recursos (Resources)

### Listar Recursos

**GET** `/api/resources`

**Query Parameters**:

```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  type?: string;        // ROOM, AUDITORIUM, LAB, EQUIPMENT
  categoryId?: string;
  isActive?: boolean;   // Default: true
  search?: string;      // Buscar por nombre, código o ubicación
}
```

**Response 200**:

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Salón A-101",
      "code": "SAL-A101",
      "type": "ROOM",
      "capacity": 40,
      "location": "Edificio A, Piso 1",
      "category": {
        "id": "507f1f77bcf86cd799439020",
        "name": "Salón de Clases"
      },
      "maintenanceStatus": "OPERATIONAL",
      "isActive": true
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**Permisos**: Público o `resources:read`

---

### Obtener Recurso por ID

**GET** `/api/resources/:id`

**Response 200**:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Salón A-101",
  "code": "SAL-A101",
  "type": "ROOM",
  "description": "Salón de clases con capacidad para 40 estudiantes",
  "capacity": 40,
  "location": "Edificio A, Piso 1",
  "floor": "1",
  "building": "A",
  "category": {
    "id": "507f1f77bcf86cd799439020",
    "name": "Salón de Clases",
    "color": "#3B82F6"
  },
  "attributes": {
    "equipment": ["projector", "whiteboard", "air_conditioning"],
    "accessibility": ["wheelchair_accessible"]
  },
  "images": ["https://cdn.bookly.com/resources/sal-a101-1.jpg"],
  "maintenanceStatus": "OPERATIONAL",
  "lastMaintenance": "2025-10-15T10:00:00Z",
  "isActive": true,
  "createdAt": "2025-09-01T08:00:00Z"
}
```

**Errores**:

- `404`: Recurso no encontrado

---

### Crear Recurso

**POST** `/api/resources`

**Body**:

```json
{
  "name": "Salón B-205",
  "type": "ROOM",
  "description": "Salón amplio con aire acondicionado",
  "capacity": 45,
  "location": "Edificio B, Piso 2",
  "floor": "2",
  "building": "B",
  "categoryId": "507f1f77bcf86cd799439020",
  "attributes": {
    "equipment": ["projector", "speakers"],
    "accessibility": ["wheelchair_accessible"]
  },
  "isPublic": true,
  "requiresApproval": false
}
```

**Response 201**:

```json
{
  "id": "507f1f77bcf86cd799439012",
  "code": "SAL-B205",
  "name": "Salón B-205",
  "...": "..."
}
```

**Permisos**: `resources:create`

**Errores**:

- `400`: Validación fallida
- `409`: Código duplicado

---

### Actualizar Recurso

**PATCH** `/api/resources/:id`

**Body**:

```json
{
  "capacity": 50,
  "attributes": {
    "equipment": ["projector", "speakers", "microphone"]
  }
}
```

**Response 200**: Recurso actualizado

**Permisos**: `resources:update`

---

### Eliminar Recurso

**DELETE** `/api/resources/:id`

**Response 204**: Sin contenido

**Permisos**: `resources:delete`

**Nota**: Soft delete, se marca `isActive: false`

---

### Buscar Recursos

**GET** `/api/resources/search?q=auditorio`

**Response 200**: Array de recursos coincidentes

---

## 📂 Categorías (Categories)

### Listar Categorías

**GET** `/api/categories?type=RESOURCE_TYPE`

**Response 200**:

```json
[
  {
    "id": "507f1f77bcf86cd799439020",
    "type": "RESOURCE_TYPE",
    "name": "Salón de Clases",
    "code": "ROOM",
    "color": "#3B82F6",
    "icon": "classroom",
    "isActive": true
  }
]
```

---

### Crear Categoría

**POST** `/api/categories`

**Body**:

```json
{
  "type": "RESOURCE_TYPE",
  "name": "Sala de Conferencias",
  "code": "CONFERENCE",
  "color": "#EF4444",
  "description": "Espacios para conferencias y eventos"
}
```

**Permisos**: `categories:create`

---

## 🔧 Mantenimiento (Maintenance)

### Crear Registro de Mantenimiento

**POST** `/api/maintenance`

**Body**:

```json
{
  "resourceId": "507f1f77bcf86cd799439011",
  "type": "PREVENTIVE",
  "title": "Mantenimiento mensual",
  "description": "Revisión de equipos",
  "priority": "MEDIUM",
  "scheduledDate": "2025-11-15T08:00:00Z",
  "estimatedCost": 150000
}
```

**Response 201**: Registro creado

**Permisos**: `maintenance:create`

---

### Listar Mantenimientos de un Recurso

**GET** `/api/maintenance/resource/:resourceId`

**Response 200**: Array de registros de mantenimiento

---

## 📥 Importación Masiva

### Subir Archivo CSV

**POST** `/api/resources/import`

**Content-Type**: `multipart/form-data`

**Body**:

- `file`: Archivo CSV

**Response 202**:

```json
{
  "importId": "507f1f77bcf86cd799439060",
  "status": "PROCESSING",
  "message": "Import started, check status at /api/resources/import/507f1f77bcf86cd799439060"
}
```

**Permisos**: `resources:import`

---

### Verificar Estado de Importación

**GET** `/api/resources/import/:importId`

**Response 200**:

```json
{
  "id": "507f1f77bcf86cd799439060",
  "status": "COMPLETED",
  "totalRows": 50,
  "successCount": 48,
  "errorCount": 2,
  "errors": [{ "row": 15, "error": "Código duplicado" }]
}
```

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Base de Datos](DATABASE.md)
- [Event Bus](EVENT_BUS.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
