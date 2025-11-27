# 🐛 Guía de Configuración de Debug para Bookly Mock

## 📋 Tabla de Contenidos

- [Configuraciones Disponibles](#configuraciones-disponibles)
- [Cómo Usar](#cómo-usar)
- [Puertos de Debug](#puertos-de-debug)
- [Troubleshooting](#troubleshooting)
- [Configuración Manual](#configuración-manual)

---

## 🎯 Configuraciones Disponibles

### Configuraciones Individuales

Cada microservicio tiene su propia configuración de debug independiente:

| Configuración                         | Servicio             | Puerto Debug | Puerto App |
| ------------------------------------- | -------------------- | ------------ | ---------- |
| **Debug API Gateway (Mock)**          | api-gateway          | 9229         | 3000       |
| **Debug Auth Service (Mock)**         | auth-service         | 9230         | 3001       |
| **Debug Resources Service (Mock)**    | resources-service    | 9231         | 3002       |
| **Debug Availability Service (Mock)** | availability-service | 9232         | 3003       |
| **Debug Stockpile Service (Mock)**    | stockpile-service    | 9233         | 3004       |
| **Debug Reports Service (Mock)**      | reports-service      | 9234         | 3005       |

### Configuraciones Compuestas

Ejecuta múltiples servicios simultáneamente:

#### 🚀 Debug All Services (Mock)

Ejecuta **todos los 6 microservicios** en modo debug:

- API Gateway + Auth + Resources + Availability + Stockpile + Reports
- Útil para testing end-to-end completo

#### ⚡ Debug Core Services (Mock)

Ejecuta los **3 servicios esenciales**:

- API Gateway + Auth + Resources
- Ideal para desarrollo básico de recursos y autenticación

#### 🔐 Debug Gateway + Auth (Mock)

Ejecuta los **2 servicios base**:

- API Gateway + Auth
- Perfecto para testing de autenticación y rutas básicas

---

## 🚀 Cómo Usar

### Método 1: Menú de Debug (Recomendado)

1. **Abrir panel de Debug**:
   - `Cmd+Shift+D` (macOS) o `Ctrl+Shift+D` (Windows/Linux)
   - O click en el ícono de Debug en la barra lateral

2. **Seleccionar configuración**:
   - Despliega el menú en la parte superior del panel
   - Elige la configuración deseada

3. **Iniciar debug**:
   - Click en el botón verde ▶️ "Start Debugging"
   - O presiona `F5`

### Método 2: Teclado (Rápido)

1. Presiona `F5` para iniciar la última configuración usada
2. Para cambiar configuración: `Cmd+Shift+D` → seleccionar → `F5`

### Método 3: Command Palette

1. `Cmd+Shift+P` (macOS) o `Ctrl+Shift+P` (Windows/Linux)
2. Escribe: `Debug: Select and Start Debugging`
3. Selecciona la configuración deseada

---

## 🔌 Puertos de Debug

### Puertos Inspector Node.js

Cada microservicio usa un puerto único para el inspector de Node.js:

```
API Gateway:        9229
Auth Service:       9230
Resources Service:  9231
Availability:       9232
Stockpile:          9233
Reports:            9234
```

### Puertos de Aplicación

Los servicios se ejecutan en sus puertos estándar:

```
API Gateway:        3000
Auth Service:       3001
Resources Service:  3002
Availability:       3003
Stockpile:          3004
Reports:            3005
```

---

## 🛠️ Troubleshooting

### ❌ Error: "Cannot connect to runtime process"

**Causa**: El puerto de debug ya está en uso.

**Solución**:

```bash
# Ver procesos usando los puertos
lsof -i :9229-9234

# Matar proceso específico
kill -9 <PID>

# O detener todos los servicios
npm run docker:down
pkill -f "nest start"
```

### ❌ Error: "EADDRINUSE: Port already in use"

**Causa**: El puerto de la aplicación (3000-3005) ya está en uso.

**Solución**:

```bash
# Ver qué usa el puerto
lsof -i :3000

# Detener servicios Node
pkill -f node

# Reiniciar debug
```

### ❌ Breakpoints no funcionan

**Verificar**:

1. ✅ Source maps habilitados en `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       "sourceMap": true
     }
   }
   ```

2. ✅ Archivos compilados en `dist/`:

   ```bash
   npm run build
   ```

3. ✅ Path correcto en `launch.json`:
   ```json
   "outFiles": ["${workspaceFolder}/bookly-mock/dist/**/*.js"]
   ```

### ❌ "Cannot find module '@libs/...'"

**Causa**: Path aliases no resueltos.

**Solución**:

```bash
# Verificar tsconfig.json paths
# Reinstalar dependencias
cd bookly-mock
npm install

# Limpiar y reconstruir
npm run prebuild
npm run build
```

### ⚠️ Servicios no se detienen automáticamente

**Solución Manual**:

```bash
# Detener todos los servicios
pkill -f "nest start"

# O específicamente
pkill -f "api-gateway"
pkill -f "auth-service"
```

---

## ⚙️ Configuración Manual

### Estructura del launch.json

Ubicación: `bookly-mock/.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug <Service> (Mock)",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:<service>:debug"],
      "cwd": "${workspaceFolder}/bookly-mock",
      "console": "integratedTerminal",
      "restart": true,
      "skipFiles": ["<node_internals>/**"],
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/bookly-mock/dist/**/*.js"]
    }
  ]
}
```

### Personalizar Configuración

#### Cambiar puerto de debug:

Modifica el script en `package.json`:

```json
{
  "scripts": {
    "start:auth:debug": "nest start auth-service --debug=9230 --watch"
  }
}
```

#### Agregar variables de entorno:

En `launch.json`, agrega en la configuración:

```json
{
  "env": {
    "NODE_ENV": "development",
    "DEBUG": "bookly:*",
    "LOG_LEVEL": "debug"
  }
}
```

#### Cambiar consola de salida:

```json
{
  "console": "integratedTerminal" // Terminal integrada (recomendado)
  // "console": "internalConsole",  // Consola de debug interna
  // "console": "externalTerminal",  // Terminal externa
}
```

---

## 📚 Recursos Adicionales

### Scripts NPM Relacionados

```bash
# Desarrollo normal (sin debug)
npm run start:gateway
npm run start:auth
npm run start:resources
npm run start:availability
npm run start:stockpile
npm run start:reports

# Modo debug (con inspector)
npm run start:gateway:debug
npm run start:auth:debug
# ... etc

# Todos los servicios simultáneamente
npm run start:all
```

### Documentación VS Code

- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [Node.js Debugging Guide](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [Launch Configurations](https://code.visualstudio.com/docs/editor/debugging#_launch-configurations)

### Documentación NestJS

- [NestJS CLI](https://docs.nestjs.com/cli/overview)
- [NestJS Debugging](https://docs.nestjs.com/recipes/debugging)

---

## 💡 Tips y Mejores Prácticas

### 1️⃣ Usar Configuraciones Compuestas

Para desarrollo full-stack, usa **Debug All Services**:

- Inicia todos los servicios de una vez
- Permite debuggear interacciones entre servicios
- Detiene todo con un solo click (`Shift+F5`)

### 2️⃣ Breakpoints Condicionales

Click derecho en el breakpoint → **Edit Breakpoint**:

```javascript
// Pausa solo si userId es específico
userId === "507f1f77bcf86cd799439011";

// Pausa cada 10 iteraciones
i % 10 === 0;
```

### 3️⃣ Logpoints en lugar de console.log

Click derecho en línea → **Add Logpoint**:

```
Usuario: {user.email}, Rol: {user.role}
```

### 4️⃣ Debug Console

Evalúa expresiones en tiempo real:

```javascript
// Ver objeto completo
JSON.stringify(user, null, 2);

// Ejecutar funciones
await this.userService.findById(userId);
```

### 5️⃣ Watch Expressions

Agrega variables para monitorear continuamente:

- `user.email`
- `this.isAuthenticated`
- `request.headers.authorization`

---

## 🎨 Atajos de Teclado

| Acción            | Atajo (macOS)  | Atajo (Win/Linux) |
| ----------------- | -------------- | ----------------- |
| Iniciar/Continuar | `F5`           | `F5`              |
| Step Over         | `F10`          | `F10`             |
| Step Into         | `F11`          | `F11`             |
| Step Out          | `Shift+F11`    | `Shift+F11`       |
| Detener           | `Shift+F5`     | `Shift+F5`        |
| Reiniciar         | `Cmd+Shift+F5` | `Ctrl+Shift+F5`   |
| Toggle Breakpoint | `F9`           | `F9`              |

---

## ✅ Verificación de Setup

Ejecuta este checklist para verificar que todo funciona:

- [ ] **VS Code abierto** en carpeta raíz del monorepo
- [ ] **Dependencias instaladas**: `cd bookly-mock && npm install`
- [ ] **Build exitoso**: `npm run build`
- [ ] **Docker corriendo**: MongoDB, Redis, RabbitMQ
- [ ] **Variables .env** configuradas en `bookly-mock/.env`
- [ ] **Puertos libres**: 3000-3005 y 9229-9234
- [ ] **Panel de Debug** abierto (`Cmd+Shift+D`)
- [ ] **Configuración seleccionada** en dropdown
- [ ] **Click en ▶️** o presionar `F5`
- [ ] **Terminal muestra** logs del servicio
- [ ] **Breakpoint funciona** (línea se pausa)

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa logs** en la terminal integrada
2. **Verifica puertos** con `lsof -i :9229-9234`
3. **Limpia build**: `npm run prebuild && npm run build`
4. **Reinicia VS Code** completamente
5. **Consulta** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**Última actualización**: 2025-01-19  
**Versión**: 1.0.0  
**Autor**: Bookly Development Team
