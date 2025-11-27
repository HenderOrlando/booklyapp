# RF-21: Generación Automática de Documentos

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Noviembre 8, 2025

---

## 📋 Descripción

Generación automática de documentos oficiales (cartas de aprobación/rechazo) en formato PDF usando plantillas HTML customizables con datos dinámicos, logos institucionales y firma digital opcional.

---

## ✅ Criterios de Aceptación

- [x] Plantillas HTML editables con variables dinámicas
- [x] Generación automática de PDF al aprobar/rechazar
- [x] Datos dinámicos: usuario, recurso, fechas, razón
- [x] Logo institucional en encabezado
- [x] Firma digital opcional con QR de verificación
- [x] Almacenamiento en cloud storage
- [x] Descarga y envío por email automático
- [x] Múltiples plantillas por tipo de documento

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `DocumentController` - Generación y descarga
- `TemplateController` - Gestión de plantillas

**Services**:

- `DocumentGenerationService` - Generación de PDFs
- `TemplateService` - Gestión de plantillas
- `SignatureService` - Firma digital

**Repositories**:

- `PrismaDocumentTemplateRepository` - Plantillas

**Commands**:

- `GenerateDocumentCommand` - Generar documento
- `CreateTemplateCommand` - Crear plantilla

---

### Endpoints Creados

```http
POST /api/documents/generate          # Generar documento
GET  /api/documents/:id/download       # Descargar PDF

# Plantillas
GET  /api/templates                    # Listar plantillas
POST /api/templates                    # Crear plantilla
PATCH /api/templates/:id               # Actualizar
```

---

### Plantillas Disponibles

1. **Carta de Aprobación**
   - Variables: {userName}, {resourceName}, {date}, {time}, {location}
   
2. **Carta de Rechazo**
   - Variables: {userName}, {resourceName}, {reason}, {alternativeSuggestions}
   
3. **Confirmación de Reserva**
   - Variables: {reservationId}, {qrCode}, {instructions}

---

### Tecnologías

- **Puppeteer**: Renderizado HTML a PDF
- **Handlebars**: Motor de plantillas
- **QRCode**: Generación de códigos QR
- **AWS S3 / Google Cloud Storage**: Almacenamiento

---

## 🗄️ Base de Datos

```prisma
model DocumentTemplate {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  type        String   // APPROVAL, REJECTION, CONFIRMATION
  
  htmlContent String   // Plantilla HTML con variables
  variables   Json     // Lista de variables disponibles
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  @@map("document_templates")
}
```

---

## ⚡ Performance

- Generación asíncrona con jobs
- Cache de plantillas compiladas
- Compresión de PDFs

---

## 📚 Documentación Relacionada

- [Base de Datos](../DATABASE.md#2-documenttemplate)

---

**Mantenedor**: Bookly Development Team
