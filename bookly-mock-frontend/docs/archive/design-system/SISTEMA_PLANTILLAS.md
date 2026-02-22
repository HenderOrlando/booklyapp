# 📝 Sistema de Plantillas - Bookly

**Versión**: 1.0.0  
**Fecha**: 22 de Noviembre, 2025

---

## 📋 Descripción General

El sistema de plantillas permite personalizar las notificaciones, correos electrónicos y documentos generados por la plataforma.

Las plantillas soportan variables dinámicas que se reemplazan con datos reales en tiempo de ejecución.

---

## 📦 Tipos de Plantillas

| Tipo             | Uso                      | Ejemplo                        |
| ---------------- | ------------------------ | ------------------------------ |
| **NOTIFICATION** | Notificaciones in-app    | Notificación de disponibilidad |
| **APPROVAL**     | Mensajes de aprobación   | Aprobación de solicitud        |
| **REJECTION**    | Mensajes de rechazo      | Rechazo por conflicto          |
| **DOCUMENT**     | Documentos PDF generados | Carta de Aprobación            |
| **EMAIL**        | Correos electrónicos     | Recordatorio de reserva        |

---

## 🔤 Variables Disponibles

Las siguientes variables pueden ser utilizadas en el `subject` y `body` de las plantillas usando el formato `{{variable}}`.

### Datos del Usuario

- `{{username}}` / `{{userName}}`: Nombre de usuario o nombre completo
- `{{firstname}}`: Primer nombre
- `{{lastname}}`: Apellido
- `{{email}}`: Correo electrónico

### Datos del Recurso

- `{{resource_name}}` / `{{resourceName}}`: Nombre del recurso
- `{{resource_program}}`: Programa académico asociado
- `{{resource_availability}}`: Estado de disponibilidad

### Datos de la Reserva/Solicitud

- `{{reservation_id}}`: ID de la reserva o solicitud
- `{{reservation_status}}` / `{{status}}`: Estado actual
- `{{reservation_reasson}}` / `{{reason}}`: Razón (ej. motivo de rechazo)
- `{{date}}`: Fecha de la reserva
- `{{time}}`: Hora de la reserva

---

## 🛠️ Configuración de Plantillas

Las plantillas se gestionan desde el panel de administración (`/admin/templates`).

### Campos Configurables

- **Nombre**: Identificador interno
- **Tipo**: Clasificación de la plantilla
- **Categoría**: Área funcional (Reserva, Aprobación, etc.)
- **Asunto**: Título del correo o notificación
- **Cuerpo**: Contenido con variables
- **Activa**: Si la plantilla está habilitada para su uso
- **Por Defecto**: Si es la plantilla principal para su tipo

### Vista Previa

El editor incluye una función de **Vista Previa** que permite visualizar la plantilla con datos de prueba para verificar el reemplazo de variables.

---

## 🚀 Uso en el Código

El sistema utiliza `TemplateEditor` para la gestión y `useDocumentGeneration` o servicios de notificación para el uso.

```typescript
// Ejemplo de generación de documento usando plantilla
const { generate } = useDocumentGeneration();

generate.mutate({
  templateId: "default-approval",
  approvalRequestId: "req-123",
  type: "approval",
  variables: {
    additionalNote: "Aprobado con condiciones",
  },
});
```

---

## 📂 Plantillas por Defecto (Mocks)

El sistema incluye plantillas predefinidas para:

1. Aprobación de Solicitud
2. Rechazo de Solicitud
3. Notificación de Disponibilidad
4. Carta de Aprobación (PDF)
5. Recordatorio de Reserva

Estas definiciones se encuentran en `src/infrastructure/mock/mockData.ts`.
