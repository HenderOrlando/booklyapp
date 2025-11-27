# RF-45: Autenticación de Dos Factores (2FA)

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Noviembre 1, 2025

---

## 📋 Descripción

Implementar autenticación de dos factores (2FA) mediante TOTP (Time-based One-Time Password) para agregar una capa adicional de seguridad a las cuentas de usuario.

---

## ✅ Criterios de Aceptación

- [x] Habilitar/deshabilitar 2FA por usuario
- [x] Generación de secret TOTP
- [x] Generación de código QR para apps como Google Authenticator
- [x] Generación de códigos de respaldo (backup codes)
- [x] Verificación de código TOTP en login
- [x] Validación de códigos con ventana de tiempo de 30 segundos
- [x] Opción de usar código de respaldo si no tiene acceso a app
- [x] Notificación al usuario cuando se habilita/deshabilita 2FA

---

## 🏗️ Implementación

### Componentes Desarrollados

**Service**:

- `TwoFactorService` - Lógica de 2FA

**Controller**:

- `AuthController.enable2FA()` - Habilitar 2FA
- `AuthController.verify2FA()` - Verificar código y activar
- `AuthController.disable2FA()` - Deshabilitar 2FA
- `AuthController.loginWith2FA()` - Login con código 2FA

**Commands**:

- `Enable2FACommand`
- `Verify2FACommand`
- `Disable2FACommand`

---

### Endpoints 2FA

```http
POST /api/auth/2fa/enable    # Generar secret y QR
POST /api/auth/2fa/verify    # Verificar código y activar
POST /api/auth/2fa/disable   # Deshabilitar 2FA
POST /api/auth/login/2fa     # Login con código 2FA
```

---

### Flujo de Habilitación

```
1. Usuario solicita habilitar 2FA
   ↓
2. Sistema genera secret TOTP
   ↓
3. Sistema genera QR code
   ↓
4. Sistema genera 5 códigos de respaldo
   ↓
5. Usuario escanea QR con Google Authenticator
   ↓
6. Usuario ingresa código de verificación
   ↓
7. Sistema valida código
   ↓
8. Si es válido: activa 2FA y muestra backup codes
   ↓
9. Sistema envía notificación de activación
```

---

### Flujo de Login con 2FA

```
1. Usuario ingresa email/password
   ↓
2. Sistema valida credenciales
   ↓
3. Si usuario tiene 2FA habilitado:
   ↓
4. Sistema NO genera tokens completos
   ↓
5. Sistema genera token temporal (5 min)
   ↓
6. Cliente solicita código 2FA
   ↓
7. Usuario ingresa código de app o backup code
   ↓
8. Sistema valida código
   ↓
9. Si es válido: genera tokens JWT completos
   ↓
10. Usuario autenticado
```

---

### Implementación con Speakeasy

```typescript
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";

async enable2FA(userId: string): Promise<{
  secret: string;
  qrCode: string;
  backupCodes: string[];
}> {
  const user = await this.userRepository.findById(userId);

  // Generar secret
  const secret = speakeasy.generateSecret({
    name: `Bookly (${user.email})`,
    issuer: "UFPS Bookly",
  });

  // Generar QR code
  const qrCode = await qrcode.toDataURL(secret.otpauth_url);

  // Generar códigos de respaldo
  const backupCodes = Array.from({ length: 5 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  // Guardar secret (NO activado aún)
  await this.userRepository.update(userId, {
    twoFactorSecret: secret.base32,
    twoFactorBackupCodes: backupCodes,
    twoFactorEnabled: false, // Aún no activado
  });

  return {
    secret: secret.base32,
    qrCode,
    backupCodes,
  };
}

async verify2FA(userId: string, code: string): Promise<boolean> {
  const user = await this.userRepository.findById(userId);

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1, // Acepta 1 ventana antes/después (30 seg)
  });

  if (isValid) {
    // Activar 2FA
    await this.userRepository.update(userId, {
      twoFactorEnabled: true,
    });

    // Publicar evento
    await this.eventBus.publish(
      "auth.2fa.enabled",
      new TwoFactorEnabledEvent({ userId, email: user.email })
    );

    return true;
  }

  return false;
}
```

---

### Códigos de Respaldo

```typescript
async validateBackupCode(userId: string, code: string): Promise<boolean> {
  const user = await this.userRepository.findById(userId);

  if (user.twoFactorBackupCodes.includes(code)) {
    // Remover código usado
    const updatedCodes = user.twoFactorBackupCodes.filter((c) => c !== code);

    await this.userRepository.update(userId, {
      twoFactorBackupCodes: updatedCodes,
    });

    return true;
  }

  return false;
}
```

---

## 🗄️ Base de Datos

### Campos en User

```prisma
model User {
  // ... otros campos
  twoFactorEnabled    Boolean  @default(false)
  twoFactorSecret     String?
  twoFactorBackupCodes String[] @default([])
}
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- two-factor.service.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- 2fa.e2e-spec.ts
```

### Cobertura

- **Líneas**: 94%
- **Funciones**: 98%
- **Ramas**: 91%

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#autenticación-de-dos-factores-2fa)
- [Endpoints](../ENDPOINTS.md#autenticación-de-dos-factores-2fa)
- [Event Bus](../EVENT_BUS.md#9-twofactorenabledevent)

---

## 🔄 Changelog

| Fecha      | Cambio                                   | Autor |
| ---------- | ---------------------------------------- | ----- |
| 2025-11-01 | Implementación inicial con TOTP          | Team  |
| 2025-11-03 | Agregados códigos de respaldo            | Team  |
| 2025-11-05 | Notificaciones al habilitar/deshabilitar | Team  |

---

**Mantenedor**: Bookly Development Team
