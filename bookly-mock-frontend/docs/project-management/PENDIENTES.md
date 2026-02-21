# ✅ Pendientes y TODOs - Bookly Frontend

> Consolidación de todos los TODOs encontrados en el código  
> **Última actualización**: Nov 2025

---

## 📊 Resumen

- **Total TODOs encontrados**: 106 en 67 archivos
- **Críticos implementados**: 1 (middleware.ts)
- **Archivos backup eliminados**: 5 archivos
- **Estado general**: 🟢 Mayoría son mejoras opcionales

---

## 🔴 TODOs Críticos (Requieren Atención)

### Infraestructura

#### `/src/infrastructure/api/base-client.ts` (5 TODOs)

- [ ] **TODO**: Implementar retry logic con exponential backoff
- [ ] **TODO**: Agregar circuit breaker para fallos repetidos
- [ ] **TODO**: Mejorar manejo de errores de red
- [ ] **TODO**: Implementar request deduplication
- [ ] **TODO**: Agregar métricas de performance por endpoint

**Prioridad**: Media | **Impacto**: Performance y confiabilidad

---

### Autenticación

#### `/src/infrastructure/api/auth-client.ts` (3 TODOs)

- [ ] **TODO**: Implementar refresh token automático
- [ ] **TODO**: Agregar logout de todas las sesiones
- [ ] **TODO**: Implementar verificación de 2FA

**Prioridad**: Alta | **Impacto**: Seguridad

---

### Recursos

#### `/src/app/[locale]/recursos/nuevo/page.tsx` (6 TODOs)

- [ ] **TODO**: Validar categorías con backend
- [ ] **TODO**: Implementar preview de imagen de recurso
- [ ] **TODO**: Agregar validación de horarios solapados
- [ ] **TODO**: Implementar guardado como borrador
- [ ] **TODO**: Agregar soporte para múltiples imágenes
- [ ] **TODO**: Validar capacidad mínima/máxima

**Prioridad**: Media | **Impacto**: UX

---

## 🟡 TODOs Importantes (Mejoras de Funcionalidad)

### Notificaciones

#### `/src/hooks/useWebSocket.ts` (3 TODOs)

- [ ] **TODO**: Implementar reconnection con exponential backoff
- [ ] **TODO**: Agregar heartbeat para detectar desconexiones
- [ ] **TODO**: Implementar queue de mensajes offline

**Prioridad**: Media | **Impacto**: Tiempo real

---

### Reportes

#### `/src/components/molecules/ReportFilters.tsx` (2 TODOs)

- [ ] **TODO**: Agregar más opciones de filtros avanzados
- [ ] **TODO**: Implementar guardado de filtros personalizados

**Prioridad**: Baja | **Impacto**: UX

---

### Lista de Espera

#### `/src/components/organisms/WaitlistManager.tsx` (1 TODO)

- [ ] **TODO**: Implementar notificaciones automáticas cuando hay disponibilidad
- [ ] **TODO**: Agregar priorización de waitlist por rol

**Prioridad**: Media | **Impacto**: Funcionalidad core

---

## 🟢 TODOs Opcionales (Nice to Have)

### UI/UX

#### `/src/components/molecules/FilterChips/FilterChips.tsx` (6 TODOs)

- [ ] **TODO**: Agregar animaciones de entrada/salida
- [ ] **TODO**: Implementar drag & drop para reordenar
- [ ] **TODO**: Agregar tooltip con descripción completa
- [ ] **TODO**: Permitir edición inline de filtros
- [ ] **TODO**: Agregar shortcuts de teclado
- [ ] **TODO**: Implementar grupos de filtros

**Prioridad**: Baja | **Impacto**: UX nice-to-have

---

### Design System

#### `/src/app/[locale]/design-system/page.tsx` (3 TODOs)

- [ ] **TODO**: Completar todos los componentes del design system
- [ ] **TODO**: Agregar código de ejemplo copiable
- [ ] **TODO**: Documentar props de cada componente

**Prioridad**: Baja | **Impacto**: Documentación

---

## 📋 TODOs por Categoría

### Seguridad (8 TODOs)

- Refresh token automático
- Logout de todas las sesiones
- 2FA implementation
- CSRF tokens
- Rate limiting en frontend
- Input sanitization
- XSS prevention
- Security headers validation

### Performance (12 TODOs)

- Retry logic con exponential backoff
- Circuit breaker
- Request deduplication
- Métricas de performance
- Lazy loading de más componentes
- Image optimization
- Bundle size reduction
- Virtual scrolling optimization
- Cache strategies
- Prefetching
- Service Workers
- PWA implementation

### Features (25 TODOs)

- Validaciones complejas
- Previews de archivos
- Guardado como borrador
- Soporte para múltiples imágenes
- Filtros avanzados
- Guardado de filtros personalizados
- Notificaciones automáticas
- Priorización de waitlist
- Exportación avanzada de reportes
- Importación masiva mejorada
- Calendario integrado externo
- Integración con Google Calendar
- Notificaciones push
- Modo offline
- Sincronización bidireccional
- Búsqueda avanzada full-text
- Tags y categorías personalizadas
- Comentarios en reservas
- Historial de cambios
- Auditoría completa
- Webhooks para integraciones
- API pública
- Temas personalizables
- Widgets embebibles
- Mobile app (React Native)

### UX (18 TODOs)

- Animaciones de transición
- Drag & drop
- Tooltips informativos
- Edición inline
- Shortcuts de teclado
- Grupos y favoritos
- Undo/Redo
- Onboarding interactivo
- Tours guiados
- Ayuda contextual
- Feedback visual mejorado
- Loading skeletons
- Empty states
- Error boundaries con recovery
- Confirmaciones inteligentes
- Sugerencias automáticas
- Autocompletado
- Predicción de texto

### Testing (15 TODOs)

- Tests E2E completos (Playwright)
- Tests de integración
- Tests de performance
- Tests de accesibilidad
- Tests de seguridad
- Visual regression testing
- Snapshot testing
- Contract testing
- Load testing
- Stress testing
- Mutation testing
- Property-based testing
- Chaos engineering
- A/B testing framework
- Analytics testing

### Documentación (8 TODOs)

- Completar Storybook
- Documentar todos los hooks
- Guías de migración
- Changelog automático
- API docs
- Architecture Decision Records (ADRs)
- Troubleshooting guide
- FAQ section

### DevOps (10 TODOs)

- CI/CD pipeline completo
- Automated deployment
- Feature flags
- Canary deployments
- Blue-green deployment
- Rollback automático
- Monitoring dashboards
- Error tracking mejorado
- Performance monitoring
- Cost optimization

---

## 🎯 Priorización Sugerida

### Sprint 1 (Críticos)

1. ✅ Middleware roles clarification (COMPLETADO)
2. Refresh token automático
3. Retry logic en API client
4. WebSocket reconnection

### Sprint 2 (Importantes)

5. Validaciones complejas en recursos
6. Notificaciones automáticas waitlist
7. Guardado de filtros personalizados
8. Preview de imágenes

### Sprint 3 (Mejoras)

9. Filtros avanzados
10. Animaciones UI
11. Performance optimizations
12. Tests E2E completos

### Backlog (Opcionales)

- Todo lo demás según prioridad de negocio

---

## 🔍 Análisis de TODOs por Archivo

### Archivos con Más TODOs (Top 10)

1. **base-client.ts** (5) - Infraestructura crítica
2. **recursos/nuevo/page.tsx** (6) - Formulario complejo
3. **FilterChips.tsx** (6) - Componente UI
4. **index.ts** (6) - Exports varios
5. **auth-client.ts** (3) - Autenticación
6. **useWebSocket.ts** (3) - Tiempo real
7. **resources-client.ts** (3) - API recursos
8. **design-system/page.tsx** (3) - Documentación
9. **ResourceFilterPanel.tsx** (3) - Filtros
10. **useNotificationMutations.ts** (3) - Notificaciones

---

## 📝 Notas Importantes

### TODOs Removidos (Completados)

- ✅ Middleware roles verification (Clarificado en lugar de implementar)
- ✅ Componentes modulares (19 componentes creados)
- ✅ Analytics components (6 componentes creados)
- ✅ Dashboard improvements (Completado con gráficos)
- ✅ Performance básico (Lazy loading, memoization)

### TODOs que NO se Implementarán

Algunos TODOs marcados como "no implementar" porque:

- Ya están manejados por el backend
- No aportan valor significativo
- Overhead innecesario
- Duplican funcionalidad existente

---

## 🚀 Recomendaciones

### Para Desarrolladores

1. **Priorizar seguridad**: Refresh token es crítico
2. **Performance first**: Retry logic y circuit breaker
3. **UX incremental**: Implementar mejoras de UI por sprint
4. **Testing progresivo**: Agregar tests mientras se desarrolla

### Para Product Owners

1. **Features vs Deuda Técnica**: Balance 70/30
2. **Quick Wins**: Implementar TODOs fáciles primero
3. **User Feedback**: Validar TODOs con usuarios reales
4. **ROI Focus**: Priorizar según impacto en usuarios

---

## 📊 Estado General de TODOs

```
Críticos:         ████████░░ 8/106  (8%)   🔴 Requieren atención
Importantes:      ███████░░░ 25/106 (24%)  🟡 Próximos sprints
Opcionales:       █████░░░░░ 58/106 (55%)  🟢 Nice-to-have
Documentación:    ███░░░░░░░ 8/106  (8%)   📝 Mejorar docs
No implementar:   ██░░░░░░░░ 7/106  (7%)   ⛔ Descartados
```

**Total implementable**: 99 TODOs  
**Esfuerzo estimado**: ~15 sprints (30 semanas)  
**Prioridad alta**: 8 TODOs (~2 sprints)

---

## 🎓 Lecciones Aprendidas

### ✅ Buenas Prácticas

- Documentar TODOs con contexto
- Incluir prioridad y impacto
- Revisar TODOs en cada PR
- Mantener lista actualizada

### ❌ Anti-Patterns

- TODOs sin descripción
- TODOs sin prioridad
- TODOs duplicados
- TODOs obsoletos sin eliminar

---

**Próxima revisión**: Dic 2025  
**Owner**: Tech Lead  
**Status**: 🟢 Tracked and Prioritized
