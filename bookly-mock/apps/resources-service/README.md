# 📦 Resources Service

Sistema de gestión de recursos físicos institucionales para Bookly.

## 📋 Índice

- [Descripción](#descripción)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [API Documentation](#api-documentation)
- [Testing](#testing)

---

## 📖 Descripción

El **Resources Service** gestiona el inventario completo de recursos físicos institucionales:

- **Recursos**: Salas, auditorios, laboratorios, equipos
- **Categorización**: Clasificación por tipo y programa académico
- **Atributos**: Capacidad, ubicación, equipamiento
- **Reglas de Disponibilidad**: Configuración de horarios y restricciones
- **Importación Masiva**: Carga de recursos desde CSV
- **Mantenimiento**: Gestión de estados y mantenimiento preventivo

---

## ✨ Características

### RF-01: Crear, Editar y Eliminar Recursos

- ✅ CRUD completo de recursos
- ✅ Soft delete (deshabilitación)
- ✅ Validaciones de datos obligatorios
- ✅ Auditoría de cambios
- ✅ Preservación de historial

---

### RF-02: Asociar Recursos a Categoría y Programas

- ✅ Categorías predefinidas: ROOM, AUDITORIUM, LAB, EQUIPMENT, VEHICLE
- ✅ Asignación a múltiples programas académicos
- ✅ Búsqueda por categoría
- ✅ Filtros por programa

---

### RF-03: Definir Atributos Clave del Recurso

Atributos soportados:

- **Capacidad**: Número de personas
- **Ubicación**: Edificio, piso, número
- **Equipamiento**: Proyector, aire acondicionado, pizarra, etc.
- **Accesibilidad**: Rampas, elevadores, baños adaptados
- **Metadatos**: Información adicional flexible

---

### RF-04: Importación Masiva de Recursos

- ✅ Importación desde archivos CSV
- ✅ Validación de formato
- ✅ Preview de datos antes de importar
- ✅ Reporte de errores detallado
- ✅ Importación en batch
- ✅ Rollback en caso de error

**Documentación**: [`docs/RF04_IMPORTACION_CSV_ADVANCED.md`](docs/RF04_IMPORTACION_CSV_ADVANCED.md)

---

### RF-05: Configuración de Reglas de Disponibilidad

- ✅ Horarios de disponibilidad por día de semana
- ✅ Excepciones de calendario (festivos, eventos)
- ✅ Sincronización con Availability Service
- ✅ Propagación automática de cambios
- ✅ Lifecycle hooks (beforeCreate, afterUpdate)

**Documentación**:

- [`docs/RF05_SINCRONIZACION_AVAILABILITY_RULES_COMPLETE.md`](docs/RF05_SINCRONIZACION_AVAILABILITY_RULES_COMPLETE.md)
- [`docs/RF05_EXTENSION_RESOURCE_LIFECYCLE.md`](docs/RF05_EXTENSION_RESOURCE_LIFECYCLE.md)

---

### RF-06: Mantenimiento de Recursos

- ✅ Estados: ACTIVE, INACTIVE, MAINTENANCE, RETIRED
- ✅ Programación de mantenimiento preventivo
- ✅ Registro de intervenciones
- ✅ Historial de mantenimiento
- ✅ Notificaciones automáticas

---

## 🛠️ Stack Tecnológico

- **NestJS**: Framework modular
- **Prisma**: ORM sobre MongoDB
- **MongoDB**: Base de datos NoSQL
- **Event Bus (RabbitMQ)**: Comunicación con otros servicios
- **Redis**: Cache distribuido
- **Winston**: Logging estructurado

---

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Ejecutar seeds
npm run seed
```

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# MongoDB
DATABASE_URL="mongodb://localhost:27017/bookly-resources"

# Event Bus
RABBITMQ_URL="amqp://localhost:5672"
RABBITMQ_EXCHANGE="bookly-events"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Port
PORT=3002
```

---

## 📚 API Documentation

### Swagger

```
http://localhost:3002/api/docs
```

### Endpoints Principales

#### Recursos

- `GET /api/resources` - Listar recursos (con filtros y paginación)
- `POST /api/resources` - Crear nuevo recurso
- `GET /api/resources/:id` - Obtener recurso por ID
- `PATCH /api/resources/:id` - Actualizar recurso
- `DELETE /api/resources/:id` - Eliminar/deshabilitar recurso
- `POST /api/resources/import` - Importación masiva desde CSV
- `GET /api/resources/search` - Búsqueda avanzada

#### Categorías

- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `GET /api/categories/:id/resources` - Recursos por categoría

#### Mantenimiento

- `GET /api/resources/:id/maintenance` - Historial de mantenimiento
- `POST /api/resources/:id/maintenance` - Programar mantenimiento
- `PATCH /api/maintenance/:id` - Actualizar estado de mantenimiento

---

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

---

## 🔗 Enlaces Relacionados

- [Documentación General](../../docs/RESOURCES_SERVICE.md)
- [Implementación RF-04](docs/RF04_IMPORTACION_CSV_ADVANCED.md)
- [Implementación RF-05](docs/RF05_SINCRONIZACION_AVAILABILITY_RULES_COMPLETE.md)

---

**Mantenedores**:

- Bookly Development Team
- UFPS - Universidad Francisco de Paula Santander

**Última actualización**: Noviembre 6, 2025
