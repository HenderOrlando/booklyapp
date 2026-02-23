# Dominio de Disponibilidad y Reservas

## Análisis para Tesis de Grado — availability-service

---

## 1. Contexto del Dominio

El módulo de disponibilidad (`availability-service`) es el corazón operativo de Bookly. Gestiona todo el ciclo de vida de las reservas: consulta de disponibilidad en tiempo real, creación de reservas individuales y recurrentes, conflictos, listas de espera, reasignaciones automáticas y visualización en calendario.

**Puerto**: 3003
**Responsabilidades**: Reservas, disponibilidad, calendarios, listas de espera, reservas recurrentes, reasignaciones, conflictos, historial de uso.

---

## 2. Requerimientos Funcionales Implementados

| RF | Nombre | Estado | Descripción |
|----|--------|--------|-------------|
| RF-07 | Configurar disponibilidad | ✅ | Horarios por recurso, excepciones, bloqueos temporales |
| RF-08 | Integración con calendarios | ✅ | Formato iCal, sincronización con calendarios externos |
| RF-09 | Búsqueda avanzada | ✅ | Multi-filtro: tipo, capacidad, ubicación, fecha, disponibilidad |
| RF-10 | Visualización en calendario | ✅ | Vista diaria, semanal y mensual con estados por color |
| RF-11 | Historial de uso | ✅ | Registro completo de reservas pasadas por recurso y usuario |
| RF-12 | Reservas periódicas | ✅ | Recurrencias diarias, semanales, mensuales con series |
| RF-13 | Modificación y cancelación | ✅ | Edición con verificación de conflictos, cancelación con notificación |
| RF-14 | Lista de espera | ✅ | Encolamiento automático cuando recurso no disponible |
| RF-15 | Reasignación automática | ✅ | Propuesta de alternativas, reasignación con aprobación |
| RF-16 | Gestión de conflictos | ✅ | Detección automática y resolución de solapamientos |
| RF-17 | Disponibilidad por perfil | ✅ | Reglas diferenciadas por rol (docente, estudiante, admin) |
| RF-18 | Compatibilidad con eventos institucionales | ✅ | Bloqueo de fechas institucionales, priorización |
| RF-19 | Interfaz accesible y responsive | ✅ | Cumplimiento a11y, diseño adaptativo |

## 3. Historias de Usuario Cubiertas

- **HU-09**: Configurar horarios disponibles
- **HU-10**: Integración con calendarios
- **HU-11**: Visualización en formato calendario
- **HU-12**: Registro del historial de uso
- **HU-13**: Reservas periódicas
- **HU-14**: Lista de espera
- **HU-15**: Reasignación de reservas
- **HU-16**: Búsqueda avanzada

## 4. Casos de Uso

- **CU-011**: Consultar disponibilidad
- **CU-012**: Realizar reserva
- **CU-013**: Cancelar reserva
- **CU-014**: Modificar reserva
- **CU-015**: Agregar recursos a una reserva

---

## 5. Arquitectura Técnica

### 5.1 Motor de Reservas

El servicio implementa un motor de reservas con las siguientes capacidades:

1. **Detección de conflictos en tiempo real**: Verifica solapamientos temporales antes de confirmar cualquier reserva
2. **Resolución de conflictos**: Propone alternativas automáticas (horarios, recursos similares)
3. **Reservas recurrentes con series**: Genera N instancias respetando reglas de recurrencia (diaria, semanal, mensual)
4. **Lista de espera inteligente**: Cuando un recurso se libera, promueve automáticamente al siguiente en cola

### 5.2 Flujo de Reserva

```
Usuario solicita reserva
  → Verificar disponibilidad (cache + BD)
  → Detectar conflictos
  → Si conflicto: ofrecer alternativas o encolar en waitlist
  → Si disponible: crear reserva + publicar evento
  → Notificar al usuario
  → Actualizar cache de disponibilidad
```

### 5.3 Cache y Performance

- **TTL**: 5 min para reservas, consulta de disponibilidad
- **Hit rate objetivo**: 70-80%
- **Impacto medido**: -50% queries a MongoDB
- **Métricas**: CacheMetricsService con Prometheus

### 5.4 API Endpoints

| Grupo | Endpoints |
|-------|-----------|
| **Reservations** | `GET/POST /reservations`, `PATCH /reservations/:id`, `DELETE /reservations/:id` |
| **Availability** | `GET /availability/resource/:id`, `GET /availability/search` |
| **Recurring** | `POST /reservations/recurring`, `GET /reservations/recurring/:id` |
| **Conflicts** | `GET /reservations/conflicts`, `POST /reservations/conflicts/resolve` |
| **Waitlist** | `POST /waitlist`, `GET /waitlist`, `DELETE /waitlist/:id` |
| **Reassignment** | `POST /reassignment/request`, `POST /reassignment/:id/approve` |

### 5.5 Eventos Asincrónicos

20 canales documentados — el servicio con mayor volumen de eventos:

- `reservation.created`, `reservation.updated`, `reservation.cancelled`, `reservation.completed`
- `reservation.conflict.detected`, `reservation.conflict.resolved`
- `recurring.series.created`, `recurring.instance.created`
- `waitlist.added`, `waitlist.promoted`, `waitlist.expired`
- `reassignment.requested`, `reassignment.approved`, `reassignment.rejected`
- `availability.checked`, `availability.changed`
- `calendar.synced`, `calendar.exported`
- `slot.blocked`, `slot.unblocked`
- `usage.recorded`

### 5.6 Estados de Reserva

```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
                   ↘ CANCELLED
                   ↘ REJECTED
```

Cada transición de estado genera un evento de dominio que alimenta notificaciones, reportes y auditoría.

---

## 6. Requerimientos No Funcionales

| RNF | Requisito | Implementación |
|-----|-----------|---------------|
| RNF-04 | Disponibilidad en tiempo real | Cache Redis + WebSocket para actualizaciones |
| RNF-05 | Validación automática de conflictos | Algoritmo de detección de solapamientos en dominio |
| RNF-06 | Optimización de consultas concurrentes | Índices compuestos + cache + read-through pattern |

---

## 7. KPIs Operativos del Dominio

| KPI | Fuente | Umbral de Alerta |
|-----|--------|-----------------|
| Reservations created per day | Event Store | Informacional |
| Reservation conflict rate | availability-service | > 15% |
| Waiting list conversion rate | availability-service | Informacional |
| Average reservation lead time | BD | Informacional |

---

## 8. Aspectos Destacables para Tesis

### 8.1 Innovación Técnica

- **Motor de conflictos en tiempo real**: Algoritmo que evalúa solapamientos temporales considerando reglas de disponibilidad, mantenimientos activos, bloqueos institucionales y reservas recurrentes simultáneamente.
- **Lista de espera con promoción automática**: Cuando una reserva se cancela, el sistema automáticamente verifica la cola de espera y promueve al siguiente solicitante, publicando eventos para notificación inmediata.
- **Reservas recurrentes con gestión de series**: No solo crea N instancias, sino que las vincula como serie, permitiendo modificar/cancelar toda la serie o instancias individuales.
- **Reasignación inteligente**: Cuando un recurso entra en mantenimiento, el sistema propone automáticamente recursos alternativos con características similares.

### 8.2 Contribución Académica

- **Modelado de dominio complejo**: Demostración de cómo un Bounded Context puede manejar múltiples subdominios (reservas, conflictos, recurrencias, listas de espera) manteniendo la cohesión.
- **Event-Driven Architecture aplicada**: Con 20 canales de eventos, es el ejemplo más rico de cómo EDA permite desacoplar funcionalidades complejas.
- **Algoritmo de disponibilidad**: Combina datos estáticos (reglas de disponibilidad) con datos dinámicos (reservas existentes) y externos (eventos institucionales) para calcular disponibilidad en O(n log n).

### 8.3 Impacto Institucional

- **Eliminación de conflictos de reserva**: Problema endémico en universidades resuelto de forma automatizada.
- **Equidad en acceso**: Las listas de espera y reasignaciones garantizan acceso justo a recursos demandados.
- **Visibilidad de ocupación**: Dashboard en tiempo real de la utilización de recursos, dato antes inexistente para la toma de decisiones.
- **Reservas recurrentes para docentes**: Profesores pueden reservar salas para todo el semestre con una sola acción.

---

## 9. Skills y Rules Aplicadas

- **Skills**: `backend`, `arquitectura-escalabilidad-resiliencia`, `ingenieria-de-producto`
- **Rules**: `bookly-availability-rf07-configurar-disponibilidad`, `bookly-availability-rf12-reservas-periodicas`, `bookly-availability-rf14-lista-de-espera`, `bookly-availability-rf15-reasignacion`

---

**Dominio**: Disponibilidad y Reservas
**Servicio**: availability-service (Puerto 3003)
**Swagger**: 11 controllers documentados
**AsyncAPI**: 20 canales de eventos (mayor volumen del sistema)
