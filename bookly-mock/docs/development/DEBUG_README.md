# 🐛 Configuraciones de Debug - Bookly Mock

## ✅ Implementación Completa

Se han creado configuraciones de debug para **todos los microservicios** de Bookly Mock en VS Code.

---

## 📁 Archivos Creados

### 1. `.vscode/launch.json` ⚙️

**Ubicación**: `bookly-mock/.vscode/launch.json`

Contiene:

- ✅ 6 configuraciones individuales (una por microservicio)
- ✅ 3 configuraciones compuestas (múltiples servicios)
- ✅ Puertos de debug únicos (9229-9234)
- ✅ Source maps habilitados
- ✅ Auto-restart configurado

### 2. `docs/DEBUG_SETUP.md` 📚

**Ubicación**: `bookly-mock/docs/DEBUG_SETUP.md`

Documentación completa con:

- ✅ Guía paso a paso
- ✅ Tabla de configuraciones y puertos
- ✅ Troubleshooting detallado
- ✅ Tips y mejores prácticas
- ✅ Atajos de teclado
- ✅ Ejemplos de uso

### 3. `docs/DEBUG_QUICK_START.md` ⚡

**Ubicación**: `bookly-mock/docs/DEBUG_QUICK_START.md`

Guía rápida con:

- ✅ Inicio en 3 pasos
- ✅ Tabla de casos de uso
- ✅ Pre-requisitos
- ✅ Atajos esenciales
- ✅ Troubleshooting rápido

### 4. `docs/INDEX.md` actualizado

Se agregó sección **"Debugging y Desarrollo"** con enlaces a las nuevas guías.

---

## 🚀 Cómo Empezar

### Opción 1: Quick Start (Recomendado)

```bash
# 1. Abrir VS Code en bookly-monorepo
# 2. Presionar Cmd+Shift+D (panel de Debug)
# 3. Seleccionar "Debug All Services (Mock)"
# 4. Presionar F5
```

### Opción 2: Servicio Individual

```bash
# 1. Cmd+Shift+D
# 2. Seleccionar "Debug Auth Service (Mock)"
# 3. F5
```

### Opción 3: Servicios Core

```bash
# 1. Cmd+Shift+D
# 2. Seleccionar "Debug Core Services (Mock)"
# 3. F5 → inicia Gateway + Auth + Resources
```

---

## 📊 Configuraciones Disponibles

### Individuales (6)

| Nombre                            | Puerto App | Puerto Debug |
| --------------------------------- | ---------- | ------------ |
| Debug API Gateway (Mock)          | 3000       | 9229         |
| Debug Auth Service (Mock)         | 3001       | 9230         |
| Debug Resources Service (Mock)    | 3002       | 9231         |
| Debug Availability Service (Mock) | 3003       | 9232         |
| Debug Stockpile Service (Mock)    | 3004       | 9233         |
| Debug Reports Service (Mock)      | 3005       | 9234         |

### Compuestas (3)

- **Debug All Services**: Todos los 6 servicios
- **Debug Core Services**: Gateway + Auth + Resources
- **Debug Gateway + Auth**: Gateway + Auth

---

## 🎯 Casos de Uso

| Caso                       | Configuración            |
| -------------------------- | ------------------------ |
| Testing de autenticación   | `Debug Gateway + Auth`   |
| Desarrollo de recursos     | `Debug Core Services`    |
| Testing end-to-end         | `Debug All Services`     |
| Fix en servicio específico | Configuración individual |

---

## ⚠️ Notas Importantes

### Warnings de launch.json

Los warnings que muestra VS Code sobre `protocol` y `port` son **benignos**:

- Son advertencias del schema de VS Code
- **NO afectan la funcionalidad** del debugger
- Los debuggers funcionan correctamente con estas propiedades
- Recomendación: **Ignorar estos warnings**

### Pre-requisitos

Antes de debuggear:

```bash
cd bookly-mock
npm install       # Instalar dependencias
npm run build     # Build inicial
docker-compose up -d  # Servicios base (MongoDB, Redis, RabbitMQ)
```

---

## 📖 Documentación

- **Quick Start**: [docs/DEBUG_QUICK_START.md](docs/DEBUG_QUICK_START.md)
- **Guía Completa**: [docs/DEBUG_SETUP.md](docs/DEBUG_SETUP.md)
- **Índice General**: [docs/INDEX.md](docs/INDEX.md)

---

## 🔧 Troubleshooting Rápido

### Puerto ocupado

```bash
lsof -i :9229-9234
kill -9 <PID>
```

### Servicios no se detienen

```bash
pkill -f "nest start"
```

### Breakpoints no funcionan

```bash
npm run prebuild
npm run build
```

---

## ✨ Features Destacados

- ✅ **Auto-restart**: Los servicios se reinician automáticamente al hacer cambios
- ✅ **Source maps**: Debuggea directamente código TypeScript
- ✅ **Terminal integrada**: Logs visibles durante debug
- ✅ **Stop all**: Detiene todos los servicios con `Shift+F5`
- ✅ **Puertos únicos**: Sin conflictos entre servicios

---

## 🎨 Próximos Pasos

1. **Probar configuración básica**:

   ```
   F5 → "Debug Auth Service (Mock)"
   ```

2. **Agregar breakpoint**:
   - Abrir archivo TypeScript
   - Click izquierdo en número de línea
   - Ejecutar request que pase por esa línea

3. **Explorar Debug Console**:
   - Ver variables
   - Ejecutar código en runtime
   - Inspeccionar objetos

4. **Usar configuraciones compuestas**:
   - Debug múltiples servicios
   - Testing de integración

---

**Estado**: ✅ Completamente funcional  
**Versión**: 1.0.0  
**Fecha**: 2025-01-19
