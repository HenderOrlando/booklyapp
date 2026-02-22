# 🚀 FASE 5 - STOCKPILE SERVICE - INICIO

**Fecha de inicio**: 21 de Noviembre, 2025, 6:45 AM  
**Estado**: 🔵 **INICIANDO**  
**Prioridad**: Media  
**Duración estimada**: Semanas 10-11

---

## 🎯 Objetivo de la Fase 5

Implementar el sistema de **aprobaciones y validaciones (Stockpile Service)** que gestiona el flujo completo de solicitudes de reserva, desde la petición inicial hasta la aprobación final, incluyendo check-in/check-out digital y generación de documentos.

---

## 📋 Alcance de la Fase

### Features Principales

1. **Flujo de Aprobaciones Multinivel**
   - Visualización de solicitudes pendientes
   - Aprobar/Rechazar solicitudes
   - Historial de aprobaciones
   - Estados: PENDING → IN_REVIEW → APPROVED/REJECTED

2. **Check-in/Check-out Digital**
   - Registro de entrada (check-in)
   - Registro de salida (check-out)
   - Validación con código QR
   - Control de vigilancia

3. **Generación de Documentos**
   - Cartas de aprobación (PDF)
   - Cartas de rechazo (PDF)
   - Documentos personalizados con plantillas
   - Envío automático por email

4. **Panel de Vigilancia**
   - Vista en tiempo real de reservas activas
   - Check-in/out rápido
   - Alertas de irregularidades
   - Registro de eventos

5. **Notificaciones Multi-canal**
   - Email
   - WhatsApp (integración futura)
   - Notificaciones in-app
   - SMS (opcional)

---

## 📦 Componentes a Crear (Atomic Design)

### Atoms (6 componentes)

- [ ] `ApprovalStatusBadge` - Badge de estado de aprobación
- [ ] `QRCodeDisplay` - Visualización de código QR
- [ ] `CheckInButton` - Botón de check-in
- [ ] `CheckOutButton` - Botón de check-out
- [ ] `ApprovalActionButton` - Botón de aprobar/rechazar
- [ ] `TimelinePoint` - Punto en línea de tiempo

### Molecules (5 componentes)

- [ ] `ApprovalCard` - Tarjeta de solicitud de aprobación
- [ ] `ApprovalTimeline` - Línea de tiempo de aprobaciones
- [ ] `CheckInOutPanel` - Panel con ambos botones
- [ ] `ApprovalActions` - Grupo de acciones (aprobar/rechazar/comentar)
- [ ] `DocumentPreview` - Preview de documento PDF

### Organisms (4 componentes)

- [ ] `ApprovalRequestList` - Lista de solicitudes pendientes
- [ ] `ApprovalModal` - Modal para aprobar/rechazar con comentarios
- [ ] `VigilancePanel` - Panel de vigilancia en tiempo real
- [ ] `DocumentGenerator` - Generador de documentos PDF

### Pages (5 páginas)

- [ ] `/aprobaciones` - Lista de solicitudes pendientes
- [ ] `/aprobaciones/[id]` - Detalle de solicitud
- [ ] `/vigilancia` - Panel de vigilancia
- [ ] `/check-in` - Vista de check-in
- [ ] `/historial-aprobaciones` - Historial completo

---

## 🔧 Stack Técnico

### Librerías Necesarias

```json
{
  "dependencies": {
    "react-pdf": "^7.5.1", // Generación PDF
    "@react-pdf/renderer": "^3.1.14", // Render PDF
    "qrcode.react": "^3.1.0", // Códigos QR
    "react-signature-canvas": "^1.0.6", // Firmas digitales
    "html2canvas": "^1.4.1", // Captura de pantalla
    "jspdf": "^2.5.1" // Generación PDF alternativa
  }
}
```

### Tipos TypeScript

```typescript
// src/types/entities/approval.ts

export type ApprovalStatus =
  | "PENDING" // Pendiente de revisión
  | "IN_REVIEW" // En revisión
  | "APPROVED" // Aprobada
  | "REJECTED" // Rechazada
  | "CANCELLED" // Cancelada por usuario
  | "EXPIRED"; // Expirada

export type ApprovalLevel =
  | "FIRST_LEVEL" // Primer nivel (jefe de programa)
  | "SECOND_LEVEL" // Segundo nivel (decano)
  | "FINAL_LEVEL"; // Nivel final (rectoría)

export interface ApprovalRequest {
  id: string;
  reservationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  resourceId: string;
  resourceName: string;
  startDate: string;
  endDate: string;
  purpose: string; // Propósito de la reserva
  attendees: number;
  status: ApprovalStatus;
  currentLevel: ApprovalLevel;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerName?: string;
  comments?: string;
  rejectionReason?: string;
  documentUrl?: string; // URL del documento generado
  qrCode?: string; // Código QR para check-in
}

export interface ApprovalAction {
  action: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
  comments: string;
  nextLevel?: ApprovalLevel;
  notifyUser?: boolean;
  generateDocument?: boolean;
}

export interface CheckInOut {
  id: string;
  reservationId: string;
  type: "CHECK_IN" | "CHECK_OUT";
  timestamp: string;
  userId: string;
  userName: string;
  vigilantId?: string;
  vigilantName?: string;
  method: "QR" | "MANUAL" | "AUTOMATIC";
  location?: string;
  notes?: string;
}
```

---

## 🔄 Flujo de Aprobaciones

```
USUARIO
   ↓
1. Crea Reserva
   ↓
2. Sistema crea ApprovalRequest (PENDING)
   ↓
3. Notifica al aprobador de primer nivel
   ↓
APROBADOR
   ↓
4. Revisa solicitud (IN_REVIEW)
   ↓
5a. APRUEBA                    5b. RECHAZA
    ↓                              ↓
    Si requiere más niveles:      Genera carta de rechazo
    → Notifica siguiente nivel    → Notifica usuario
    Si es nivel final:             → Estado: REJECTED
    → Genera carta aprobación
    → Genera QR code
    → Notifica usuario
    → Estado: APPROVED
```

---

## 🎨 Diseños de UI

### Lista de Solicitudes Pendientes

```
┌─────────────────────────────────────────────────┐
│ 📋 Solicitudes de Aprobación                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  [🔍 Buscar]  [Filtro: Todas ▾]  [Refresh]      │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ 🔴 PENDING   Aula 101                   │    │
│  │ Juan Pérez - Reunión de equipo          │    │
│  │ 25/Nov 09:00-11:00                      │    │
│  │ [Ver Detalle] [Aprobar] [Rechazar]      │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ 🟡 IN_REVIEW   Laboratorio 3            │    │
│  │ María García - Práctica de física       │    │
│  │ 26/Nov 14:00-16:00                      │    │
│  │ [Ver Detalle] [Aprobar] [Rechazar]      │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Modal de Aprobación

```
┌────────────────────────────────────┐
│ ✅ Aprobar Solicitud               │
├────────────────────────────────────┤
│                                    │
│ Recurso: Aula 101                  │
│ Solicitante: Juan Pérez            │
│ Fecha: 25/Nov 09:00-11:00          │
│                                    │
│ Comentarios:                       │
│ ┌────────────────────────────────┐ │
│ │                                │ │
│ │                                │ │
│ └────────────────────────────────┘ │
│                                    │
│ ☑ Generar documento PDF            │
│ ☑ Notificar al usuario             │
│ ☑ Enviar por email                 │
│                                    │
│ [Cancelar]        [Aprobar]        │
└────────────────────────────────────┘
```

### Panel de Vigilancia

```
┌─────────────────────────────────────────────────┐
│ 🏢 Panel de Vigilancia - Tiempo Real            │
├─────────────────────────────────────────────────┤
│                                                 │
│  Reservas Activas Ahora (3)                     │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ ✅ CHECK-IN   Aula 101                  │    │
│  │ Juan Pérez - 09:00-11:00                │    │
│  │ Entrada: 09:05  [CHECK-OUT]             │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ ⏱️ PENDIENTE   Lab 3                    │    │
│  │ María García - 10:00-12:00              │    │
│  │ [REALIZAR CHECK-IN]                     │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ ⚠️ RETRASADO   Auditorio                │    │
│  │ Carlos López - 08:00-10:00              │    │
│  │ Sin check-in (10 min tarde)             │    │
│  │ [CONTACTAR] [MARCAR AUSENTE]            │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📊 Endpoints del Stockpile Service

### Solicitudes de Aprobación (RF-20, RF-25)

```typescript
// Listar solicitudes con filtros
GET    /api/v1/approval-requests?status=PENDING&level=FIRST_LEVEL

// Obtener detalle de solicitud
GET    /api/v1/approval-requests/:id

// Crear solicitud de aprobación
POST   /api/v1/approval-requests

// Aprobar solicitud (RF-20)
POST   /api/v1/approval-requests/:id/approve

// Rechazar solicitud (RF-20)
POST   /api/v1/approval-requests/:id/reject

// Historial de aprobaciones (RF-25)
GET    /api/v1/approval-requests/:id/history
```

### Flujos de Aprobación (RF-24)

```typescript
// Configuración de flujos personalizados
GET    /api/v1/approval-flows
POST   /api/v1/approval-flows
PATCH  /api/v1/approval-flows/:id
DELETE /api/v1/approval-flows/:id
```

### Check-in/Check-out (RF-23, RF-26)

```typescript
// Realizar check-in digital
POST   /api/v1/check-in-out/check-in

// Realizar check-out digital
POST   /api/v1/check-in-out/check-out

// Obtener reservas activas (Panel de vigilancia RF-23)
GET    /api/v1/check-in-out/active/all

// Obtener reservas con retraso
GET    /api/v1/check-in-out/overdue/all

// Historial de registros
GET    /api/v1/check-in-out/history/:reservationId
```

### Documentos (RF-21)

```typescript
// Templates de documentos
GET    /api/v1/document-templates
POST   /api/v1/document-templates

// Generar documento PDF automáticamente
GET    /api/v1/documents/:id/generate

// Descargar documento
GET    /api/v1/documents/:id/download
```

### Notificaciones (RF-22, RF-27, RF-28)

```typescript
// Enviar notificación individual
POST   /api/v1/notifications/send

// Envío masivo (batch)
POST   /api/v1/notifications/send-batch

// Estado de notificación
GET    /api/v1/notifications/:id
```

---

## 🎯 Plan de Implementación

### Semana 10 - Core Features

**Días 1-2**: Setup y Estructura Base

- [ ] Instalar dependencias (react-pdf, qrcode.react)
- [ ] Crear tipos TypeScript (approval.ts, checkInOut.ts, document.ts)
- [ ] Crear cliente HTTP para Stockpile Service
- [ ] Configurar rutas en App Router

**Días 3-4**: Componentes Atoms y Molecules

- [ ] ApprovalStatusBadge
- [ ] QRCodeDisplay
- [ ] CheckInButton/CheckOutButton
- [ ] ApprovalCard
- [ ] ApprovalTimeline

**Día 5**: Lista de Aprobaciones

- [ ] Página /aprobaciones
- [ ] ApprovalRequestList organism
- [ ] Filtros y búsqueda
- [ ] EmptyState cuando no hay solicitudes

### Semana 11 - Features Avanzadas

**Días 1-2**: Modal de Aprobación y Documentos

- [ ] ApprovalModal organism
- [ ] Integración con generación de PDF
- [ ] Preview de documentos
- [ ] Envío por email

**Días 3-4**: Check-in/Check-out y Vigilancia

- [ ] VigilancePanel organism
- [ ] Check-in/out con QR code
- [ ] Panel en tiempo real
- [ ] Alertas y notificaciones

**Día 5**: Testing y Documentación

- [ ] Testing manual completo
- [ ] Documentación de componentes
- [ ] Actualización del plan general
- [ ] Preparación para Fase 6

---

## ✅ Criterios de Aceptación

### Funcionales

- [ ] Usuario puede ver lista de solicitudes pendientes
- [ ] Aprobador puede aprobar/rechazar con comentarios
- [ ] Sistema genera documentos PDF automáticamente
- [ ] Check-in/out funciona con código QR
- [ ] Panel de vigilancia muestra reservas activas en tiempo real
- [ ] Historial de aprobaciones es visible y filtrable

### No Funcionales

- [ ] PDFs generados son legibles y profesionales
- [ ] QR codes son escaneables
- [ ] Tiempo de carga < 2 segundos
- [ ] Responsive en todas las resoluciones
- [ ] Notificaciones se envían correctamente

---

## 📝 Notas Técnicas

### Generación de PDF

- Usar `@react-pdf/renderer` para templates personalizados
- Templates deben incluir: logo UFPS, firma digital, QR code
- Formato: Carta oficial con membrete institucional

### Códigos QR

- Contener: reservationId, userId, timestamp, hash de seguridad
- Formato: JSON stringificado + Base64
- Validación: Verificar hash en backend

### Check-in/Check-out

- Tolerancia de 15 minutos antes del inicio
- Registro automático de horario real
- Alertas si no se realiza check-in en 10 minutos

---

## 🚀 Próximos Pasos Inmediatos

1. **Instalar dependencias de PDF y QR**
2. **Crear estructura de tipos**
3. **Implementar cliente HTTP**
4. **Crear primeros componentes atoms**
5. **Página de lista de aprobaciones**

---

**Estado**: ✅ Plan definido, listo para comenzar implementación
