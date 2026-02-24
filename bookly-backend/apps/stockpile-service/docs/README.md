# 📚 Documentación - Stockpile Service

Bienvenido a la documentación del **Stockpile Service**, el microservicio de Bookly responsable de flujos de aprobación, validaciones y check-in/out.

---

## 🚀 Inicio Rápido

### Para Nuevos Desarrolladores

1. **[STOCKPILE_DOCUMENTATION_INDEX.md](STOCKPILE_DOCUMENTATION_INDEX.md)** - Índice maestro completo
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura del sistema
3. **[ENDPOINTS.md](ENDPOINTS.md)** - 44 endpoints API documentados

### Para Integradores

1. **[NOTIFICATION_PROVIDERS.md](NOTIFICATION_PROVIDERS.md)** - Sistema multi-proveedor de notificaciones
2. **[EVENT_BUS.md](EVENT_BUS.md)** - Event-Driven Architecture
3. **[ENDPOINTS.md](ENDPOINTS.md)** - API REST completa

### Para DevOps

1. **[REDIS_CACHE_SETUP.md](REDIS_CACHE_SETUP.md)** - Configuración de cache distribuido
2. **[DATABASE.md](DATABASE.md)** - Esquemas MongoDB y índices
3. **[SEEDS.md](SEEDS.md)** - Datos de prueba

---

## 📂 Estructura de Documentación

```text
docs/
├── README.md                               # 👈 Estás aquí
├── STOCKPILE_DOCUMENTATION_INDEX.md        # Índice maestro completo
│
├── 📘 Documentación Técnica Principal
│   ├── ARCHITECTURE.md                     # Arquitectura hexagonal + CQRS + EDA
│   ├── DATABASE.md                         # Schemas MongoDB
│   ├── ENDPOINTS.md                        # 44 endpoints REST
│   ├── EVENT_BUS.md                        # Event-Driven Architecture
│   ├── NOTIFICATION_PROVIDERS.md           # Sistema de notificaciones
│   ├── REDIS_CACHE_SETUP.md               # Configuración de cache
│   ├── SEEDS.md                           # Datos de prueba
│   ├── APPROVAL_REQUEST_METADATA.md        # Estructura de metadatos
│   └── STOCKPILE_SERVICE.md               # Overview del servicio
│
├── 📑 Requerimientos Funcionales (9 RFs)
│   └── requirements/
│       ├── RF-20_VALIDAR_SOLICITUDES.md    # Validación de solicitudes
│       ├── RF-21_GENERAR_DOCUMENTOS.md     # Generación de PDFs
│       ├── RF-22_NOTIFICACIONES_AUTOMATICAS.md
│       ├── RF-23_PANTALLA_VIGILANCIA.md    # Dashboard de vigilancia
│       ├── RF-24_FLUJOS_DIFERENCIADOS.md   # Flujos configurables
│       ├── RF-25_TRAZABILIDAD.md           # Auditoría completa
│       ├── RF-26_CHECK_IN_OUT.md           # Check-in/out digital
│       ├── RF-27_MENSAJERIA.md             # Integración multi-canal
│       └── RF-28_NOTIFICACIONES_CAMBIOS.md # Notificaciones EDA
│
├── 🚀 Reportes de Implementación
│   ├── STOCKPILE_ADVANCED_FEATURES_COMPLETE.md
│   └── (Más reportes históricos en archive/)
│
└── 📦 Archivados (históricos)
    └── archive/
        ├── IMPLEMENTACION_STOCKPILE_COMPLETADA.md
        ├── IMPLEMENTATION_SUMMARY.md
        ├── NOTIFICATION_PROVIDERS_ARCHITECTURE.md
        ├── RF23_*.md (5 documentos)
        ├── STOCKPILE_FINAL_REPORT.md
        └── STOCKPILE_SERVICE_INTEGRATION_COMPLETE.md
```

---

## 📋 Documentos por Categoría

### 🏗️ Arquitectura y Diseño

| Documento                          | Descripción                     | Audiencia               |
| ---------------------------------- | ------------------------------- | ----------------------- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Clean Architecture + CQRS + EDA | Arquitectos, Tech Leads |
| [EVENT_BUS.md](EVENT_BUS.md)       | Event-Driven Architecture       | Backend Developers      |
| [DATABASE.md](DATABASE.md)         | Schemas MongoDB + índices       | Backend, DevOps         |

### 🔌 API y Endpoints

| Documento                    | Descripción                    | Audiencia             |
| ---------------------------- | ------------------------------ | --------------------- |
| [ENDPOINTS.md](ENDPOINTS.md) | 44 endpoints REST documentados | Frontend, Backend, QA |
| Swagger UI                   | Documentación interactiva      | Todos                 |

**Swagger**: `http://localhost:3004/api/docs`

### 📬 Notificaciones y Mensajería

| Documento                                                                       | Descripción                                        | Audiencia          |
| ------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------ |
| [NOTIFICATION_PROVIDERS.md](NOTIFICATION_PROVIDERS.md)                          | 10 proveedores: Email, SMS, WhatsApp, Push, In-App | Integradores       |
| [RF-27_MENSAJERIA.md](requirements/RF-27_MENSAJERIA.md)                         | RF-27: Integración detallada                       | Backend Developers |
| [RF-28_NOTIFICACIONES_CAMBIOS.md](requirements/RF-28_NOTIFICACIONES_CAMBIOS.md) | RF-28: Notificaciones automáticas EDA              | Backend Developers |

### ✅ Aprobaciones y Flujos

| Documento                                                                   | Descripción                      | Audiencia           |
| --------------------------------------------------------------------------- | -------------------------------- | ------------------- |
| [RF-20_VALIDAR_SOLICITUDES.md](requirements/RF-20_VALIDAR_SOLICITUDES.md)   | RF-20: Validación de solicitudes | Backend, QA         |
| [RF-24_FLUJOS_DIFERENCIADOS.md](requirements/RF-24_FLUJOS_DIFERENCIADOS.md) | RF-24: Flujos configurables      | Backend, Product    |
| [RF-25_TRAZABILIDAD.md](requirements/RF-25_TRAZABILIDAD.md)                 | RF-25: Auditoría completa        | Backend, Compliance |
| [APPROVAL_REQUEST_METADATA.md](APPROVAL_REQUEST_METADATA.md)                | Estructura de metadatos          | Backend Developers  |

### 📍 Check-In/Out y Geolocalización

| Documento                                                                 | Descripción                        | Audiencia           |
| ------------------------------------------------------------------------- | ---------------------------------- | ------------------- |
| [RF-26_CHECK_IN_OUT.md](requirements/RF-26_CHECK_IN_OUT.md)               | RF-26: Check-in/out digital con QR | Backend, Frontend   |
| [RF-23_PANTALLA_VIGILANCIA.md](requirements/RF-23_PANTALLA_VIGILANCIA.md) | RF-23: Dashboard de vigilancia     | Frontend, Seguridad |

### 🛠️ Infraestructura

| Documento                                    | Descripción            | Audiencia       |
| -------------------------------------------- | ---------------------- | --------------- |
| [REDIS_CACHE_SETUP.md](REDIS_CACHE_SETUP.md) | Configuración de Redis | DevOps, Backend |
| [SEEDS.md](SEEDS.md)                         | Datos de prueba        | QA, Backend     |

---

## 🎯 Rutas de Aprendizaje

### 👨‍💻 Desarrollador Backend

1. [STOCKPILE_DOCUMENTATION_INDEX.md](STOCKPILE_DOCUMENTATION_INDEX.md)
2. [ARCHITECTURE.md](ARCHITECTURE.md)
3. [DATABASE.md](DATABASE.md)
4. [EVENT_BUS.md](EVENT_BUS.md)
5. [RF-20](requirements/RF-20_VALIDAR_SOLICITUDES.md) a [RF-28](requirements/RF-28_NOTIFICACIONES_CAMBIOS.md)

### 🎨 Desarrollador Frontend

1. [ENDPOINTS.md](ENDPOINTS.md)
2. Swagger UI: `http://localhost:3004/api/docs`
3. [RF-23_PANTALLA_VIGILANCIA.md](requirements/RF-23_PANTALLA_VIGILANCIA.md)
4. [RF-26_CHECK_IN_OUT.md](requirements/RF-26_CHECK_IN_OUT.md)

### 🔗 Integrador de API

1. [ENDPOINTS.md](ENDPOINTS.md)
2. [NOTIFICATION_PROVIDERS.md](NOTIFICATION_PROVIDERS.md)
3. [EVENT_BUS.md](EVENT_BUS.md)
4. Swagger UI para testing

### 🚀 DevOps / SRE

1. [REDIS_CACHE_SETUP.md](REDIS_CACHE_SETUP.md)
2. [DATABASE.md](DATABASE.md) (índices)
3. [ARCHITECTURE.md](ARCHITECTURE.md) (infraestructura)
4. Health checks: `/api/v1/health`

### 📊 Product Manager / QA

1. [STOCKPILE_DOCUMENTATION_INDEX.md](STOCKPILE_DOCUMENTATION_INDEX.md)
2. Todos los [RF-20 a RF-28](requirements/)
3. [STOCKPILE_ADVANCED_FEATURES_COMPLETE.md](STOCKPILE_ADVANCED_FEATURES_COMPLETE.md)

---

## 📊 Estado de Implementación

| Componente                     | Estado  | Documentación        |
| ------------------------------ | ------- | -------------------- |
| **Flujos de Aprobación**       | ✅ 100% | RF-20, RF-24         |
| **Check-In/Out Digital**       | ✅ 100% | RF-26                |
| **Notificaciones Multi-Canal** | ✅ 100% | RF-27, RF-28         |
| **Trazabilidad y Auditoría**   | ✅ 100% | RF-25                |
| **Dashboard Vigilancia**       | ✅ 100% | RF-23                |
| **Generación de PDFs**         | ✅ 100% | RF-21                |
| **Event-Driven Architecture**  | ✅ 100% | EVENT_BUS.md         |
| **Redis Cache Distribuido**    | ✅ 100% | REDIS_CACHE_SETUP.md |

**Estado General**: ✅ **Production Ready**

---

## 🔗 Enlaces Rápidos

- **Swagger UI**: `http://localhost:3004/api/docs`
- **AsyncAPI**: `geolocation-dashboard.asyncapi.yaml`
- **Health Check**: `http://localhost:3004/api/v1/health`
- **Metrics**: `http://localhost:3004/api/v1/metrics/cache`
- **Repositorio**: [bookly-monorepo/bookly-backend](../../)

---

## 📝 Convenciones de Documentación

- **Estado**: ✅ Completado | 🚧 En Progreso | ❌ Pendiente
- **Idioma**: Español (equipo UFPS)
- **Formato**: Markdown con Prettier
- **Actualización**: Junto con cambios de código (Pull Requests)
- **Versionado**: Changelog en cada documento

---

## 🆘 Soporte

- **Issues**: GitHub Issues
- **Equipo**: Bookly Development Team
- **Institución**: UFPS - Universidad Francisco de Paula Santander

---

**Última actualización**: Noviembre 12, 2025  
**Mantenido por**: Bookly Development Team
