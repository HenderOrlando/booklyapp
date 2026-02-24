# 🔐 Two-Factor Authentication (2FA) - Bookly Auth Service

**Estado**: ✅ Implementado  
**Versión**: 1.0.0  
**Fecha**: 2025-01-08

---

## 📋 Resumen

El Auth Service de Bookly ahora soporta autenticación de dos factores (2FA) usando TOTP (Time-based One-Time Password). Esta implementación agrega una capa adicional de seguridad al proceso de autenticación, requiriendo un código temporal generado por una aplicación autenticadora además de las credenciales tradicionales.

---

## 🎯 Características Implementadas

- ✅ **Generación de secrets TOTP** con QR code
- ✅ **Códigos de backup** para recuperación de acceso
- ✅ **Verificación TOTP** con ventana de tolerancia
- ✅ **Flujo de login con 2FA** usando tokens temporales
- ✅ **Login con códigos de backup** como alternativa
- ✅ **Regeneración de códigos de backup**
- ✅ **Habilitación/Deshabilitación** de 2FA por usuario
- ✅ **Integración completa con CQRS** y arquitectura limpia

---

## 🏗️ Arquitectura

```
Usuario
   │
   ▼
[Login tradicional]
   │
   ├──> Sin 2FA → Genera tokens JWT
   │
   └──> Con 2FA habilitado
          │
          ├──> Genera token temporal (5 min)
          │
          ▼
   [Usuario ingresa código TOTP]
          │
          ├──> POST /auth/login/2fa
          │    └──> Verifica código → Genera tokens JWT
          │
          └──> POST /auth/login/backup-code
               └──> Verifica código backup → Genera tokens JWT
```

---

## 🔌 Endpoints

### 1. Generar Configuración 2FA (Setup)

```http
POST /api/auth/2fa/setup
Authorization: Bearer {accessToken}
```

**Descripción**: Genera el secret TOTP, QR code y códigos de backup para configurar 2FA.

**Headers**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta**:

```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "backupCodes": [
      "A1B2C3D4",
      "E5F6G7H8",
      "I9J0K1L2",
      "M3N4O5P6",
      "Q7R8S9T0",
      "U1V2W3X4",
      "Y5Z6A7B8",
      "C9D0E1F2",
      "G3H4I5J6",
      "K7L8M9N0"
    ]
  },
  "message": "Escanea el código QR con tu aplicación de autenticación"
}
```

---

### 2. Habilitar 2FA

```http
POST /api/auth/2fa/enable
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Descripción**: Verifica el código TOTP y habilita 2FA permanentemente.

**Body**:

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "token": "123456"
}
```

**Respuesta**:

```json
{
  "success": true,
  "data": {
    "backupCodes": [
      "A1B2C3D4",
      "E5F6G7H8",
      "I9J0K1L2",
      "M3N4O5P6",
      "Q7R8S9T0",
      "U1V2W3X4",
      "Y5Z6A7B8",
      "C9D0E1F2",
      "G3H4I5J6",
      "K7L8M9N0"
    ]
  },
  "message": "2FA habilitado exitosamente. Guarda los códigos de backup en un lugar seguro"
}
```

---

### 3. Login con 2FA

```http
POST /api/auth/login/2fa
Content-Type: application/json
```

**Descripción**: Completa el login usando el código TOTP de 6 dígitos.

**Body**:

```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token": "123456"
}
```

**Respuesta**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Autenticación 2FA exitosa"
}
```

---

### 4. Login con Código de Backup

```http
POST /api/auth/login/backup-code
Content-Type: application/json
```

**Descripción**: Completa el login usando un código de backup de 8 caracteres.

**Body**:

```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "backupCode": "A1B2C3D4"
}
```

**Respuesta**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Autenticación con código de backup exitosa"
}
```

---

### 5. Deshabilitar 2FA

```http
POST /api/auth/2fa/disable
Authorization: Bearer {accessToken}
```

**Descripción**: Deshabilita la autenticación de dos factores.

**Respuesta**:

```json
{
  "success": true,
  "message": "2FA deshabilitado exitosamente"
}
```

---

### 6. Regenerar Códigos de Backup

```http
POST /api/auth/2fa/regenerate-backup-codes
Authorization: Bearer {accessToken}
```

**Descripción**: Genera nuevos códigos de backup reemplazando los anteriores.

**Respuesta**:

```json
{
  "success": true,
  "data": {
    "backupCodes": [
      "A1B2C3D4",
      "E5F6G7H8",
      "I9J0K1L2",
      "M3N4O5P6",
      "Q7R8S9T0",
      "U1V2W3X4",
      "Y5Z6A7B8",
      "C9D0E1F2",
      "G3H4I5J6",
      "K7L8M9N0"
    ]
  },
  "message": "Códigos de backup regenerados exitosamente"
}
```

---

## 🔄 Flujo Completo de Habilitación 2FA

### Paso 1: Usuario decide habilitar 2FA

```bash
# 1. Generar configuración
curl -X POST http://localhost:3001/api/auth/2fa/setup \
  -H "Authorization: Bearer {accessToken}"
```

Respuesta contiene:

- **secret**: Base32 secret para configurar app autenticadora
- **qrCode**: Imagen QR para escanear con Google Authenticator, Authy, etc.
- **backupCodes**: 10 códigos de un solo uso para recuperación

### Paso 2: Usuario escanea QR code

Usuario abre su aplicación autenticadora (Google Authenticator, Authy, Microsoft Authenticator, etc.) y escanea el QR code o ingresa manualmente el secret.

### Paso 3: Usuario verifica código y habilita 2FA

```bash
# 2. Verificar código TOTP y habilitar
curl -X POST http://localhost:3001/api/auth/2fa/enable \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "JBSWY3DPEHPK3PXP",
    "token": "123456"
  }'
```

**⚠️ IMPORTANTE**: Usuario debe guardar los códigos de backup en un lugar seguro.

---

## 🔄 Flujo de Login con 2FA

### Paso 1: Login tradicional

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@ufps.edu.co",
    "password": "SecurePass123"
  }'
```

**Si el usuario tiene 2FA habilitado**, la respuesta será:

```json
{
  "success": true,
  "data": {
    "requiresTwoFactor": true,
    "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Por favor ingresa tu código 2FA"
}
```

### Paso 2: Completar con código TOTP

```bash
curl -X POST http://localhost:3001/api/auth/login/2fa \
  -H "Content-Type: application/json" \
  -d '{
    "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token": "123456"
  }'
```

**O usar código de backup**:

```bash
curl -X POST http://localhost:3001/api/auth/login/backup-code \
  -H "Content-Type: application/json" \
  -d '{
    "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "backupCode": "A1B2C3D4"
  }'
```

### Paso 3: Obtener tokens JWT

Respuesta final:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Autenticación 2FA exitosa"
}
```

---

## 👤 Campos de Usuario 2FA

### User Schema

```typescript
{
  twoFactorEnabled: boolean;       // Si 2FA está habilitado
  twoFactorSecret: string;         // Secret TOTP (encriptado en BD)
  twoFactorBackupCodes: string[];  // Códigos de backup
}
```

### User Entity

```typescript
// Métodos disponibles
user.has2FAEnabled(): boolean
user.enable2FA(secret, backupCodes): void
user.disable2FA(): void
user.useBackupCode(code): boolean
user.regenerateBackupCodes(newCodes): void
```

---

## 🔒 Seguridad

### Token Temporal

- **Duración**: 5 minutos
- **Uso único**: Solo válido para completar el login
- **Payload**: `{ sub: userId, email, temp: true }`

### Códigos TOTP

- **Algoritmo**: SHA1
- **Período**: 30 segundos
- **Dígitos**: 6
- **Ventana de tolerancia**: ±60 segundos (2 períodos antes/después)

### Códigos de Backup

- **Formato**: 8 caracteres hexadecimales (A-F, 0-9)
- **Cantidad**: 10 códigos por usuario
- **Uso único**: Cada código solo puede usarse una vez
- **Regeneración**: Usuario puede regenerar en cualquier momento

### Validaciones

1. **Setup 2FA**: Solo usuarios autenticados pueden generar configuración
2. **Enable 2FA**: Requiere verificación de código TOTP antes de habilitar
3. **Login 2FA**: Token temporal debe ser válido y no expirado
4. **Backup Codes**: Se eliminan automáticamente después de usarse

---

## 📱 Aplicaciones Autenticadoras Compatibles

- **Google Authenticator** (iOS/Android)
- **Authy** (iOS/Android/Desktop)
- **Microsoft Authenticator** (iOS/Android)
- **1Password** (iOS/Android/Desktop)
- **Bitwarden** (iOS/Android/Desktop)
- **LastPass Authenticator** (iOS/Android)

---

## 🧪 Testing

### Prueba Manual Completa

#### 1. Habilitar 2FA

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ufps.edu.co","password":"Admin123!"}' \
  | jq -r '.data.tokens.accessToken')

# Setup 2FA
SETUP=$(curl -s -X POST http://localhost:3001/api/auth/2fa/setup \
  -H "Authorization: Bearer $TOKEN")

echo $SETUP | jq '.data.secret'
echo $SETUP | jq '.data.backupCodes'

# Escanear QR o usar secret en app autenticadora
# Obtener código TOTP (ej: 123456)

# Habilitar 2FA
curl -X POST http://localhost:3001/api/auth/2fa/enable \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"$(echo $SETUP | jq -r '.data.secret')\",\"token\":\"123456\"}"
```

#### 2. Login con 2FA

```bash
# Intentar login (recibe tempToken)
TEMP=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ufps.edu.co","password":"Admin123!"}')

echo $TEMP | jq '.data.requiresTwoFactor'  # true
TEMP_TOKEN=$(echo $TEMP | jq -r '.data.tempToken')

# Completar con código TOTP
curl -X POST http://localhost:3001/api/auth/login/2fa \
  -H "Content-Type: application/json" \
  -d "{\"tempToken\":\"$TEMP_TOKEN\",\"token\":\"123456\"}"
```

#### 3. Login con Código de Backup

```bash
# Usar código de backup
curl -X POST http://localhost:3001/api/auth/login/backup-code \
  -H "Content-Type: application/json" \
  -d "{\"tempToken\":\"$TEMP_TOKEN\",\"backupCode\":\"A1B2C3D4\"}"
```

---

## 📊 Logging y Auditoría

Todas las operaciones 2FA son auditadas:

```typescript
// Setup 2FA generado
logger.info("2FA setup generated", {
  userId: "507f1f77bcf86cd799439011",
  email: "user@ufps.edu.co",
});

// 2FA habilitado
logger.info("2FA enabled successfully", {
  userId: "507f1f77bcf86cd799439011",
  email: "user@ufps.edu.co",
});

// Login pendiente 2FA
logger.info("Login pending 2FA verification", {
  userId: "507f1f77bcf86cd799439011",
  email: "user@ufps.edu.co",
});

// Código 2FA inválido
logger.warn("Invalid 2FA code during login", {
  userId: "507f1f77bcf86cd799439011",
  email: "user@ufps.edu.co",
});

// Código de backup usado
logger.info("User logged in successfully with backup code", {
  userId: "507f1f77bcf86cd799439011",
  email: "user@ufps.edu.co",
  remainingCodes: 9,
});
```

---

## 🐛 Troubleshooting

### Error: "Invalid verification code"

**Causa**: El código TOTP no coincide o expiró

**Solución**:

1. Verificar que el reloj del dispositivo esté sincronizado
2. Esperar a que se genere un nuevo código (30 segundos)
3. Intentar con el código de backup si persiste

---

### Error: "Invalid temporary token"

**Causa**: El token temporal expiró (>5 minutos)

**Solución**: Iniciar el proceso de login nuevamente

---

### Error: "2FA is already enabled"

**Causa**: Usuario intenta habilitar 2FA cuando ya está activo

**Solución**: Deshabilitar 2FA primero y volver a configurar

---

### Usuario perdió acceso a app autenticadora

**Solución**: Usar código de backup para ingresar y luego:

1. Deshabilitar 2FA
2. Volver a habilitar 2FA con nueva configuración
3. Escanear nuevo QR code

---

## 🚀 Próximos Pasos

1. ✅ **2FA con TOTP** - Implementado
2. ⏳ **Recovery via Email** - Futuro
3. ⏳ **Biometric Authentication** - Futuro
4. ⏳ **Hardware Security Keys (WebAuthn)** - Futuro
5. ⏳ **IP Whitelisting** - Futuro

---

## 📚 Referencias

- [RFC 6238 - TOTP: Time-Based One-Time Password](https://tools.ietf.org/html/rfc6238)
- [Speakeasy Documentation](https://www.npmjs.com/package/speakeasy)
- [QRCode Documentation](https://www.npmjs.com/package/qrcode)
- [OWASP 2FA Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)
