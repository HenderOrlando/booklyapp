# 🚀 Quick Start - Debug Bookly Mock

## Inicio Rápido (3 pasos)

### 1. Abrir Panel de Debug

```
Cmd+Shift+D (macOS)
Ctrl+Shift+D (Windows/Linux)
```

### 2. Seleccionar Configuración

Despliega el menú superior y elige:

**Para un solo servicio:**

- `Debug API Gateway (Mock)` - Puerto 3000
- `Debug Auth Service (Mock)` - Puerto 3001
- `Debug Resources Service (Mock)` - Puerto 3002
- `Debug Availability Service (Mock)` - Puerto 3003
- `Debug Stockpile Service (Mock)` - Puerto 3004
- `Debug Reports Service (Mock)` - Puerto 3005

**Para múltiples servicios:**

- `Debug All Services (Mock)` - Todos los servicios
- `Debug Core Services (Mock)` - Gateway + Auth + Resources
- `Debug Gateway + Auth (Mock)` - Solo Gateway y Auth

### 3. Iniciar Debug

```
Presiona F5
O click en ▶️ (Start Debugging)
```

---

## 🎯 Configuraciones por Caso de Uso

| Caso de Uso                | Configuración Recomendada     |
| -------------------------- | ----------------------------- |
| Testing de autenticación   | `Debug Gateway + Auth (Mock)` |
| Desarrollo de recursos     | `Debug Core Services (Mock)`  |
| Testing end-to-end         | `Debug All Services (Mock)`   |
| Fix en servicio específico | Configuración individual      |
| Debugging de integración   | `Debug All Services (Mock)`   |

---

## 📋 Pre-requisitos

Antes de debuggear, asegúrate de tener:

```bash
# 1. Dependencias instaladas
cd bookly-mock
npm install

# 2. Build completado
npm run build

# 3. Docker servicios corriendo
docker-compose up -d

# 4. Variables de entorno
cp .env.example .env
```

---

## ⚡ Atajos Esenciales

| Acción            | Atajo      |
| ----------------- | ---------- |
| Iniciar/Continuar | `F5`       |
| Detener           | `Shift+F5` |
| Step Over         | `F10`      |
| Step Into         | `F11`      |
| Toggle Breakpoint | `F9`       |

---

## 🆘 Troubleshooting Rápido

### Puerto ocupado

```bash
# Matar proceso en puerto específico
lsof -i :3000
kill -9 <PID>
```

### Servicios no se detienen

```bash
pkill -f "nest start"
```

### Breakpoints no funcionan

```bash
# Reconstruir proyecto
npm run prebuild
npm run build
```

---

## 📚 Documentación Completa

Para información detallada, consulta: [DEBUG_SETUP.md](./DEBUG_SETUP.md)

---

**Tip**: Usa `Debug Core Services` para desarrollo diario - inicia los 3 servicios esenciales sin sobrecargar tu sistema.
