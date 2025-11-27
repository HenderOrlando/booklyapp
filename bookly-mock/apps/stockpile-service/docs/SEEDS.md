# 🌱 Stockpile Service - Seeds

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Descripción](#descripción)
- [Ejecución de Seeds](#ejecución-de-seeds)
- [Seeds Disponibles](#seeds-disponibles)
- [Orden de Ejecución](#orden-de-ejecución)
- [Seeds por Entorno](#seeds-por-entorno)

---

## 📖 Descripción

Los seeds del Stockpile Service permiten poblar la base de datos con datos iniciales necesarios para la gestión de aprobaciones y validaciones:

- **Flujos de Aprobación**: Configuración de flujos por tipo de recurso (RF-24)
- **Plantillas de Documentos**: Cartas de aprobación, rechazo y certificados (RF-21)
- **Solicitudes de Aprobación**: Solicitudes en diferentes estados (RF-20, RF-25)
- **Notificaciones**: Notificaciones por email y WhatsApp (RF-22, RF-28)

---

## 🚀 Ejecución de Seeds

### Comando Principal

```bash
# Ejecutar todos los seeds
npm run seed

# Ejecutar en modo desarrollo (limpia y re-seed)
NODE_ENV=development npm run seed

# Ejecutar en producción (no limpia)
NODE_ENV=production npm run seed
```

### Variables de Entorno

```bash
# Conexión a base de datos
DATABASE_URL="mongodb://localhost:27017/bookly-stockpile"

# Entorno (development, staging, production)
NODE_ENV=development
```

---

## 🌾 Seeds Disponibles

### 1. Approval Flows Seed (RF-24)

**Descripción**: Crea flujos de aprobación configurables por tipo de recurso.

**Entidades Afectadas**:

- `ApprovalFlow`

**Datos Creados**: 3 flujos

| Flujo | Tipo Recurso | Pasos | Doble Aprobación |
| ----- | ------------ | ----- | ---------------- |
| Aprobación de Auditorio | auditorio | 2 (program_admin → admin) | Sí |
| Aprobación de Equipo | equipo | 1 (staff) | No |
| Auto-aprobación de Salas | sala | 1 (system, auto) | No |

#### Flujo 1: Aprobación de Auditorio

- **Tipo**: auditorio
- **Requiere Doble Aprobación**: Sí
- **Pasos**:
  1. Coordinador de Programa (program_admin) - Obligatorio
  2. Administrador General (admin) - Obligatorio

```typescript
{
  name: "Aprobación de Auditorio",
  description: "Flujo de aprobación para reservas de auditorios",
  resourceType: "auditorio",
  steps: [
    {
      order: 1,
      approverRole: "program_admin",
      required: true,
      autoApprove: false,
    },
    {
      order: 2,
      approverRole: "admin",
      required: true,
      autoApprove: false,
    },
  ],
  isActive: true,
  requiresDoubleApproval: true,
}
```

#### Flujo 2: Aprobación de Equipo

- **Tipo**: equipo
- **Requiere Doble Aprobación**: No
- **Pasos**:
  1. Personal Administrativo (staff) - Obligatorio

```typescript
{
  name: "Aprobación de Equipo",
  resourceType: "equipo",
  steps: [
    {
      order: 1,
      approverRole: "staff",
      required: true,
      autoApprove: false,
    },
  ],
  isActive: true,
  requiresDoubleApproval: false,
}
```

#### Flujo 3: Auto-aprobación de Salas

- **Tipo**: sala
- **Requiere Doble Aprobación**: No
- **Pasos**:
  1. Sistema (auto-aprobación)

```typescript
{
  name: "Auto-aprobación de Salas",
  resourceType: "sala",
  steps: [
    {
      order: 1,
      approverRole: "system",
      required: false,
      autoApprove: true,
    },
  ],
  isActive: true,
  requiresDoubleApproval: false,
}
```

---

### 2. Document Templates Seed (RF-21)

**Descripción**: Crea plantillas HTML para generación automática de documentos.

**Entidades Afectadas**:

- `DocumentTemplate`

**Plantillas Creadas**: 3 tipos

| Plantilla | Tipo | Variables | Uso |
| --------- | ---- | --------- | --- |
| Carta de Aprobación | approval | 8 | Reservas aprobadas |
| Carta de Rechazo | rejection | 8 | Reservas rechazadas |
| Certificado de Uso | certificate | 9 | Uso completado |

#### Plantilla 1: Carta de Aprobación

- **Tipo**: approval
- **Descripción**: Carta oficial de aprobación de reserva
- **Variables**:
  - date (fecha actual)
  - userName (nombre del solicitante)
  - resourceName (nombre del recurso)
  - reservationDate (fecha de reserva)
  - startTime (hora inicio)
  - endTime (hora fin)
  - purpose (propósito)
  - approvedBy (aprobador)

**Estructura HTML**:

```html
<html>
  <body>
    <h1>Carta de Aprobación de Reserva</h1>
    <p>Fecha: {{date}}</p>
    <p>Estimado/a {{userName}},</p>
    <p>Le informamos que su solicitud de reserva del recurso <strong>{{resourceName}}</strong> 
    para el día {{reservationDate}} de {{startTime}} a {{endTime}} ha sido <strong>APROBADA</strong>.</p>
    <p>Propósito: {{purpose}}</p>
    <p>Aprobado por: {{approvedBy}}</p>
    <p>Atentamente,</p>
    <p>Sistema de Gestión de Reservas - Bookly</p>
  </body>
</html>
```

#### Plantilla 2: Carta de Rechazo

- **Tipo**: rejection
- **Descripción**: Carta oficial de rechazo de reserva
- **Variables**:
  - date, userName, resourceName, reservationDate
  - startTime, endTime
  - reason (motivo del rechazo)
  - rejectedBy (quien rechazó)

#### Plantilla 3: Certificado de Uso

- **Tipo**: certificate
- **Descripción**: Certificado de uso de recurso
- **Variables**:
  - userName, userEmail, resourceName, reservationDate
  - startTime, endTime, purpose
  - checkInTime, checkOutTime

---

### 3. Approval Requests Seed (RF-20, RF-25)

**Descripción**: Crea solicitudes de aprobación en diferentes estados vinculadas a reservas.

**Entidades Afectadas**:

- `ApprovalRequest`

**Solicitudes Creadas**: 4 en diferentes estados

| Estado | Recurso | Solicitante | Pasos Completados | Documento |
| ------ | ------- | ----------- | ----------------- | --------- |
| approved | Auditorio Principal | docente@ufps.edu.co | 2/2 | ✅ PDF |
| pending | Auditorio Principal | estudiante@ufps.edu.co | 0/2 | ❌ |
| rejected | Proyector Portátil 1 | estudiante@ufps.edu.co | 1/1 (rechazado) | ✅ PDF |
| in_review | Proyector Portátil 1 | docente@ufps.edu.co | 0/1 | ❌ |

#### Solicitud 1: Aprobada (Pasada)

- **Reserva**: reservation-001
- **Recurso**: Auditorio Principal
- **Solicitante**: docente@ufps.edu.co (Juan Docente)
- **Fecha**: Semana pasada, 10:00 - 12:00
- **Propósito**: Conferencia sobre Inteligencia Artificial
- **Estado**: approved
- **Historial de Aprobación**:
  1. **Paso 1**: program_admin (admin.sistemas@ufps.edu.co)
     - Decisión: Aprobado
     - Comentarios: "Aprobado por coordinación de programa"
     - Fecha: 5 días antes
  2. **Paso 2**: admin (admin@ufps.edu.co)
     - Decisión: Aprobado
     - Comentarios: "Aprobado por administración general"
     - Fecha: 4 días antes
- **Documento**: ✅ Generado (`/documents/approval-001.pdf`)
- **Notificaciones**: Email + WhatsApp

```typescript
{
  reservationId: "reservation-001",
  resourceType: "auditorio",
  status: "approved",
  currentStep: 2,
  approvalHistory: [
    {
      step: 1,
      approver: "admin.sistemas@ufps.edu.co",
      approverRole: "program_admin",
      decision: "approved",
      comments: "Aprobado por coordinación de programa",
    },
    {
      step: 2,
      approver: "admin@ufps.edu.co",
      approverRole: "admin",
      decision: "approved",
      comments: "Aprobado por administración general",
    },
  ],
  documentGenerated: true,
  documentUrl: "/documents/approval-001.pdf",
  notificationsSent: ["email", "whatsapp"],
}
```

#### Solicitud 2: Pendiente (Futuro)

- **Reserva**: reservation-004
- **Recurso**: Auditorio Principal
- **Solicitante**: estudiante@ufps.edu.co (María Estudiante)
- **Fecha**: Próxima semana, 16:00 - 18:00
- **Propósito**: Evento Estudiantil
- **Estado**: pending
- **Paso Actual**: 1 (esperando program_admin)
- **Historial**: Vacío
- **Notificaciones**: Email

#### Solicitud 3: Rechazada

- **Reserva**: reservation-rejected-001
- **Recurso**: Proyector Portátil 1
- **Solicitante**: estudiante@ufps.edu.co (María Estudiante)
- **Fecha**: Ayer, 14:00 - 18:00
- **Propósito**: Proyecto Personal
- **Estado**: rejected
- **Historial de Aprobación**:
  1. **Paso 1**: staff (staff@ufps.edu.co)
     - Decisión: Rechazado
     - Comentarios: "El equipo no se presta para proyectos personales"
     - Fecha: Ayer 10:00
- **Documento**: ✅ Generado (`/documents/rejection-001.pdf`)
- **Notificaciones**: Email

#### Solicitud 4: En Revisión

- **Reserva**: reservation-review-001
- **Recurso**: Proyector Portátil 1
- **Solicitante**: docente@ufps.edu.co (Juan Docente)
- **Fecha**: Próxima semana, 14:00 - 17:00
- **Propósito**: Clase de Multimedia
- **Estado**: in_review
- **Asignada a**: staff@ufps.edu.co
- **Paso Actual**: 1 (en revisión)
- **Notificaciones**: Email

---

### 4. Notifications Seed (RF-22, RF-28)

**Descripción**: Crea notificaciones enviadas por diferentes canales.

**Entidades Afectadas**:

- `Notification`

**Notificaciones Creadas**: 5

| Destinatario | Tipo | Canal | Estado | Relacionado |
| ------------ | ---- | ----- | ------ | ----------- |
| docente@ufps.edu.co | approval | email | sent | reservation-001 |
| docente@ufps.edu.co | approval | whatsapp | sent | reservation-001 |
| estudiante@ufps.edu.co | rejection | email | sent | reservation-rejected-001 |
| staff@ufps.edu.co | pending_approval | email | sent | reservation-review-001 |
| estudiante@ufps.edu.co | pending_approval | email | sent | reservation-004 |

#### Notificación 1: Aprobación Email

```typescript
{
  recipientId: "docente@ufps.edu.co",
  recipientName: "Juan Docente",
  type: "approval",
  channel: "email",
  subject: "Reserva Aprobada",
  message: "Su reserva del Auditorio Principal ha sido aprobada",
  status: "sent",
  sentAt: [fecha],
  relatedEntity: "approval_request",
  relatedEntityId: "reservation-001",
}
```

#### Notificación 2: Aprobación WhatsApp

```typescript
{
  recipientId: "docente@ufps.edu.co",
  type: "approval",
  channel: "whatsapp",
  message: "✅ Tu reserva del Auditorio Principal ha sido aprobada. Fecha: [date]",
  status: "sent",
}
```

#### Tipos de Notificación

- **approval**: Reserva aprobada
- **rejection**: Reserva rechazada
- **pending_approval**: Solicitud pendiente de revisión

#### Canales Disponibles

- **email**: Correo electrónico
- **whatsapp**: Mensaje de WhatsApp
- **sms**: Mensaje de texto (futuro)

---

## 🔄 Orden de Ejecución

Los seeds se ejecutan en el siguiente orden:

1. **Flujos de Aprobación** (sin dependencias)
   - Define las configuraciones de aprobación por tipo

2. **Plantillas de Documentos** (sin dependencias)
   - Crea las plantillas HTML para generación de cartas

3. **Solicitudes de Aprobación** (depende de Reservas externas)
   - Vincula con reservations del availability-service
   - Crea solicitudes en diferentes estados

4. **Notificaciones** (depende de Solicitudes)
   - Envía notificaciones relacionadas con solicitudes

**Archivo Principal** (`src/database/seed.ts`):

```typescript
async function seed() {
  try {
    logger.info("🌱 Iniciando seed de Stockpile Service...");

    // Obtener modelos
    const approvalFlowModel = app.get(getModelToken(ApprovalFlow.name));
    const documentTemplateModel = app.get(getModelToken(DocumentTemplate.name));
    const approvalRequestModel = app.get(getModelToken(ApprovalRequest.name));
    const notificationModel = app.get(getModelToken(Notification.name));

    // Limpiar (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      await approvalRequestModel.deleteMany({});
      await approvalFlowModel.deleteMany({});
      await documentTemplateModel.deleteMany({});
      await notificationModel.deleteMany({});
    }

    // Ejecutar seeds en orden
    await approvalFlowModel.insertMany(approvalFlows);
    await documentTemplateModel.insertMany(documentTemplates);
    await approvalRequestModel.insertMany(approvalRequests);
    await notificationModel.insertMany(notifications);

    logger.info("✅ Seed completado exitosamente");
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error en seed:", error);
    process.exit(1);
  }
}
```

---

## 🌍 Seeds por Entorno

### Development

En desarrollo, los seeds **limpian** la base de datos antes de insertar:

```typescript
if (process.env.NODE_ENV === "development") {
  logger.info("Limpiando datos existentes...");
  await approvalRequestModel.deleteMany({});
  await approvalFlowModel.deleteMany({});
  await documentTemplateModel.deleteMany({});
  await notificationModel.deleteMany({});
}
```

- ✅ Limpia datos existentes
- ✅ Crea 3 flujos de aprobación
- ✅ Crea 3 plantillas de documentos
- ✅ Crea 4 solicitudes de aprobación
- ✅ Crea 5 notificaciones

### Production

En producción, los seeds **no limpian** datos existentes:

- ❌ No limpia datos
- ✅ Solo inserta flujos si no existen
- ✅ Solo inserta plantillas si no existen
- ⚠️ No ejecutar solicitudes de ejemplo en producción
- ⚠️ No ejecutar notificaciones de ejemplo en producción

---

## 🧪 Testing con Seeds

### Setup para Tests

```typescript
import { Test } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";

describe("ApprovalService", () => {
  let approvalFlowModel: Model<ApprovalFlow>;
  let approvalRequestModel: Model<ApprovalRequest>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [StockpileModule],
    }).compile();

    approvalFlowModel = module.get(getModelToken(ApprovalFlow.name));
    approvalRequestModel = module.get(getModelToken(ApprovalRequest.name));

    // Seed de flujo
    await approvalFlowModel.create({
      name: "Test Flow",
      resourceType: "test",
      steps: [{
        order: 1,
        approverRole: "admin",
        required: true,
        autoApprove: false,
      }],
      isActive: true,
    });

    // Seed de solicitud
    await approvalRequestModel.create({
      reservationId: "test-reservation",
      resourceType: "test",
      requesterId: "test@user.com",
      status: "pending",
    });
  });

  afterAll(async () => {
    await approvalFlowModel.deleteMany({});
    await approvalRequestModel.deleteMany({});
  });

  it("should process approval", async () => {
    const count = await approvalRequestModel.countDocuments();
    expect(count).toBeGreaterThan(0);
  });
});
```

---

## 🔧 Utilidades

### Verificar Seeds Ejecutados

```typescript
export async function verifySeedsExecuted(
  approvalFlowModel: Model<ApprovalFlow>,
  approvalRequestModel: Model<ApprovalRequest>
): Promise<boolean> {
  const flowCount = await approvalFlowModel.countDocuments();
  const requestCount = await approvalRequestModel.countDocuments();

  console.log(`Flujos de aprobación: ${flowCount}`);
  console.log(`Solicitudes: ${requestCount}`);

  return flowCount > 0 && requestCount > 0;
}
```

### Limpiar Solicitudes Antiguas

```typescript
export async function cleanOldApprovalRequests(
  approvalRequestModel: Model<ApprovalRequest>
): Promise<number> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const result = await approvalRequestModel.deleteMany({
    endDateTime: { $lt: sixMonthsAgo },
    status: { $in: ["approved", "rejected"] },
  });

  return result.deletedCount;
}
```

---

## 📝 Configuración en package.json

```json
{
  "scripts": {
    "seed": "ts-node src/database/seed.ts",
    "seed:fresh": "npm run db:reset && npm run seed",
    "db:reset": "echo 'Cleaning database...' && npm run seed"
  }
}
```

---

## 📊 Resumen de Datos

### Flujos por Tipo de Recurso

| Tipo | Flujo | Pasos | Auto-aprobación |
| ---- | ----- | ----- | --------------- |
| auditorio | Aprobación de Auditorio | 2 | No |
| equipo | Aprobación de Equipo | 1 | No |
| sala | Auto-aprobación | 1 | Sí |

### Solicitudes por Estado

| Estado | Cantidad | Documento | Notificaciones |
| ------ | -------- | --------- | -------------- |
| approved | 1 | ✅ | 2 (email + whatsapp) |
| pending | 1 | ❌ | 1 (email) |
| rejected | 1 | ✅ | 1 (email) |
| in_review | 1 | ❌ | 1 (email) |

### Notificaciones por Canal

| Canal | Cantidad | Tipos |
| ----- | -------- | ----- |
| email | 5 | approval, rejection, pending |
| whatsapp | 1 | approval |

---

## ⚠️ Notas Importantes

1. **Vinculación Externa**: Las solicitudes están vinculadas a reservas del availability-service
2. **Plantillas HTML**: Las plantillas usan sintaxis Mustache `{{variable}}`
3. **Flujos Configurables**: Los flujos pueden tener múltiples pasos secuenciales
4. **Doble Aprobación**: Los auditorios requieren aprobación en 2 niveles
5. **Auto-aprobación**: Las salas pequeñas se aprueban automáticamente
6. **Notificaciones Multi-canal**: Soporte para email y WhatsApp
7. **Generación de Documentos**: Los documentos se generan automáticamente al aprobar/rechazar

---

## 🔒 Seguridad

### Producción

En producción, **NUNCA** ejecutar seeds con limpieza de datos:

```bash
# ❌ NO HACER ESTO EN PRODUCCIÓN
NODE_ENV=development npm run seed

# ✅ Hacer esto
NODE_ENV=production npm run seed
```

### Validaciones

Las solicitudes se crean con validaciones de integridad:

- `reservationId` debe existir en availability-service
- `resourceType` debe tener un flujo de aprobación configurado
- `approverRole` debe ser un rol válido del sistema
- Estados válidos: pending, in_review, approved, rejected
- Canales válidos: email, whatsapp, sms

---

## 📚 Referencias

- [Base de Datos](DATABASE.md)
- [Arquitectura](ARCHITECTURE.md)
- [RF-20: Validar Solicitudes](requirements/RF-20_VALIDAR_SOLICITUDES.md)
- [RF-21: Generar Documentos](requirements/RF-21_GENERAR_DOCUMENTOS.md)
- [RF-22: Notificaciones](requirements/RF-22_NOTIFICACIONES.md)
- [RF-24: Flujos de Aprobación](requirements/RF-24_FLUJOS_APROBACION.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
