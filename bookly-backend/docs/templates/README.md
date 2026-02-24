# 📚 Plantillas de Documentación - Bookly

**Versión**: 1.0  
**Fecha**: Noviembre 6, 2025

---

## 🎯 Propósito

Este directorio contiene las **plantillas estándar** para documentar cada microservicio del monorepo Bookly. Todas las plantillas están basadas en las mejores prácticas observadas en el `auth-service`.

---

## 📄 Plantillas Disponibles

### 1. **ARCHITECTURE_TEMPLATE.md**

**Ubicación**: `docs/templates/ARCHITECTURE_TEMPLATE.md`

**Propósito**: Documentar la arquitectura técnica del microservicio

**Secciones**:

- Visión General con diagrama
- Capas de la Arquitectura (Domain, Application, Infrastructure)
- Patrones Implementados (CQRS, Repository, Strategy)
- Event-Driven Architecture
- Comunicación con otros servicios
- Seguridad
- Cache y Performance

**Aplicar a**: `/apps/[service-name]/docs/ARCHITECTURE.md`

---

### 2. **DATABASE_TEMPLATE.md**

**Ubicación**: `docs/templates/DATABASE_TEMPLATE.md`

**Propósito**: Documentar el esquema de base de datos

**Secciones**:

- Esquema de datos con vista general
- Entidades principales con modelos Prisma
- Relaciones entre entidades
- Índices implementados
- Migraciones
- Seeds
- Optimizaciones de queries

**Aplicar a**: `/apps/[service-name]/docs/DATABASE.md`

---

### 3. **ENDPOINTS_TEMPLATE.md**

**Ubicación**: `docs/templates/ENDPOINTS_TEMPLATE.md`

**Propósito**: Documentar todos los endpoints REST del microservicio

**Secciones**:

- Autenticación requerida
- Health checks
- Endpoints por recurso con ejemplos
- Query parameters y body schemas
- Responses con códigos HTTP
- Permisos requeridos
- Webhooks (si aplica)
- Formato de errores estándar

**Aplicar a**: `/apps/[service-name]/docs/ENDPOINTS.md`

---

### 4. **EVENT_BUS_TEMPLATE.md**

**Ubicación**: `docs/templates/EVENT_BUS_TEMPLATE.md`

**Propósito**: Documentar eventos publicados y consumidos

**Secciones**:

- Visión general del Event Bus
- Eventos publicados con payloads TypeScript
- Eventos consumidos y sus handlers
- Configuración de RabbitMQ
- Patrones de implementación
- Manejo de errores
- Debugging y métricas

**Aplicar a**: `/apps/[service-name]/docs/EVENT_BUS.md`

---

### 5. **SEEDS_TEMPLATE.md**

**Ubicación**: `docs/templates/SEEDS_TEMPLATE.md`

**Propósito**: Documentar los datos iniciales (seeds)

**Secciones**:

- Descripción de los seeds
- Comandos de ejecución
- Seeds disponibles con ejemplos de código
- Orden de ejecución
- Seeds por entorno (dev/prod)
- Testing con seeds
- Utilidades (clean, verify)

**Aplicar a**: `/apps/[service-name]/docs/SEEDS.md`

---

### 6. **REQUIREMENT_TEMPLATE.md**

**Ubicación**: `docs/templates/REQUIREMENT_TEMPLATE.md`

**Propósito**: Documentar cada Requerimiento Funcional (RF)

**Secciones**:

- Estado y prioridad
- Descripción del RF
- Criterios de aceptación
- Implementación detallada (Controllers, Services, Commands, Queries)
- Endpoints creados
- Eventos publicados/consumidos
- Esquema de base de datos
- Testing
- Seguridad
- Performance
- Documentación relacionada
- Changelog

**Aplicar a**: `/apps/[service-name]/docs/requirements/RF-XX_NOMBRE.md`

---

## 🚀 Cómo Usar las Plantillas

### Paso 1: Copiar la Plantilla

```bash
# Ejemplo para ARCHITECTURE.md
cp docs/templates/ARCHITECTURE_TEMPLATE.md apps/my-service/docs/ARCHITECTURE.md
```

### Paso 2: Reemplazar Placeholders

Buscar y reemplazar los siguientes placeholders:

- `[Service Name]` → Nombre del servicio (ej: "Resources Service")
- `[Fecha]` → Fecha actual
- `[PORT]` → Puerto del servicio (ej: 3002)
- `[service-name]` → Nombre en kebab-case (ej: resources-service)
- `[Entity1]`, `[Entity2]` → Nombres de entidades reales
- `[resource]` → Nombre del recurso principal
- `[descripción]` → Descripción específica

### Paso 3: Completar Contenido

Rellenar cada sección con la información específica del microservicio, siguiendo los ejemplos de `auth-service`.

### Paso 4: Validar

- ✅ Todos los placeholders reemplazados
- ✅ Diagramas ASCII actualizados
- ✅ Ejemplos de código funcionales
- ✅ Links internos validados
- ✅ Secciones completas

---

## 📋 Checklist por Microservicio

Para verificar que un microservicio tiene toda su documentación:

### Documentos Core

- [ ] `README.md` (general del servicio)
- [ ] `docs/ARCHITECTURE.md` ← usar plantilla
- [ ] `docs/DATABASE.md` ← usar plantilla
- [ ] `docs/ENDPOINTS.md` ← usar plantilla
- [ ] `docs/EVENT_BUS.md` ← usar plantilla (si aplica)
- [ ] `docs/SEEDS.md` ← usar plantilla

### Requirements

- [ ] Un archivo `RF-XX_NOMBRE.md` por cada RF implementado
- [ ] Todos los RFs con formato de `REQUIREMENT_TEMPLATE.md`

### Opcionales

- [ ] `swagger.yml` (OpenAPI 3.0)
- [ ] `asyncapi.yml` (AsyncAPI 2.x)
- [ ] Diagramas en `docs/diagrams/`

---

## 🎨 Convenciones de Estilo

### Emojis en Títulos

- 🎯 Visión General / Propósito
- 📋 Índice / Lista
- 📦 Entidades / Recursos
- 🔄 Event-Driven / Flujos
- 🔐 Seguridad / Auth
- ⚡ Performance / Cache
- 🗄️ Base de Datos
- 🔌 Endpoints / API
- 🌱 Seeds / Datos Iniciales
- 🧪 Testing
- 🚀 Deployment
- 📚 Referencias / Enlaces
- ✅ Completado / Success
- ⚠️ En Progreso / Warning
- ❌ Pendiente / Error

### Formato de Código

```typescript
// Usar TypeScript para ejemplos
interface Example {
  field: string;
}
```

```bash
# Bash para comandos
npm run command
```

```json
{
  "format": "JSON para payloads"
}
```

### Enlaces

- Usar rutas relativas: `[Text](../OTHER.md)`
- Anclas a secciones: `[Text](#section-name)`
- Enlaces externos con URL completa

---

## 📊 Ejemplo de Estructura Completa

```
apps/my-service/
├── README.md
├── swagger.yml
├── asyncapi.yml
├── docs/
│   ├── ARCHITECTURE.md          ← ARCHITECTURE_TEMPLATE
│   ├── DATABASE.md              ← DATABASE_TEMPLATE
│   ├── ENDPOINTS.md             ← ENDPOINTS_TEMPLATE
│   ├── EVENT_BUS.md             ← EVENT_BUS_TEMPLATE
│   ├── SEEDS.md                 ← SEEDS_TEMPLATE
│   │
│   ├── requirements/
│   │   ├── RF-01_FEATURE_1.md  ← REQUIREMENT_TEMPLATE
│   │   ├── RF-02_FEATURE_2.md  ← REQUIREMENT_TEMPLATE
│   │   └── RF-03_FEATURE_3.md  ← REQUIREMENT_TEMPLATE
│   │
│   └── diagrams/
│       ├── architecture.png
│       └── database-schema.png
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                  ← Ver SEEDS_TEMPLATE
│   └── seeds/
│       ├── seed-entity1.ts
│       └── seed-entity2.ts
│
└── src/
```

---

## 🔄 Actualización de Plantillas

Las plantillas se actualizan cuando:

1. Se identifican mejores prácticas en servicios existentes
2. Cambios en la arquitectura general de Bookly
3. Nuevos patrones o tecnologías adoptadas
4. Feedback del equipo de desarrollo

**Responsable**: Bookly Development Team

---

## 📚 Servicios de Referencia

### ⭐ Mejor Ejemplo: auth-service

El `auth-service` tiene la documentación más completa y sirve como referencia:

- `/apps/auth-service/docs/ARCHITECTURE.md`
- `/apps/auth-service/docs/DATABASE.md`
- `/apps/auth-service/docs/ENDPOINTS.md`
- `/apps/auth-service/docs/EVENT_BUS.md`

**Usar como guía al completar las plantillas.**

---

## 🤝 Contribución

Para mejorar las plantillas:

1. Crear PR con cambios propuestos
2. Incluir justificación y ejemplos
3. Actualizar este README si es necesario
4. Validar que cambios sean aplicables a todos los servicios

---

## 📝 Notas Finales

- **Consistencia**: Todas las documentaciones deben seguir el mismo formato
- **Actualización**: Mantener docs sincronizados con código
- **Claridad**: Ejemplos claros y específicos
- **Completitud**: No omitir secciones, marcar como "N/A" si no aplica

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
