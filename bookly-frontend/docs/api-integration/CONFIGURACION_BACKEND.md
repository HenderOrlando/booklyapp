# 🔧 Configuración de Conexión al Backend

Esta guía explica cómo configurar el frontend de Bookly para conectarse con los microservicios del backend.

---

## 📋 Resumen

El frontend de Bookly soporta dos modos de operación:

1. **Mock Mode**: Usa datos simulados (útil para desarrollo de UI sin backend)
2. **Serve Mode**: Conexión real con backend (desarrollo completo y producción)

Y dos estrategias de conexión:

- **API Gateway** (recomendado): Todas las peticiones van a través del gateway
- **Servicios Directos**: Conexión directa a cada microservicio (solo desarrollo)

---

## ⚙️ Configuración Paso a Paso

### 1. Crear archivo `.env.local`

Copia el archivo `.env.example` como `.env.local`:

```bash
cp .env.example .env.local
```

### 2. Configurar variables según tu entorno

#### **Opción A: Usar API Gateway (Recomendado)**

```env
# Modo de datos: usa 'serve' para backend real
NEXT_PUBLIC_DATA_MODE=serve

# API Gateway (todas las peticiones pasan por aquí)
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Conectar a través del API Gateway
NEXT_PUBLIC_USE_DIRECT_SERVICES=false
```

**Ventajas**:

- ✅ Arquitectura correcta para producción
- ✅ Un solo punto de entrada
- ✅ Autenticación centralizada
- ✅ Rate limiting y caching
- ✅ Balanceo de carga

**Cuándo usar**: Producción y staging

---

#### **Opción B: Servicios Directos (Solo Desarrollo)**

```env
# Modo de datos: usa 'serve' para backend real
NEXT_PUBLIC_DATA_MODE=serve

# Conectar directamente a cada microservicio (bypass gateway)
NEXT_PUBLIC_USE_DIRECT_SERVICES=true

# URLs de cada microservicio
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_RESOURCES_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_AVAILABILITY_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_STOCKPILE_SERVICE_URL=http://localhost:3004
NEXT_PUBLIC_REPORTS_SERVICE_URL=http://localhost:3005

# API Gateway (necesario para refresh token)
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
```

**Ventajas**:

- ✅ Debugging más fácil
- ✅ No depende del gateway
- ✅ Logs directos por servicio

**Cuándo usar**: Solo durante desarrollo local de microservicios

---

#### **Opción C: Mock Mode (Sin Backend)**

```env
# Modo de datos: usa 'mock' para datos simulados
NEXT_PUBLIC_DATA_MODE=mock

# El resto de configuración no importa en mock mode
```

**Cuándo usar**: Desarrollo de UI sin backend levantado

---

## 🎯 Mapeo de Endpoints a Servicios

El `httpClient` detecta automáticamente qué servicio usar según el endpoint:

| Endpoint                                       | Servicio             | Puerto |
| ---------------------------------------------- | -------------------- | ------ |
| `/auth/*`                                      | auth-service         | 3001   |
| `/resources/*`, `/categories/*`, `/programs/*` | resources-service    | 3002   |
| `/reservations/*`, `/availabilities/*`         | availability-service | 3003   |
| `/approvals/*`, `/stockpile/*`                 | stockpile-service    | 3004   |
| `/reports/*`, `/dashboard/*`                   | reports-service      | 3005   |

---

## 🚀 Iniciar el Frontend

```bash
cd bookly-frontend

# Instalar dependencias (solo primera vez)
npm install

# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm start
```

El frontend estará disponible en: http://localhost:4200

---

## ✅ Verificar Configuración

### 1. Revisar logs en consola del navegador

Al cargar la página, deberías ver:

```
📋 Configuración de la aplicación:
  🌐 API Gateway: http://localhost:3000
  🔌 WebSocket: ws://localhost:3000
  📦 Modo de datos: SERVE
  🔧 Servicios directos: ACTIVADO (o DESACTIVADO)
```

### 2. Verificar peticiones en Network Tab

**Con API Gateway (`USE_DIRECT_SERVICES=false`)**:

```
GET http://localhost:3000/api/v1/auth/profile
GET http://localhost:3000/api/v1/resources
GET http://localhost:3000/api/v1/categories
```

**Con Servicios Directos (`USE_DIRECT_SERVICES=true`)**:

```
GET http://localhost:3001/api/v1/auth/profile
GET http://localhost:3002/api/v1/resources
GET http://localhost:3002/api/v1/categories
```

---

## 🔍 Troubleshooting

### Error: "Cannot GET /api/v1/auth/profile" (404)

**Causas posibles**:

1. Backend no está levantado
2. API Gateway no está corriendo
3. Puerto incorrecto en .env.local

**Solución**:

```bash
# Verificar si los servicios están corriendo
curl http://localhost:3000/api/v1/health  # API Gateway
curl http://localhost:3001/api/v1/health  # Auth Service
curl http://localhost:3002/api/v1/health  # Resources Service
```

---

### Error: CORS (Cross-Origin)

**Causa**: El backend necesita configurar CORS para permitir `http://localhost:4200`

**Solución**: En cada microservicio, verificar configuración CORS:

```typescript
// main.ts de cada microservicio
app.enableCors({
  origin: [
    "http://localhost:4200", // Frontend local
    "https://bookly.ufps.edu.co", // Producción
  ],
  credentials: true,
});
```

---

### Modo Mock no funciona

**Causa**: `NEXT_PUBLIC_DATA_MODE=mock` pero hay errores de traducción

**Solución**: Verificar que todos los archivos de traducción tengan las claves necesarias:

- `src/i18n/translations/es/resources.json`
- `src/i18n/translations/en/resources.json`

Claves requeridas:

```json
{
  "exists": "...",
  "no_resources": "...",
  "no_resources_desc": "..."
}
```

---

## 📦 Variables de Entorno Completas

```env
# ============================================
# MODO DE DATOS (IMPORTANTE)
# ============================================
NEXT_PUBLIC_DATA_MODE=serve  # 'mock' o 'serve'

# ============================================
# API GATEWAY
# ============================================
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# ============================================
# SERVICIOS DIRECTOS (Opcional)
# ============================================
NEXT_PUBLIC_USE_DIRECT_SERVICES=false
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_RESOURCES_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_AVAILABILITY_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_STOCKPILE_SERVICE_URL=http://localhost:3004
NEXT_PUBLIC_REPORTS_SERVICE_URL=http://localhost:3005

# ============================================
# AUTENTICACIÓN
# ============================================
NEXTAUTH_URL=http://localhost:4200
NEXTAUTH_SECRET=your-secret-key-here

# ============================================
# FEATURE FLAGS
# ============================================
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_ENABLE_SSO=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

---

## 🎓 Ejemplos de Uso

### Cambiar entre Mock y Serve

```bash
# Cambiar a Mock Mode (desarrollo UI)
echo "NEXT_PUBLIC_DATA_MODE=mock" > .env.local

# Cambiar a Serve Mode (backend real)
echo "NEXT_PUBLIC_DATA_MODE=serve" >> .env.local
echo "NEXT_PUBLIC_USE_DIRECT_SERVICES=false" >> .env.local

# Reiniciar servidor Next.js
npm run dev
```

### Probar con Backend Local

```bash
# Terminal 1: Levantar backend con docker-compose
cd bookly-backend/infrastructure
docker-compose up

# Terminal 2: Configurar y levantar frontend
cd bookly-frontend
cat > .env.local << EOF
NEXT_PUBLIC_DATA_MODE=serve
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_USE_DIRECT_SERVICES=false
NEXTAUTH_URL=http://localhost:4200
NEXTAUTH_SECRET=development-secret
EOF

npm run dev
```

---

## ✅ Checklist de Configuración

- [ ] Archivo `.env.local` creado
- [ ] Variables de entorno configuradas
- [ ] Backend corriendo (si usa serve mode)
- [ ] Frontend reiniciado después de cambios en .env
- [ ] Logs en consola del navegador muestran configuración correcta
- [ ] Peticiones HTTP funcionando en Network tab
- [ ] Login exitoso con usuario de prueba

---

## 📚 Referencias

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Bookly Backend Setup](../../bookly-backend/README.md)
- [API Gateway Documentation](../../bookly-backend/src/apps/api-gateway/README.md)
