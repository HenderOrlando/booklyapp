# 🎨 UX/UI Spec: Mejora de Reasignación de Recursos

## 1. UX Brief (SK-UXUI-001)
- **Persona:** Administrador de Espacios / Coordinador.
- **Objetivo:** Resolver conflictos de disponibilidad o fallos en recursos de manera proactiva y sin fricción.
- **Contexto:** Se recibe una alerta de que un aula está en mantenimiento. El admin necesita mover todas las clases de esa semana a lugares similares.
- **Success Criteria:** 
  - El admin puede ver claramente por qué se sugiere un recurso (Similarity Score).
  - La comparativa "Original vs Nuevo" es instantánea.
  - La comunicación al usuario final es automática pero personalizable.

## 2. User Flow (Improved)
1. **Trigger:** El admin selecciona una reserva con conflicto.
2. **Analysis:** El sistema invoca el algoritmo de similitud (backend).
3. **Disclosure:** Se despliega un panel lateral o modal con:
   - Resumen del recurso original (Capacidad, Ubicación, Equipamiento).
   - Lista de Top 3 alternativas con % de similitud.
4. **Action:** El admin selecciona una alternativa.
5. **Confirmation:** Se muestra un "Diff" visual de los cambios.
6. **Execution:** Se confirma la reasignación y se dispara la notificación (RabbitMQ -> WhatsApp/Email).

## 3. UI Spec & Components
### A. ReasignacionPage (Dashboard de Solicitudes)
- **Skeleton Loaders:** Para la carga de sugerencias desde el backend.
- **Empty State:** Ilustración amigable cuando no hay reasignaciones pendientes.
- **Similarity Badge:** Colores semánticos según el score (90%+ Verde, 70-90% Amarillo, <70% Rojo).

### B. ResourceComparisonCard (Nuevo Componente)
- **Lado a Lado:** Comparación de atributos clave (Capacidad, Piso, Edificio).
- **Highlight:** Resaltar diferencias (ej. "Pierde: Proyector", "Gana: AC").

### C. ReassignmentModal (Refactor)
- **Pasos:** 
  1. Selección de motivo.
  2. Ajuste de pesos del algoritmo (opcional).
  3. Selección de alternativa.
  4. Vista previa de notificación.

## 4. A11y Checklist
- [ ] Roles de ARIA para el listado de sugerencias (`listbox`).
- [ ] Contraste de texto en los Badges de Similitud (WCAG AA).
- [ ] Navegación completa por teclado (Tab order lógico).
- [ ] Labels descriptivos para los sliders de "pesos" del algoritmo.

## 5. Next Steps (Accionables)
1. Ajustar DTOs en el backend para permitir `reasonDetails` y `notifyUser` en el historial.
2. Implementar `useReassignment` hook en el frontend.
3. Actualizar `ReasignacionPage` con los nuevos componentes de comparación.
