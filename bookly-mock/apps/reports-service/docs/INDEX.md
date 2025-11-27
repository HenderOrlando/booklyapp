# Reports Service - Índice de Documentación

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Requerimientos Funcionales](#requerimientos-funcionales)
- [Guías de Testing](#guías-de-testing)
- [Base de Datos](#base-de-datos)
- [Plan de Implementación](#plan-de-implementación)

---

## 🏗️ Arquitectura

### [ARCHITECTURE.md](./ARCHITECTURE.md)

**Descripción**: Arquitectura del servicio de reportes y análisis  
**Contenido**:

- Clean Architecture + CQRS
- Generación de reportes
- Dashboards interactivos
- Sistema de feedback y evaluaciones

---

## 📋 Requerimientos Funcionales

### [requirements/RF-31_REPORTES_USO.md](./requirements/RF-31_REPORTES_USO.md)

**RF-31**: Reporte de uso por recurso/programa/período

- Reportes de utilización
- Métricas de uso
- Análisis temporal

### [requirements/RF-32_REPORTES_USUARIO.md](./requirements/RF-32_REPORTES_USUARIO.md)

**RF-32**: Reporte por usuario/profesor

- Historial de reservas por usuario
- Estadísticas de uso
- Patrones de comportamiento

### [requirements/RF-33_EXPORTACION_CSV.md](./requirements/RF-33_EXPORTACION_CSV.md)

**RF-33**: Exportación en CSV

- Exportación de reportes
- Formatos múltiples (CSV, Excel, PDF)
- Filtros y personalización

### [requirements/RF-34_FEEDBACK.md](./requirements/RF-34_FEEDBACK.md)

**RF-34**: Registro de feedback de usuarios

- Sistema de comentarios
- Calificaciones
- Sugerencias

### [requirements/RF-35_EVALUACION_USUARIOS.md](./requirements/RF-35_EVALUACION_USUARIOS.md)

**RF-35**: Evaluación de usuarios por el staff

- Calificación de comportamiento
- Penalizaciones
- Historial de evaluaciones

### [requirements/RF-36_DASHBOARDS.md](./requirements/RF-36_DASHBOARDS.md)

**RF-36**: Dashboards interactivos

- Visualización en tiempo real
- Gráficos y métricas
- Filtros dinámicos

### [requirements/RF-37_DEMANDA_INSATISFECHA.md](./requirements/RF-37_DEMANDA_INSATISFECHA.md)

**RF-37**: Reporte de demanda insatisfecha

- Análisis de lista de espera
- Recursos más demandados
- Recomendaciones de expansión

---

## 🧪 Guías de Testing

### [RF-33_EXPORT_TESTING_GUIDE.md](./RF-33_EXPORT_TESTING_GUIDE.md)

**Descripción**: Guía de testing para exportación  
**Contenido**:

- Tests de exportación CSV
- Validación de formatos
- Tests de performance

### [RF-34_FEEDBACK_TESTING_GUIDE.md](./RF-34_FEEDBACK_TESTING_GUIDE.md)

**Descripción**: Guía de testing para feedback  
**Contenido**:

- Tests de registro de feedback
- Validación de calificaciones
- Tests de consultas

### [RF-35_EVALUATION_TESTING_GUIDE.md](./RF-35_EVALUATION_TESTING_GUIDE.md)

**Descripción**: Guía de testing para evaluaciones  
**Contenido**:

- Tests de evaluación de usuarios
- Sistema de penalizaciones
- Validaciones de negocio

---

## 📊 Plan de Implementación

### [REPORTS_SERVICE_IMPLEMENTATION_PLAN.md](./REPORTS_SERVICE_IMPLEMENTATION_PLAN.md)

**Descripción**: Plan general de implementación  
**Contenido**:

- Fases de desarrollo
- Priorización de features
- Timeline y milestones

---

## 🗄️ Base de Datos

### [DATABASE.md](./DATABASE.md)

**Descripción**: Esquema de base de datos  
**Contenido**:

- Modelos Prisma
- Relaciones entre entidades
- Índices y optimizaciones
- Agregaciones y queries complejas

---

## 🌱 Semillas

### [SEEDS.md](./SEEDS.md)

**Descripción**: Datos iniciales del sistema  
**Contenido**:

- Reportes de ejemplo
- Feedback de prueba
- Configuraciones de dashboard

---

## 🔄 Event Bus

### [EVENT_BUS.md](./EVENT_BUS.md)

**Descripción**: Eventos publicados y consumidos  
**Contenido**:

- Eventos de reportes generados
- Eventos de feedback
- Eventos de evaluaciones
- Sincronización con otros servicios

---

## 🔗 Endpoints

### [ENDPOINTS.md](./ENDPOINTS.md)

**Descripción**: API REST completa  
**Contenido**:

- Generación de reportes
- Exportación de datos
- Gestión de feedback
- Evaluaciones de usuarios
- Dashboards y métricas

---

## 📚 Recursos Adicionales

- **Swagger UI**: `http://localhost:3005/api/docs`
- **Health Check**: `http://localhost:3005/api/v1/health`
- **Puerto**: 3005

---

## 🔧 Mantenimiento

Para actualizar esta documentación:

1. Editar archivos correspondientes
2. Actualizar este índice al agregar documentos
3. Mantener estructura consistente
4. Verificar enlaces funcionando

---

**Última actualización**: Noviembre 2024  
**Microservicio**: reports-service  
**Puerto**: 3005  
**Mantenido por**: Equipo Bookly
