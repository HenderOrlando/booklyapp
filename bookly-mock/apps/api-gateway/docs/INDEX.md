# API Gateway - Índice de Documentación

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Configuración](#configuración)
- [Integración](#integración)
- [Patrones Avanzados](#patrones-avanzados)

---

## 🏗️ Arquitectura

### [ARCHITECTURE.md](./ARCHITECTURE.md)

**Descripción**: Arquitectura general del API Gateway  
**Contenido**:

- Patrón de diseño y responsabilidades
- Componentes principales
- Flujo de peticiones
- Integración con microservicios

### [HYBRID_ARCHITECTURE.md](./HYBRID_ARCHITECTURE.md)

**Descripción**: Arquitectura híbrida implementada  
**Contenido**:

- Patrón REST + Event-Driven
- Comunicación síncrona y asíncrona
- Balance de carga y routing

---

## ⚙️ Configuración

### [REDIS_JWT_INTEGRATION.md](./REDIS_JWT_INTEGRATION.md)

**Descripción**: Integración de Redis para gestión de JWT y sesiones  
**Contenido**:

- Configuración de Redis
- Manejo de tokens JWT
- Cache de sesiones
- Estrategias de expiración

---

## 🔗 Integración

### [ENDPOINTS.md](./ENDPOINTS.md)

**Descripción**: Documentación completa de endpoints del API Gateway  
**Contenido**:

- Listado de rutas disponibles
- Métodos HTTP soportados
- Parámetros y respuestas
- Códigos de estado

### [INTEGRATION_FIX.md](./INTEGRATION_FIX.md)

**Descripción**: Correcciones y mejoras de integración  
**Contenido**:

- Problemas identificados
- Soluciones implementadas
- Best practices de integración

---

## 🚀 Patrones Avanzados

### [ADVANCED_PATTERNS.md](./ADVANCED_PATTERNS.md)

**Descripción**: Patrones avanzados de desarrollo  
**Contenido**:

- Circuit Breaker pattern
- Rate limiting
- Request/Response transformation
- Error handling strategies
- Logging y monitoring

---

## 📚 Recursos Adicionales

- **Swagger UI**: `/api/docs` (cuando el servicio está corriendo)
- **Health Check**: `/health`
- **Métricas**: `/metrics`

---

## 🔧 Mantenimiento

Para actualizar esta documentación:

1. Editar los archivos correspondientes en esta carpeta
2. Actualizar este índice si se agregan nuevos documentos
3. Mantener consistencia en formato y estructura

---

**Última actualización**: Noviembre 2024  
**Mantenido por**: Equipo Bookly
