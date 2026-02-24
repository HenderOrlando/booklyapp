# RF-05: Configuración de Reglas de Disponibilidad

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Octubre 28, 2025

---

## 📋 Descripción

Definir reglas de disponibilidad temporal para cada recurso, especificando horarios de apertura/cierre por día de semana, excepciones y bloques de tiempo permitidos. Estas reglas son consumidas por el Availability Service para validar reservas.

---

## ✅ Criterios de Aceptación

- [x] Campo JSON `availabilityRules` flexible
- [x] Reglas por día de semana (lunes a domingo)
- [x] Horarios de apertura y cierre por día
- [x] Marcar días como no disponibles
- [x] Configuración heredable desde categoría
- [x] API para actualizar reglas de disponibilidad

---

## 🏗️ Implementación

### Estructura de Reglas

```json
{
  "monday": { "isAvailable": true, "startTime": "07:00", "endTime": "22:00" },
  "tuesday": { "isAvailable": true, "startTime": "07:00", "endTime": "22:00" },
  "wednesday": {
    "isAvailable": true,
    "startTime": "07:00",
    "endTime": "22:00"
  },
  "thursday": { "isAvailable": true, "startTime": "07:00", "endTime": "22:00" },
  "friday": { "isAvailable": true, "startTime": "07:00", "endTime": "20:00" },
  "saturday": { "isAvailable": false },
  "sunday": { "isAvailable": false }
}
```

---

## 🗄️ Base de Datos

```prisma
model Resource {
  availabilityRules Json?  // Reglas de disponibilidad por día
}
```

---

## 📝 Notas

- La **validación** de disponibilidad se realiza en **Availability Service**
- Resources Service solo **almacena** las reglas configuradas

---

## 📚 Documentación Relacionada

- [Availability Service](../../availability-service/docs/README.md)

---

**Mantenedor**: Bookly Development Team
