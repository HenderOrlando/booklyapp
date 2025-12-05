# 🔄 Guía de Migración - Reorganización de Documentación y Scripts

**Fecha de Reorganización**: Diciembre 2024  
**Versión**: 1.0

---

## 📌 ¿Qué cambió?

Se reorganizó completamente la estructura de documentación y scripts de bookly-mock para mejorar la navegabilidad y eliminar redundancias.

---

## 🗂️ Cambios de Ubicación

### Scripts Movidos

Todos los scripts fueron consolidados en `scripts/`:

| ❌ Ubicación Antigua | ✅ Nueva Ubicación |
|---------------------|-------------------|
| `/fix-imports.js` | `/scripts/fix-imports-syntax.js` |
| `/fix-imports.sh` | `/scripts/fix-imports-paths.sh` |
| `/fix-imports.ts` | `/scripts/fix-imports.ts` |
| `/fix-tsconfig-rootdir.sh` | `/scripts/fix-tsconfig-rootdir.sh` |
| `/start-all-prod.sh` | `/scripts/start-all-prod.sh` |
| `/start-all-services.sh` | `/scripts/start-all-services.sh` |
| `/test-pattern.js` | `/scripts/test-pattern.js` |

**Acción requerida**: Actualizar cualquier script o comando que referencie las ubicaciones antiguas.

---

### Documentación Movida

#### Documentos de Raíz → docs/

| ❌ Ubicación Antigua | ✅ Nueva Ubicación |
|---------------------|-------------------|
| `/DEBUG_README.md` | `/docs/development/DEBUG_README.md` |
| `/README_IDEMPOTENCY.md` | `/docs/implementation/IDEMPOTENCY_README.md` |
| `/RUNNING_SERVICES.md` | `/docs/development/RUNNING_SERVICES.md` |
| `/CONTRIBUTING.md` | `/docs/development/CONTRIBUTING.md` |

#### Reorganización por Categorías

La carpeta `docs/` ahora está organizada en subcarpetas:

```
docs/
├── development/       # Debugging, ejecución, contribución
├── architecture/      # Configuración, diseño, estado
├── api/              # Estándares de API y Swagger
├── implementation/   # Guías de implementación
├── testing/          # Testing y auditoría
└── archive/          # Documentación histórica
    ├── migrations/   # Migraciones completadas
    ├── refactoring/  # Refactorings históricos
    └── resumen/      # Resúmenes de progreso
```

**Acción requerida**: Actualizar enlaces y bookmarks a documentos.

---

### Documentación Archivada

La carpeta `/resumen` fue movida a `/docs/archive/resumen/` junto con ~77 archivos históricos.

**Acción requerida**: Si tienes enlaces a resúmenes de progreso, actualízalos a `docs/archive/resumen/`.

---

## 🔧 Nuevos Scripts npm

Se agregaron comandos npm para facilitar el uso de scripts:

```bash
# Scripts de corrección
npm run script:fix-imports-syntax   # Corrige sintaxis de imports
npm run script:fix-imports-paths    # Corrige paths @libs/*
npm run script:fix-imports          # Refactoriza imports a alias
npm run script:fix-tsconfig         # Fix tsconfig rootDir

# Scripts de inicio
npm run script:start-all            # Inicia todos los servicios
npm run script:start-prod           # Inicia en modo producción

# Scripts de testing
npm run script:test-websocket       # Testing de WebSocket
npm run script:test-eventbus        # Testing de Event Bus
npm run script:test-event-replay    # Testing de Event Replay
npm run script:test-pagination      # Verificar paginación

# Scripts de utilidad
npm run script:seed-events          # Poblar Event Store
npm run script:verify-dlq           # Verificar DLQ
npm run script:verify-eventbus      # Verificar Event Bus
npm run script:start-brokers        # Iniciar brokers
```

**Acción requerida**: Reemplazar llamadas directas a scripts por comandos npm.

---

## 📖 Cómo Encontrar Documentación Ahora

### 1. Por Categoría

- **Desarrollo y debugging** → `docs/development/`
- **Arquitectura y diseño** → `docs/architecture/`
- **APIs y estándares** → `docs/api/`
- **Implementación de features** → `docs/implementation/`
- **Testing y QA** → `docs/testing/`
- **Históricos** → `docs/archive/`

### 2. Índices Principales

- **[README.md](../../README.md)** - Punto de entrada principal
- **[docs/INDEX.md](../INDEX.md)** - Índice maestro completo
- **[scripts/README.md](../../scripts/README.md)** - Documentación de scripts

### 3. Por Microservicio

Cada microservicio mantiene su propia documentación:

- `apps/api-gateway/docs/INDEX.md`
- `apps/auth-service/docs/INDEX.md`
- `apps/resources-service/docs/INDEX.md`
- `apps/availability-service/docs/INDEX.md`
- `apps/stockpile-service/docs/INDEX.md`
- `apps/reports-service/docs/INDEX.md`

---

## ✅ Checklist de Migración

Para desarrolladores activos en el proyecto:

- [ ] Actualizar bookmarks de navegador a nuevas rutas
- [ ] Actualizar scripts personales que referencien ubicaciones antiguas
- [ ] Revisar aliases de terminal/shell que usen rutas viejas
- [ ] Actualizar documentación interna del equipo
- [ ] Actualizar referencias en herramientas CI/CD
- [ ] Usar nuevos comandos npm para scripts

---

## 🔍 Buscar Documentos Específicos

### Antes (rutas antiguas)

```bash
# Ejemplo: buscar doc de idempotencia
README_IDEMPOTENCY.md  # ❌ Ya no existe en raíz
```

### Ahora (rutas nuevas)

```bash
# Usar el índice maestro
cat docs/INDEX.md

# O buscar por categoría
cat docs/implementation/IDEMPOTENCY_README.md  # ✅

# O grep en toda la documentación
grep -r "idempotencia" docs/
```

---

## 💡 Tips de Navegación

### VS Code

```json
// Agregar a .vscode/settings.json
{
  "files.associations": {
    "**/docs/**/*.md": "markdown"
  },
  "search.exclude": {
    "**/docs/archive/**": true  // Excluir históricos de búsquedas
  }
}
```

### Terminal

```bash
# Alias útiles para .bashrc o .zshrc
alias bdocs='cd /path/to/bookly-mock/docs'
alias bscripts='cd /path/to/bookly-mock/scripts'
alias bindex='cat /path/to/bookly-mock/docs/INDEX.md'
```

---

## 🆘 Problemas Comunes

### No encuentro un documento

1. Buscar en el índice maestro: `docs/INDEX.md`
2. Si es histórico, revisar: `docs/archive/README.md`
3. Buscar por nombre: `find docs/ -name "*NOMBRE*"`
4. Grep por contenido: `grep -r "texto" docs/`

### Script no funciona

1. Verificar nueva ubicación en `scripts/`
2. Usar comando npm: `npm run script:*`
3. Verificar permisos: `chmod +x scripts/*.sh`
4. Ver documentación: `cat scripts/README.md`

### Enlace roto en documento

1. Reportar en issue tracker
2. Buscar documento actualizado en `docs/INDEX.md`
3. Verificar si fue archivado en `docs/archive/`

---

## 📞 Soporte

- **Documentación completa**: [REORGANIZATION_SUMMARY.md](../../REORGANIZATION_SUMMARY.md)
- **Índice maestro**: [docs/INDEX.md](../INDEX.md)
- **Scripts**: [scripts/README.md](../../scripts/README.md)

---

**Última actualización**: Diciembre 2024  
**Versión de reorganización**: 1.0  
**Mantenido por**: Equipo Bookly
