# Dominio de Reportes y Análisis

## Análisis para Tesis de Grado — reports-service

---

## 1. Contexto del Dominio

El módulo de reportes (`reports-service`) transforma los datos operacionales del sistema en información accionable para la toma de decisiones institucionales. Provee dashboards interactivos, reportes de uso y demanda, auditoría centralizada, sistema de feedback, evaluaciones de usuarios y exportación de datos.

**Puerto**: 3005
**Responsabilidades**: Dashboards en tiempo real, reportes de uso por recurso/programa/período, reportes por usuario, exportación CSV/PDF, sistema de feedback, evaluaciones de usuarios, auditoría centralizada de eventos, análisis de demanda insatisfecha.

---

## 2. Requerimientos Funcionales Implementados

| RF | Nombre | Estado | Descripción |
|----|--------|--------|-------------|
| RF-31 | Reportes de uso | ✅ | Por recurso, programa académico y período temporal |
| RF-32 | Reportes por usuario/profesor | ✅ | Historial de reservas y patrones de uso individual |
| RF-33 | Exportación CSV | ✅ | Descarga de datos en formato tabular para análisis externo |
| RF-34 | Sistema de feedback | ✅ | Registro de retroalimentación post-uso del recurso |
| RF-35 | Evaluación de usuarios | ✅ | Calificación del comportamiento de usuarios por staff |
| RF-36 | Dashboards interactivos | ✅ | Visualización en tiempo real con múltiples vistas |
| RF-37 | Demanda insatisfecha | ✅ | Análisis de solicitudes rechazadas y listas de espera |
| RF-38 | Conflictos de reserva | ✅ | Reporte de frecuencia y resolución de conflictos |
| RF-39 | Cumplimiento de reserva | ✅ | Tasa de check-in vs. reservas aprobadas |

## 3. Historias de Usuario Cubiertas

- **HU-26**: Reportes de uso
- **HU-27**: Reportes por usuario/profesor
- **HU-28**: Exportación CSV
- **HU-29**: Registro de feedback
- **HU-30**: Evaluación de usuarios
- **HU-31**: Dashboards en tiempo real
- **HU-32**: Reporte de demanda insatisfecha

## 4. Casos de Uso

- **CU-021**: Generar reporte de uso
- **CU-022**: Generar reporte por usuario
- **CU-023**: Exportar CSV
- **CU-024**: Visualizar dashboard
- **CU-025**: Analizar demanda insatisfecha

---

## 5. Arquitectura Técnica

### 5.1 Arquitectura de Reportes

El servicio consume eventos de dominio de todos los demás microservicios para construir sus propias proyecciones de datos optimizadas para consultas analíticas:

```text
auth-service ──────┐
resources-service ──┤
availability-service┤──→ RabbitMQ ──→ reports-service ──→ MongoDB (read models)
stockpile-service ──┘                                         │
                                                              ├→ Dashboards
                                                              ├→ Reports
                                                              ├→ Exports
                                                              └→ Audit Trail
```

### 5.2 Dashboard Overview

Endpoint principal: `GET /api/v1/dashboard/overview`

Métricas agregadas:

- **Ocupación general**: Porcentaje de recursos en uso vs. disponibles
- **Reservas del día**: Total, confirmadas, en progreso, completadas
- **Tendencias**: Comparación con período anterior
- **Top recursos**: Los más demandados/utilizados
- **Actividad reciente**: Timeline de eventos del sistema

### 5.3 Tipos de Reportes

| Tipo | Endpoint | Dimensiones |
|------|----------|-------------|
| **Uso por recurso** | `POST /usage-reports/generate` | Recurso, período, programa |
| **Uso por usuario** | `POST /user-reports/generate` | Usuario, período, tipo de recurso |
| **Demanda** | `POST /demand-reports/generate` | Recurso, período, rechazos, waitlist |
| **Ocupación** | `GET /dashboard/occupancy` | Recurso, hora, día de la semana |
| **Conflictos** | `GET /reports/conflicts` | Recurso, frecuencia, resolución |
| **Cumplimiento** | `GET /reports/compliance` | Check-in rate, puntualidad |

### 5.4 Auditoría Centralizada

El servicio actúa como consumidor centralizado de eventos de auditoría:

- **Almacenamiento**: Colección `audit_events` en MongoDB con índices optimizados
- **Campos estándar**: `who` (actor), `what` (acción), `where` (recurso/tenant), `when` (timestamp), `outcome` (resultado)
- **Consulta**: Búsqueda por actor, recurso, acción, período, resultado
- **Exportación**: `POST /audit/export` para descarga de registros de auditoría

### 5.5 API Endpoints

| Grupo | Endpoints |
|-------|-----------|
| **Usage Reports** | `GET/POST /usage-reports`, `POST /usage-reports/generate` |
| **Demand Reports** | `GET/POST /demand-reports`, `POST /demand-reports/generate` |
| **User Reports** | `GET/POST /user-reports`, `POST /user-reports/generate` |
| **Dashboard** | `GET /dashboard/overview`, `GET /dashboard/occupancy`, `GET /dashboard/demand` |
| **Audit** | `GET /audit`, `GET /audit/:id`, `POST /audit/export` |
| **Exports** | `POST /reports/export`, `GET /reports/export/:id/download` |
| **Feedback** | `GET/POST /feedback` |
| **Evaluations** | `GET/POST /evaluations` |

### 5.6 Eventos Asincrónicos

21 canales documentados — el mayor número de canales consumidos:

- `report.generated`, `report.exported`, `report.failed`
- `export.started`, `export.completed`, `export.downloaded`
- `audit.recorded`, `audit.exported`, `audit.purged`
- `dashboard.refreshed`, `dashboard.occupancy.updated`
- `feedback.created`, `feedback.updated`
- `evaluation.created`, `evaluation.updated`
- `demand.analyzed`, `demand.report.generated`
- `usage.aggregated`, `usage.report.generated`
- `compliance.calculated`, `compliance.alert`

---

## 6. Requerimientos No Funcionales

| RNF | Requisito | Implementación |
|-----|-----------|---------------|
| RNF-10 | Exportación en múltiples formatos | CSV nativo, PDF vía generación de documentos |
| RNF-11 | Visualización en tiempo real | WebSocket + dashboard con refresh automático |
| RNF-12 | Accesibilidad por rol | Reportes filtrados según permisos del usuario |

---

## 7. KPIs Operativos del Dominio

| KPI | Fuente | Umbral de Alerta |
|-----|--------|-----------------|
| Report generation latency (p95) | OTel HTTP span | > 5s |
| Audit events processed per minute | reports-service | < 1/min (stale) |

---

## 8. Aspectos Destacables para Tesis

### 8.1 Innovación Técnica

- **Read models optimizados por eventos**: El servicio construye sus propias proyecciones de datos consumiendo eventos de todos los demás servicios, aplicando el patrón CQRS de forma que los reportes no impactan la performance de las operaciones transaccionales.
- **Exportación asíncrona**: Para datasets grandes, la exportación se procesa como job asíncrono con notificación cuando el archivo está listo para descarga.
- **Análisis de demanda insatisfecha**: Combina datos de rechazos, listas de espera y conflictos para identificar recursos subdimensionados, un dato clave para decisiones de inversión institucional.
- **Auditoría inmutable**: El trail de auditoría actúa como log append-only, proporcionando evidencia no repudiable de todas las acciones del sistema.

### 8.2 Contribución Académica

- **Business Intelligence aplicada a gestión universitaria**: Transforma datos operacionales en insights accionables que antes requerían procesos manuales de recopilación.
- **Patrón de Event Sourcing para reportes**: Demostración práctica de cómo los eventos de dominio alimentan read models especializados sin acoplar los servicios.
- **Métricas de cumplimiento**: Primera vez que la universidad puede medir objetivamente la tasa de uso efectivo de sus recursos (check-in vs. reservas).

### 8.3 Impacto Institucional

- **Toma de decisiones basada en datos**: Los directivos pueden ver en tiempo real la ocupación, demanda y tendencias de uso de la infraestructura universitaria.
- **Justificación de inversiones**: El reporte de demanda insatisfecha provee evidencia cuantitativa para solicitar presupuesto de nuevos espacios o equipos.
- **Rendición de cuentas**: La auditoría centralizada facilita procesos de acreditación y evaluación institucional.
- **Feedback loop**: El sistema de feedback cierra el ciclo de mejora continua, permitiendo a los usuarios reportar problemas y sugerencias.

---

## 9. Skills y Rules Aplicadas

- **Skills**: `data-reporting`, `backend`, `web-app`, `ingenieria-de-producto`
- **Rules**: `bookly-reports-rf31-reportes-uso`, `bookly-reports-rf36-dashboards`, `bookly-reports-rf37-demanda-insatisfecha`

---

**Dominio**: Reportes y Análisis
**Servicio**: reports-service (Puerto 3005)
**Swagger**: 11 controllers documentados
**AsyncAPI**: 21 canales de eventos (mayor número del sistema)
