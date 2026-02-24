# 📅 Availability Service

Sistema de gestión de disponibilidad y reservas para Bookly.

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

El **Availability Service** gestiona la disponibilidad de recursos y el sistema completo de reservas:

- **Horarios de Disponibilidad**: Configuración por recurso
- **Reservas**: Creación, modificación y cancelación
- **Búsqueda Avanzada**: Filtros múltiples y disponibilidad en tiempo real
- **Reservas Periódicas**: Recurrencia semanal/mensual
- **Lista de Espera**: Gestión automática de cancelaciones
- **Integración con Calendarios**: iCal, Google Calendar
- **Conflictos**: Detección y prevención automática

---

## ✨ Características

### RF-07: Configurar Disponibilidad

- ✅ Horarios por día de semana
- ✅ Excepciones de calendario
- ✅ Bloques de tiempo personalizados
- ✅ Sincronización con Resources Service

---

### RF-08: Integración con Calendarios

- ✅ Exportación a formato iCal
- ⚠️ Sincronización con Google Calendar (en progreso)
- ⚠️ Sincronización con Outlook (en progreso)
- ✅ Webhooks de actualización

---

### RF-09: Búsqueda Avanzada

- ✅ Filtros por categoría, capacidad, ubicación
- ✅ Filtros por equipamiento
- ✅ Búsqueda por rango de fechas
- ✅ Disponibilidad en tiempo real
- ✅ Ordenamiento por relevancia
- ✅ Paginación optimizada

**Documentación**:

- [`docs/RF09_BUSQUEDA_AVANZADA_DISPONIBILIDAD.md`](docs/RF09_BUSQUEDA_AVANZADA_DISPONIBILIDAD.md)
- [`docs/RF09_IMPLEMENTACION_LOGICA_MONGODB.md`](docs/RF09_IMPLEMENTACION_LOGICA_MONGODB.md)
- [`docs/RF09_RESUMEN_FINAL.md`](docs/RF09_RESUMEN_FINAL.md)

---

### RF-10: Visualización en Calendario

- ✅ Vista mensual
- ✅ Vista semanal
- ✅ Vista diaria
- ✅ Códigos de color por estado
- ✅ Exportación a PDF

---

### RF-11: Historial de Uso

- ✅ Registro completo de reservas
- ✅ Estadísticas por recurso
- ✅ Estadísticas por usuario
- ✅ Reportes de ocupación
- ✅ Análisis de tendencias

---

### RF-12: Reservas Periódicas

- ✅ Recurrencia semanal
- ✅ Recurrencia mensual
- ✅ Fecha de finalización configurable
- ✅ Excepciones en la serie
- ✅ Modificación de series completas
- ✅ Cancelación de series completas

**Documentación**:

- [`docs/RF12_RESERVAS_RECURRENTES.md`](docs/RF12_RESERVAS_RECURRENTES.md)
- [`docs/RF12_MEJORAS_OPTIMIZACIONES.md`](docs/RF12_MEJORAS_OPTIMIZACIONES.md)
- [`docs/RF12_API_ENDPOINTS.md`](docs/RF12_API_ENDPOINTS.md)

---

### RF-13: Modificaciones y Cancelaciones

- ✅ Modificación de fecha/hora
- ✅ Modificación de recurso
- ✅ Cancelación simple
- ✅ Cancelación con penalización (configurable)
- ✅ Notificaciones automáticas
- ✅ Auditoría de cambios

---

### RF-14: Lista de Espera

- ✅ Registro automático en cancelación
- ✅ Notificación prioritaria
- ✅ Orden FIFO
- ✅ Expiración de oportunidades
- ✅ Métricas de conversión

---

### RF-15: Reasignación de Reservas

- ✅ Reasignación manual por coordinador
- ✅ Reasignación automática por conflicto
- ✅ Sugerencias de recursos alternativos
- ✅ Preservación de metadatos

---

### RF-16: Gestión de Conflictos

- ✅ Detección automática de solapamiento
- ✅ Validación antes de crear reserva
- ✅ Bloqueo optimista
- ✅ Resolución manual por coordinador
- ✅ Sugerencias de horarios alternativos

---

### RF-17: Disponibilidad por Perfil

- ✅ Prioridad por rol
- ✅ Cuotas de reserva
- ✅ Restricciones por programa académico
- ✅ Límites de anticipación

---

### RF-18: Compatibilidad con Eventos Institucionales

- ✅ Bloqueo de recursos para eventos
- ✅ Prioridad institucional
- ✅ Sincronización con calendario académico
- ✅ Notificaciones previas a usuarios

---

### RF-19: Interfaz Accesible y Responsive

- ✅ Compatible con lectores de pantalla
- ✅ Navegación por teclado
- ✅ Contraste alto
- ✅ Responsive design (mobile-first)

---

## 🛠️ Stack Tecnológico

- **NestJS**: Framework modular
- **Prisma**: ORM sobre MongoDB
- **MongoDB**: Base de datos NoSQL
- **Event Bus (RabbitMQ)**: Comunicación con otros servicios
- **Redis**: Cache de disponibilidad
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
DATABASE_URL="mongodb://localhost:27017/bookly-availability"

# Event Bus
RABBITMQ_URL="amqp://localhost:5672"
RABBITMQ_EXCHANGE="bookly-events"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Port
PORT=3003
```

---

## 📚 API Documentation

### Swagger

```
http://localhost:3003/api/docs
```

### Endpoints Principales

#### Disponibilidad

- `GET /api/availability/check` - Consultar disponibilidad
- `GET /api/availability/resource/:id` - Disponibilidad de recurso específico
- `POST /api/availability/rules` - Crear regla de disponibilidad
- `PATCH /api/availability/rules/:id` - Actualizar regla

#### Reservas

- `GET /api/reservations` - Listar reservas (con filtros)
- `POST /api/reservations` - Crear reserva
- `GET /api/reservations/:id` - Obtener reserva por ID
- `PATCH /api/reservations/:id` - Modificar reserva
- `DELETE /api/reservations/:id` - Cancelar reserva
- `POST /api/reservations/recurring` - Crear reserva periódica
- `GET /api/reservations/user/:userId` - Reservas por usuario

#### Búsqueda

- `GET /api/search/available` - Búsqueda avanzada de recursos disponibles
- `POST /api/search/advanced` - Búsqueda con filtros múltiples

#### Lista de Espera

- `POST /api/waitlist` - Agregar a lista de espera
- `GET /api/waitlist/resource/:id` - Lista de espera de recurso
- `DELETE /api/waitlist/:id` - Remover de lista de espera

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

- [Documentación General](../../docs/AVAILABILITY_SERVICE.md)
- [Implementación RF-09](docs/RF09_BUSQUEDA_AVANZADA_DISPONIBILIDAD.md)
- [Implementación RF-12](docs/RF12_RESERVAS_RECURRENTES.md)
- [Ejemplos de Uso](docs/RF09_EJEMPLOS_USO.http)

---

**Mantenedores**:

- Bookly Development Team
- UFPS - Universidad Francisco de Paula Santander

**Última actualización**: Noviembre 6, 2025
