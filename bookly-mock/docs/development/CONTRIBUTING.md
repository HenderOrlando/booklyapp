# 🤝 Guía de Contribución - Bookly Monorepo

**Versión**: 1.0  
**Fecha**: Noviembre 6, 2025

---

## 🎯 Bienvenido

Gracias por tu interés en contribuir a Bookly. Esta guía te ayudará a mantener la calidad y consistencia del proyecto.

---

## 📋 Tabla de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Estructura de Documentación](#estructura-de-documentación)
- [Cómo Contribuir](#cómo-contribuir)
- [Estándares de Código](#estándares-de-código)
- [Commits Convencionales](#commits-convencionales)
- [Pull Requests](#pull-requests)
- [Testing](#testing)
- [Documentación](#documentación)

---

## 📂 Estructura del Proyecto

```
bookly-monorepo/
├── apps/              ← Microservicios
│   ├── auth-service/
│   ├── resources-service/
│   ├── availability-service/
│   ├── stockpile-service/
│   ├── api-gateway/
│   └── reports-service/
│
├── libs/              ← Librerías compartidas
│   ├── common/
│   ├── database/
│   ├── event-bus/
│   └── notification/
│
└── docs/              ← Documentación global
    ├── plans/
    ├── results/
    └── PLANTILLA_DOCUMENTACION_MICROSERVICIO.md
```

---

## 📚 Estructura de Documentación

### Para Microservicios (apps/)

**Cada microservicio DEBE tener**:

```
apps/[servicio]/
├── README.md                          ← OBLIGATORIO
├── swagger.yml                        ← Si expone API REST
├── asyncapi.yml                       ← Si usa eventos/WebSocket
│
└── docs/
    ├── ARCHITECTURE.md                ← OBLIGATORIO
    ├── [SERVICIO]_SERVICE.md          ← OBLIGATORIO
    ├── DATABASE.md                    ← OBLIGATORIO
    ├── ENDPOINTS.md                   ← OBLIGATORIO
    ├── EVENT_BUS.md                   ← Si usa Event Bus
    ├── REDIS_CACHE.md                 ← Si usa Redis
    ├── NOTIFICATION.md                ← Si envía notificaciones
    │
    ├── requirements/                  ← OBLIGATORIO
    │   ├── RF-01_NOMBRE.md
    │   ├── RF-02_NOMBRE.md
    │   └── ...
    │
    └── diagrams/                      ← Recomendado
        ├── architecture.png
        ├── database-schema.png
        └── event-flow.png
```

**Plantilla completa**: [`docs/PLANTILLA_DOCUMENTACION_MICROSERVICIO.md`](docs/PLANTILLA_DOCUMENTACION_MICROSERVICIO.md)

---

### Para Librerías (libs/)

**Cada librería DEBE tener**:

```
libs/[libreria]/
├── README.md                          ← Descripción y uso
└── docs/
    ├── API.md                         ← API pública
    ├── EXAMPLES.md                    ← Ejemplos de uso
    └── ARCHITECTURE.md                ← Decisiones técnicas
```

---

### Documentación Global (docs/)

Solo para documentación transversal:

- Planes de auditoría
- Resultados de auditorías
- Estado general del proyecto
- Guías de integración
- Plantillas y estándares

---

## 🚀 Cómo Contribuir

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub

# Clonar tu fork
git clone https://github.com/[tu-usuario]/bookly-monorepo.git
cd bookly-monorepo/bookly-mock

# Agregar upstream
git remote add upstream https://github.com/bookly/bookly-monorepo.git
```

---

### 2. Crear una Rama

```bash
# Actualizar desde upstream
git fetch upstream
git checkout main
git merge upstream/main

# Crear rama de feature
git checkout -b feature/RF-XX-nombre-corto

# O rama de bugfix
git checkout -b fix/descripcion-del-bug
```

**Nomenclatura de ramas**:

- `feature/RF-XX-descripcion` - Nueva funcionalidad
- `fix/descripcion` - Corrección de bug
- `docs/descripcion` - Solo documentación
- `refactor/descripcion` - Refactorización sin cambio funcional
- `test/descripcion` - Agregar o mejorar tests

---

### 3. Hacer Cambios

#### Si creas un nuevo microservicio:

```bash
# Crear estructura
mkdir -p apps/nuevo-servicio/docs/requirements
mkdir -p apps/nuevo-servicio/docs/diagrams

# Copiar plantillas
cp docs/PLANTILLA_DOCUMENTACION_MICROSERVICIO.md \
   apps/nuevo-servicio/docs/REFERENCE.md

# Crear archivos obligatorios
touch apps/nuevo-servicio/README.md
touch apps/nuevo-servicio/docs/ARCHITECTURE.md
touch apps/nuevo-servicio/docs/NUEVO_SERVICIO_SERVICE.md
touch apps/nuevo-servicio/docs/DATABASE.md
touch apps/nuevo-servicio/docs/ENDPOINTS.md
```

#### Si implementas un RF:

1. **Código**: Implementar según arquitectura hexagonal
2. **Tests**: Agregar tests unitarios y E2E
3. **Documentación**: Crear `docs/requirements/RF-XX_NOMBRE.md`
4. **Actualizar README**: Agregar el RF a la sección de características

---

### 4. Testing

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Cobertura
npm run test:cov

# Lint
npm run lint

# Format
npm run format
```

**Cobertura mínima requerida**: 80%

---

### 5. Documentar

#### Actualizar README del Servicio

```markdown
## ✨ Características

### RF-XX: Nombre del Requerimiento

- ✅ Feature 1
- ✅ Feature 2

**Documentación**: [`docs/requirements/RF-XX_NOMBRE.md`](docs/requirements/RF-XX_NOMBRE.md)
```

#### Crear Documento del RF

```bash
# Usar plantilla
cp docs/PLANTILLA_DOCUMENTACION_MICROSERVICIO.md \
   apps/[servicio]/docs/requirements/RF-XX_NOMBRE.md

# Completar con información del RF
```

#### Actualizar ARCHITECTURE.md

Si tu cambio afecta la arquitectura, actualizar diagramas y descripciones.

---

## 💻 Estándares de Código

### TypeScript

- Usar **TypeScript** estricto en todo el código
- Evitar `any`, usar tipos explícitos
- Preferir `interfaces` sobre `types`

### NestJS

- Seguir arquitectura hexagonal
- Usar **CQRS** para operaciones de escritura
- Separar `Commands`, `Queries` y `Handlers`
- Inyección de dependencias con decoradores

### Naming Conventions

#### Archivos

- `kebab-case.ts` para archivos
- `PascalCase` para clases
- `camelCase` para funciones y variables

#### Carpetas

- `kebab-case` para directorios
- Ejemplo: `auth-service`, `create-user`

#### Clases

- `PascalCase` para clases
- Sufijos descriptivos:
  - `XxxController` - Controladores
  - `XxxService` - Servicios
  - `XxxRepository` - Repositorios
  - `XxxCommand` - Comandos CQRS
  - `XxxQuery` - Queries CQRS
  - `XxxHandler` - Manejadores
  - `XxxDto` - Data Transfer Objects

---

## 📝 Commits Convencionales

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos permitidos:

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Solo documentación
- `style`: Formato de código (no afecta lógica)
- `refactor`: Refactorización sin cambio funcional
- `test`: Agregar o mejorar tests
- `chore`: Tareas de mantenimiento
- `perf`: Mejoras de performance
- `ci`: Cambios en CI/CD

### Scope:

Indicar el servicio o componente afectado:

- `auth`
- `resources`
- `availability`
- `stockpile`
- `api-gateway`
- `reports`
- `common`
- `event-bus`
- `docs`

### Ejemplos:

```bash
# Nueva funcionalidad
git commit -m "feat(auth): implementar RF-41 gestión de roles"

# Corrección de bug
git commit -m "fix(availability): corregir conflicto en reservas"

# Documentación
git commit -m "docs(stockpile): agregar diagrama de arquitectura"

# Refactorización
git commit -m "refactor(resources): extraer lógica de validación a service"

# Tests
git commit -m "test(auth): agregar tests E2E para login"
```

---

## 🔀 Pull Requests

### 1. Antes de Crear el PR

```bash
# Asegurar que todo está actualizado
git fetch upstream
git rebase upstream/main

# Verificar que pasan todos los tests
npm run test
npm run test:e2e
npm run lint

# Verificar cobertura
npm run test:cov
```

---

### 2. Título del PR

Usar el mismo formato de commits convencionales:

```
feat(auth): implementar RF-41 gestión de roles y permisos
```

---

### 3. Descripción del PR

Usar la siguiente plantilla:

```markdown
## 📋 Descripción

Breve descripción de los cambios realizados.

## 🎯 Tipo de Cambio

- [ ] Nueva funcionalidad (feat)
- [ ] Corrección de bug (fix)
- [ ] Documentación (docs)
- [ ] Refactorización (refactor)
- [ ] Tests (test)
- [ ] Performance (perf)

## 📦 RFs Implementados

- RF-XX: Nombre del requerimiento

## ✅ Checklist

- [ ] Tests unitarios agregados/actualizados
- [ ] Tests E2E agregados/actualizados
- [ ] Documentación actualizada
- [ ] README actualizado
- [ ] RF documentado en `docs/requirements/`
- [ ] Cobertura >= 80%
- [ ] Lint pasa sin errores
- [ ] Build exitoso

## 📸 Screenshots (si aplica)

[Agregar screenshots de UI/API]

## 🔗 Enlaces Relacionados

- Issue: #XXX
- Documentación: [link]
- RF: [link a docs/requirements/]
```

---

### 4. Revisión del PR

El PR debe ser revisado por al menos **2 miembros del equipo** antes de merge.

**Criterios de aprobación**:

- ✅ Código sigue estándares del proyecto
- ✅ Tests pasan
- ✅ Cobertura >= 80%
- ✅ Documentación actualizada
- ✅ No introduce regresiones
- ✅ Commits siguen conventional commits

---

## 🧪 Testing

### Estructura de Tests

```
apps/[servicio]/
├── src/
│   └── ...
└── test/
    ├── unit/
    │   ├── services/
    │   ├── controllers/
    │   └── repositories/
    ├── integration/
    │   └── ...
    └── e2e/
        └── ...
```

### Tests Unitarios

```typescript
describe("UserService", () => {
  describe("createUser", () => {
    it("should create a user successfully", async () => {
      // Given
      const dto = { email: "test@example.com", password: "123456" };

      // When
      const result = await service.createUser(dto);

      // Then
      expect(result).toBeDefined();
      expect(result.email).toBe(dto.email);
    });
  });
});
```

### Tests E2E

```typescript
describe("Auth (e2e)", () => {
  it("/auth/login (POST)", () => {
    return request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "test@example.com", password: "123456" })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });
});
```

---

## 📚 Documentación

### Reglas de Documentación

1. **Un lugar, un concepto**: Evitar duplicación
2. **Enlaces, no copias**: Referenciar, no duplicar
3. **Actualización continua**: Documentar junto con el código
4. **Ejemplos reales**: Usar datos realistas
5. **Diagramas visuales**: Incluir cuando ayuden

### Archivos a Actualizar

Al implementar una funcionalidad:

1. ✅ **README.md**: Agregar el RF a características
2. ✅ **docs/requirements/RF-XX_NOMBRE.md**: Crear documento del RF
3. ✅ **docs/ENDPOINTS.md**: Documentar nuevos endpoints
4. ✅ **docs/DATABASE.md**: Actualizar si hay cambios en schema
5. ✅ **docs/EVENT_BUS.md**: Documentar eventos nuevos
6. ✅ **docs/ARCHITECTURE.md**: Actualizar si afecta arquitectura
7. ✅ **swagger.yml**: Actualizar OpenAPI spec
8. ✅ **asyncapi.yml**: Actualizar AsyncAPI spec (si aplica)

### Verificar Enlaces

```bash
# Buscar enlaces rotos
grep -r "\[.*\](.*)" apps/[servicio]/docs/

# Verificar que los archivos existen
```

---

## 🎨 Estilo de Documentación

### Markdown

```markdown
# 🎯 Título Principal

## 📋 Sección Principal

### Subsección

#### Sub-subsección

**Negrita** para énfasis
_Cursiva_ para términos técnicos
`código inline` para código
```

### Emojis Estándar

- 🎯 Objetivo/Target
- 📋 Lista/Índice
- ✅ Completado
- ⚠️ Advertencia/En Progreso
- ❌ Error/Pendiente
- 🚀 Deployment/Inicio
- 📦 Paquete/Módulo
- 🔐 Seguridad/Auth
- 📅 Calendario/Fechas
- 🗄️ Base de Datos
- 🔄 Sincronización/Loop
- 🔔 Notificaciones
- 🧪 Testing
- 📊 Métricas/Stats
- 🎨 Estilo/UI
- 🏗️ Arquitectura
- 📝 Documentación
- 🔗 Enlaces
- ⚡ Performance

### Bloques de Código

Siempre especificar el lenguaje:

````markdown
```typescript
const example = "código";
```

```bash
npm install
```

```json
{
  "key": "value"
}
```
````

---

## 🚫 Qué NO Hacer

### ❌ Código

- No usar `any` en TypeScript
- No hacer commits directos a `main`
- No subir archivos `.env` con secrets
- No comentar código "por si acaso" (usar git)
- No hacer PRs gigantes (> 500 líneas)

### ❌ Documentación

- No duplicar información
- No dejar documentación desactualizada
- No omitir documentación de RFs nuevos
- No usar rutas absolutas en enlaces internos
- No dejar TODOs en documentación

### ❌ Testing

- No bajar la cobertura de tests
- No hacer commits sin tests
- No skip tests sin justificación
- No tests que dependan de orden de ejecución

---

## 🆘 Ayuda y Soporte

### Canales de Comunicación

- **Issues**: Para bugs y features
- **Discussions**: Para preguntas generales
- **Slack**: Canal #bookly-dev
- **Email**: dev@bookly.ufps.edu.co

### Recursos

- [Plantilla de Documentación](docs/PLANTILLA_DOCUMENTACION_MICROSERVICIO.md)
- [Estructura de Documentación](ESTRUCTURA_DOCUMENTACION.md)
- [Estado del Proyecto](docs/ESTADO_PROYECTO.md)
- [Plan de Auditoría](docs/PLAN_AUDITORIA_GENERAL.md)

---

## 📜 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la misma licencia del proyecto (MIT).

---

## 🙏 Agradecimientos

Gracias por contribuir a Bookly y ayudar a mejorar la gestión de recursos institucionales en la UFPS.

---

**Mantenedores**:

- Bookly Development Team
- UFPS - Universidad Francisco de Paula Santander

**Última actualización**: Noviembre 6, 2025
