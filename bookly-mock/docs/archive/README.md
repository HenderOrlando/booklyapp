# 📦 Documentación Archivada - Bookly Mock

Esta carpeta contiene documentación histórica que ya no es activamente relevante pero se mantiene como referencia para entender la evolución del proyecto.

## 📂 Estructura

```text
archive/
├── README.md                           # Este archivo
├── implementation/                     # Planes de implementación completados
├── migrations/                         # Reportes de migraciones completadas
├── refactoring/                        # Documentación de refactorings mayores
├── resumen/                            # Resúmenes de progreso por fase
├── seeds/                              # Planes de integridad referencial completados
├── REORGANIZATION_SUMMARY.md           # Resumen de reorganización dic 2024
├── ERROR_RESOLUTION_REPORT.md          # Resolución de errores históricos
├── FIX_*.md                            # Fixes de debug y errores
├── OAUTH_*.md                          # Migraciones OAuth
├── VERIFICACION_PLANTILLAS_*.md        # Verificaciones de plantillas por servicio
└── ...
```

## 🗂️ Contenido

### Migraciones (migrations/)

Documentos relacionados con migraciones de código, arquitectura o dependencias:

- **AUDITORIA_MIGRACION_FINAL.md** - Auditoría final de migración
- **MIGRACION_AUDIT_COMPLETADA.md** - Migración de auditoría completada
- **MIGRACION_SERVICIOS_RESTANTES.md** - Migración de servicios restantes
- **PLAN_MIGRACION_AUDIT_DECORATORS.md** - Plan de migración de decoradores de auditoría
- **FASE2_AUDIT_COMPLETED.md** - Fase 2 de auditoría completada
- **FASE3_OAUTH_COMPLETED.md** - Fase 3 de OAuth completada
- **OPCIONES_2_Y_3_COMPLETADAS.md** - Opciones implementadas
- **CALENDAR_EXPORT_IMPLEMENTADO.md** - Exportación de calendario
- **COMMONJS_CONFIGURADO.md** - Configuración CommonJS
- **PROJECT_STATUS_FINAL.md** - Estado final del proyecto
- **DOCUMENTACION_REFACTOR_INDEX.md** - Refactor de índice de documentación

### Refactorings (refactoring/)

Documentos de refactorings mayores del código:

- **REFACTOR_FINAL_COMPLETO.md** - Refactor final completo
- **REFACTOR_COMPLETADO.md** - Refactor completado
- **REFACTOR_EVENT_DRIVEN.md** - Refactor a event-driven
- **CHANGELOG_REFACTOR_EVENT_DRIVEN.md** - Changelog del refactor
- **PLAN_REFACTOR_FINAL.md** - Plan de refactor final
- **LIMPIEZA_SERVICIOS_COMENTADOS.md** - Limpieza de código comentado

### Resúmenes (resumen/)

Documentación de progreso por fase del proyecto:

- **00-INDICE-GENERAL.md** - Índice general
- **00-RESUMEN_FASE2_FINAL.md** - Resumen de fase 2
- **01-ARQUITECTURA-GENERAL.md** - Arquitectura general
- **02-ESTANDARES-RESPUESTA-API.md** - Estándares de respuesta
- **03-EVENTOS-Y-MENSAJERIA.md** - Eventos y mensajería
- **04-REQUERIMIENTOS-FUNCIONALES.md** - Requerimientos funcionales
- **05-TESTING-Y-CALIDAD.md** - Testing y calidad
- **06-DOCUMENTACION-Y-SWAGGER.md** - Documentación y Swagger
- **PROGRESO\_\*.md** - Documentos de progreso por tarea

### Fixes y Reportes

Documentos de resolución de errores y problemas:

- **ERROR_RESOLUTION_REPORT.md** - Reporte de resolución de errores
- **FIXES_MICROSERVICES_DEBUG.md** - Fixes de debugging
- **FIX_DLQ_MONGODB_AUTH.md** - Fix de Dead Letter Queue y MongoDB
- **FIX_TYPESCRIPT_MONOREPO_IMPORTS.md** - Fix de imports TypeScript
- **REAL_FIXES_APPLIED.md** - Registro de fixes reales aplicados
- **RESUMEN_FIX_DLQ_MONGODB.md** - Resumen de fix DLQ

### Verificaciones

Reportes de verificación de plantillas por microservicio:

- **VERIFICACION_PLANTILLAS_API_GATEWAY.md**
- **VERIFICACION_PLANTILLAS_AUTH_SERVICE.md**
- **VERIFICACION_PLANTILLAS_AVAILABILITY_SERVICE.md**
- **VERIFICACION_PLANTILLAS_RESOURCES_SERVICE.md**
- **VERIFICACION_PLANTILLAS_STOCKPILE_SERVICE.md**
- **VERIFICACION_PLANTILLAS_REPORTS_SERVICE.md**

### OAuth y Migraciones Específicas

Documentos relacionados con OAuth y migraciones específicas:

- **OAUTH_MIGRATION_GUIDE.md** - Guía de migración OAuth
- **OAUTH_MIGRATION_COMPLETE.md** - Migración OAuth completa
- **OAUTH_COMPILATION_REPORT.md** - Reporte de compilación
- **OAUTH_CLEANUP_REPORT.md** - Limpieza OAuth
- **MIGRATION_GUIDE_RESPONSE_STANDARD.md** - Migración de estándar de respuesta
- **MIGRATION_COMPLETED_SUMMARY.md** - Resumen de migraciones

### Otros

- **LIMPIEZA_MARKDOWN_NOV6.md** - Limpieza de documentación markdown (Nov 2024)
- **RUNTIME_PATH_ALIASES.md** - Configuración de aliases en runtime

## 🔍 ¿Cuándo consultar esta documentación?

Esta documentación archivada es útil cuando:

1. **Entender decisiones pasadas**: Por qué se tomaron ciertas decisiones arquitectónicas
2. **Revisar historial de cambios**: Qué problemas se resolvieron y cómo
3. **Aprender de migraciones**: Proceso seguido en migraciones anteriores
4. **Contexto histórico**: Evolución del proyecto a lo largo del tiempo
5. **Troubleshooting**: Problemas similares que ya fueron resueltos

## ⚠️ Nota Importante

La información en estos documentos puede estar **desactualizada**. Para información actual del proyecto, consulta:

- **[../INDEX.md](../INDEX.md)** - Índice maestro de documentación
- **[../../README.md](../../README.md)** - README principal del proyecto
- **Documentación por microservicio** - En `apps/{service}/docs/`

---

**Última limpieza**: Febrero 2026  
**Razón**: Reorganización de documentación para mejor navegabilidad
