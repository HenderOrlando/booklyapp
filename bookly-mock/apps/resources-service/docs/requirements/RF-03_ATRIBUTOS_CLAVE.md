# RF-03: Definir Atributos Clave del Recurso

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Octubre 26, 2025

---

## 📋 Descripción

Permitir almacenar atributos personalizados y flexibles para cada recurso (equipamiento, características de accesibilidad, especificaciones técnicas) mediante un campo JSON que se adapte a las necesidades específicas de cada tipo de recurso.

---

## ✅ Criterios de Aceptación

- [x] Campo JSON `attributes` flexible y opcional
- [x] Soporte para lista de equipamiento (`equipment[]`)
- [x] Soporte para características de accesibilidad (`accessibility[]`)
- [x] Soporte para especificaciones técnicas (`technicalSpecs{}`)
- [x] Validación de estructura JSON con esquema definido
- [x] Búsqueda por atributos específicos
- [x] Documentación de atributos disponibles por tipo de recurso

---

## 🏗️ Implementación

### Componentes Desarrollados

**Services**:

- `ResourceService` - Validación y gestión de atributos
- `AttributeValidationService` - Esquemas de validación JSON

**Queries**:

- `SearchResourcesByAttributesQuery` - Búsqueda por atributos

---

### Estructura de Atributos

```json
{
  "equipment": ["projector", "whiteboard", "sound_system"],
  "accessibility": ["wheelchair_accessible", "hearing_loop"],
  "technicalSpecs": {
    "area": "50m2",
    "voltage": "220V",
    "network": "ethernet",
    "lighting": "LED_adjustable"
  },
  "additionalFeatures": ["air_conditioning", "blackout_curtains"]
}
```

---

## 🗄️ Base de Datos

```prisma
model Resource {
  attributes Json?  // Atributos personalizados flexibles
}
```

---

## 🧪 Testing

- **Líneas**: 90%
- **Funciones**: 93%

---

## ⚡ Performance

- Índice en atributos frecuentemente buscados
- Cache de atributos comunes

---

## 📚 Documentación Relacionada

- [Base de Datos](../DATABASE.md#1-resource)

---

**Mantenedor**: Bookly Development Team
