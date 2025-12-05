# 🚀 Guía para ejecutar servicios en Bookly Mock

## 📋 Scripts disponibles

### Servicios individuales

#### API Gateway (puerto 3000)

```bash
npm run start:gateway         # Modo watch
npm run start:gateway:debug   # Modo debug
```

#### Auth Service (puerto 3001)

```bash
npm run start:auth            # Modo watch
npm run start:auth:debug      # Modo debug
```

#### Resources Service (puerto 3002)

```bash
npm run start:resources       # Modo watch
npm run start:resources:debug # Modo debug
```

#### Availability Service (puerto 3003)

```bash
npm run start:availability       # Modo watch
npm run start:availability:debug # Modo debug
```

#### Stockpile Service (puerto 3004)

```bash
npm run start:stockpile       # Modo watch
npm run start:stockpile:debug # Modo debug
```

#### Reports Service (puerto 3005)

```bash
npm run start:reports         # Modo watch
npm run start:reports:debug   # Modo debug
```

### Ejecutar todos los servicios simultáneamente

```bash
npm run start:all
```

### Build

```bash
npm run build              # Build del proyecto por defecto (api-gateway)
npm run build:all          # Build de todos los microservicios
```

## 🔧 Comandos básicos

### 1. Asegúrate de tener Docker corriendo

```bash
npm run docker:up
```

### 2. Espera a que los contenedores estén listos

Verifica con:

```bash
docker ps
```

### 3. Ejecuta el servicio que necesites

Por ejemplo, para iniciar el API Gateway en modo debug:

```bash
npm run start:gateway:debug
```

## 📝 Notas importantes

1. **Modo Debug**: Usa el puerto `9229` para el debugger de Node.js
2. **Modo Watch**: Recarga automáticamente cuando detecta cambios en los archivos
3. **Limpiar build**: Si hay problemas, ejecuta `npm run prebuild` para limpiar `dist/`
4. **Cache**: Si ves errores de código desactualizado, limpia `dist/` y `node_modules/.cache`

## 🐛 Troubleshooting

### Error: "Cannot find module 'dist/main'"

**Solución**: Especifica el servicio a ejecutar

```bash
# ❌ Incorrecto
npm run start:debug

# ✅ Correcto
npm run start:gateway:debug
```

### Error: Redis connection loop

**Solución**: Limpia el dist y reinicia

```bash
rm -rf dist/apps/api-gateway dist/libs/redis
npm run start:gateway:debug
```

### Error: Port already in use

**Solución**: Encuentra y mata el proceso

```bash
lsof -ti:3000 | xargs kill -9  # Para el puerto 3000
lsof -ti:3001 | xargs kill -9  # Para el puerto 3001
# etc...
```

## 🔗 Endpoints importantes

- **API Gateway**: <http://localhost:3000>
  - Swagger: <http://localhost:3000/api/docs>
  - Health: <http://localhost:3000/health>

- **Auth Service**: <http://localhost:3001>
  - Swagger: <http://localhost:3001/api/docs>
  - Health: <http://localhost:3001/api/v1/health>

- **Resources Service**: <http://localhost:3002>
  - Swagger: <http://localhost:3002/api/docs>
  - Health: <http://localhost:3002/api/v1/health>

- **Availability Service**: <http://localhost:3003>
  - Swagger: <http://localhost:3003/api/docs>
  - Health: <http://localhost:3003/api/v1/health>

- **Stockpile Service**: <http://localhost:3004>
  - Swagger: <http://localhost:3004/api/docs>
  - Health: <http://localhost:3004/api/v1/health>

- **Reports Service**: <http://localhost:3005>
  - Swagger: <http://localhost:3005/api/docs>
  - Health: <http://localhost:3005/api/v1/health>
