# 📦 Dependencias Requeridas

## Nuevas Dependencias para RF-08 y Resources Integration

### Instalación

```bash
cd /Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-mock/apps/availability-service

# Calendarios OAuth y APIs
npm install googleapis@^126.0.0
npm install @azure/msal-node@^2.6.0

# HTTP Client para Resources Service
npm install @nestjs/axios@^3.0.0
npm install axios@^1.6.0

# Ya instaladas (verificar)
npm list @nestjs/schedule
npm list ioredis
```

### Dependencias Agregadas

| Paquete            | Versión  | Uso                             |
| ------------------ | -------- | ------------------------------- |
| `googleapis`       | ^126.0.0 | Google Calendar API OAuth       |
| `@azure/msal-node` | ^2.6.0   | Microsoft Outlook OAuth         |
| `@nestjs/axios`    | ^3.0.0   | HTTP Client wrapper             |
| `axios`            | ^1.6.0   | HTTP requests (peer dependency) |

### Package.json Update

Agregar al `package.json`:

```json
{
  "dependencies": {
    "googleapis": "^126.0.0",
    "@azure/msal-node": "^2.6.0",
    "@nestjs/axios": "^3.0.0",
    "axios": "^1.6.0"
  }
}
```

### TypeScript Types

Las dependencias incluyen sus propios tipos TypeScript, no se requieren `@types/*` adicionales.

### Verificación

```bash
# Verificar instalación
npm list googleapis @azure/msal-node @nestjs/axios axios

# Compilar para verificar imports
npm run build
```

### Errores Comunes

**Error**: `Cannot find module 'googleapis'`  
**Solución**: `npm install googleapis`

**Error**: `Cannot find module '@azure/msal-node'`  
**Solución**: `npm install @azure/msal-node`

**Error**: `Module not found: @nestjs/axios`  
**Solución**: `npm install @nestjs/axios axios`

---

**Nota**: Estas dependencias son necesarias para que el código compile sin errores TypeScript.
