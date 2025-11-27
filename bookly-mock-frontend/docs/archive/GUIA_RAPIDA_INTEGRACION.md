# 🚀 Guía Rápida de Integración Backend

## ⚡ Inicio Rápido (5 minutos)

### 1. Verificar Backend Activo

```bash
# Desde bookly-mock-frontend/
./scripts/verify-backend-connectivity.sh
```

**Salida esperada**: ✓ Todos los servicios están operativos

### 2. Configurar Variables de Entorno

```bash
# Copiar ejemplo y editar
cp .env.local.example .env.local
```

**Cambios necesarios en `.env.local`**:

```env
# Cambiar modo de MOCK a SERVE
NEXT_PUBLIC_DATA_MODE=serve

# URL del API Gateway (ya configurada)
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
```

### 3. Instalar Dependencias (si es necesario)

```bash
npm install
```

### 4. Iniciar Frontend

```bash
npm run dev
```

**Frontend disponible en**: http://localhost:4200

---

## 🎯 Primer Test: Login con Usuario de Semillas

### Usuarios de Prueba Disponibles

| Email                        | Password | Rol                          |
| ---------------------------- | -------- | ---------------------------- |
| `admin@ufps.edu.co`          | `123456` | Administrador General        |
| `admin.sistemas@ufps.edu.co` | `123456` | Admin de Programa (Sistemas) |
| `docente@ufps.edu.co`        | `123456` | Docente                      |
| `estudiante@ufps.edu.co`     | `123456` | Estudiante                   |
| `vigilante@ufps.edu.co`      | `123456` | Vigilante                    |

### Probar Login

1. Ir a http://localhost:4200/auth/login
2. Usar credenciales: `admin@ufps.edu.co` / `123456`
3. Verificar redirección al dashboard

---

## 🔍 Debugging

### Ver Logs de HTTP Client

El cliente HTTP en modo desarrollo muestra logs automáticos:

```javascript
// En la consola del navegador verás:
[2025-11-23T12:00:00.000Z] POST /api/v1/auth/login
[Timing] POST:/api/v1/auth/login → 234ms
[2025-11-23T12:00:00.234Z] POST /api/v1/auth/login → ✓ SUCCESS
```

### Network Tab

1. Abrir DevTools (F12)
2. Ir a pestaña "Network"
3. Filtrar por "XHR"
4. Ver todas las peticiones al API Gateway

### Redux DevTools

Instalar extensión de Redux DevTools para ver el estado global:

- Estado de autenticación
- Tokens JWT
- Datos de usuario

---

## 📝 Checklist de Verificación

### Pre-requisitos

- [ ] Backend levantado (API Gateway + 5 microservicios)
- [ ] MongoDB con semillas ejecutadas
- [ ] Redis funcionando
- [ ] RabbitMQ activo

### Configuración

- [ ] `.env.local` creado y configurado
- [ ] `NEXT_PUBLIC_DATA_MODE=serve`
- [ ] `NEXT_PUBLIC_API_GATEWAY_URL` apunta a localhost:3000

### Testing Básico

- [ ] Script de verificación pasa: `./scripts/verify-backend-connectivity.sh`
- [ ] Login exitoso con usuario de semillas
- [ ] Token JWT se guarda en sesión
- [ ] Peticiones incluyen header `Authorization: Bearer <token>`
- [ ] Logout funciona y limpia sesión

### Por Módulo

- [ ] **Auth**: Login, perfil, logout funcionan
- [ ] **Resources**: Listar recursos muestra datos reales
- [ ] **Availability**: Calendario carga reservas
- [ ] **Stockpile**: Notificaciones se muestran
- [ ] **Reports**: Dashboard muestra métricas

---

## 🐛 Problemas Comunes

### Error: "No se pudo conectar con el servidor"

**Causa**: Backend no está levantado o API Gateway no responde

**Solución**:

```bash
# Verificar backend
./scripts/verify-backend-connectivity.sh

# Si falla, iniciar backend
cd ../bookly-mock
npm run dev:all
```

### Error: "CORS policy"

**Causa**: API Gateway no tiene CORS configurado para localhost:4200

**Solución**: Verificar configuración CORS en `bookly-mock/apps/api-gateway/main.ts`

### Error: "401 Unauthorized" en todas las peticiones

**Causa**: Token JWT no se está enviando o es inválido

**Solución**:

1. Verificar que el login fue exitoso
2. Ver en DevTools → Application → Local Storage
3. Debe existir `next-auth.session-token`
4. Si no existe, hacer logout y login de nuevo

### Error: "404 Not Found" en endpoints

**Causa**: Endpoints no tienen el prefijo `/api/v1`

**Solución**: Usar las constantes de `endpoints.ts`:

```typescript
import { AUTH_ENDPOINTS } from "@/infrastructure/api/endpoints";

// ✅ Correcto
httpClient.post(AUTH_ENDPOINTS.LOGIN, data);

// ❌ Incorrecto
httpClient.post("/auth/login", data);
```

### Frontend muestra datos MOCK en lugar de SERVE

**Causa**: Variable de entorno no está configurada

**Solución**:

1. Verificar `.env.local`: `NEXT_PUBLIC_DATA_MODE=serve`
2. Reiniciar el servidor de desarrollo: `npm run dev`
3. Verificar en consola: debe decir "🌐 HTTP Client inicializado en modo: SERVE"

---

## 🎨 Modo Híbrido (Opcional)

Si quieres probar módulos individuales:

```env
# Solo Auth en modo SERVE, resto en MOCK
NEXT_PUBLIC_AUTH_MODE=serve
NEXT_PUBLIC_RESOURCES_MODE=mock
NEXT_PUBLIC_AVAILABILITY_MODE=mock
NEXT_PUBLIC_STOCKPILE_MODE=mock
NEXT_PUBLIC_REPORTS_MODE=mock
```

**Nota**: Requiere modificación en `httpClient.ts` para soportar modos por módulo.

---

## 📚 Próximos Pasos

Una vez que el login funcione:

1. **Integrar Resources**
   - Ver `docs/PLAN_INTEGRACION_BACKEND.md` → Fase 3
   - Actualizar `resources-client.ts`
   - Probar CRUD de recursos

2. **Integrar Availability**
   - Ver `docs/PLAN_INTEGRACION_BACKEND.md` → Fase 4
   - Actualizar `reservations-client.ts`
   - Probar creación de reservas

3. **Continuar con otros módulos**
   - Seguir orden del plan de integración
   - Ir módulo por módulo

---

## 🔗 Enlaces Útiles

- [Plan Completo de Integración](./PLAN_INTEGRACION_BACKEND.md)
- [Documentación API Gateway](../../bookly-mock/docs/API_GATEWAY.md)
- [Estándares de Response](../../bookly-mock/docs/API_RESPONSE_STANDARD.md)
- [Testing Status](./TESTING_STATUS.md)

---

## 💡 Tips

1. **Usa las constantes de endpoints**: Siempre importa de `endpoints.ts`
2. **Revisa la consola**: Los interceptors muestran logs útiles
3. **Network Tab es tu amigo**: Revisa payloads y responses
4. **Redux DevTools**: Monitorea el estado global
5. **Script de verificación**: Ejecútalo antes de iniciar el frontend

---

**Última actualización**: 2025-11-23
**Versión**: 1.0.0
