# RF-24: Flujos de Aprobación Diferenciados

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Noviembre 11, 2025

---

## 📋 Descripción

Sistema flexible de configuración de flujos de aprobación diferenciados por tipo de recurso, condiciones específicas (capacidad, duración, horario) y reglas de negocio, permitiendo asignación dinámica de aprobadores.

---

## ✅ Criterios de Aceptación

- [x] Flujos diferenciados por tipo de recurso
- [x] Condiciones configurables: capacidad, duración, horario
- [x] Pasos de aprobación configurables
- [x] Aprobadores por rol o usuario específico
- [x] Aprobación automática bajo condiciones
- [x] Bypass para usuarios privilegiados
- [x] Reglas de escalamiento por tiempo

---

## 🏗️ Implementación

**Services**:

- `FlowConfigurationService` - Configuración
- `FlowMatchingService` - Selección de flujo

**Commands**:

- `ConfigureFlowCommand`
- `MatchFlowCommand`

---

### Ejemplo de Flujo

```json
{
  "name": "Auditorios Gran Capacidad",
  "conditions": {
    "resourceType": "AUDITORIUM",
    "minCapacity": 200,
    "duration": ">4hours"
  },
  "steps": [
    {
      "order": 1,
      "approverRole": "COORDINATOR",
      "slaHours": 24
    },
    {
      "order": 2,
      "approverRole": "ADMIN",
      "slaHours": 48
    }
  ]
}
```

---

## 📚 Documentación Relacionada

- [Base de Datos](../DATABASE.md#2-approvalflow)

---

**Mantenedor**: Bookly Development Team
