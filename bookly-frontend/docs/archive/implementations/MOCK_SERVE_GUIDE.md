# 🔄 Guía del Sistema Mock/Serve

## 📋 ¿Qué es Mock/Serve?

Bookly frontend incluye un sistema configurable que te permite alternar entre dos modos de operación:

### 🎭 Modo MOCK

- **Datos quemados** (hardcoded) para desarrollo UI/UX
- **No requiere backend** activo
- Ideal para diseñar y probar interfaces
- Respuestas instantáneas con delay simulado
- Datos consistentes y predecibles

### 🌐 Modo SERVE

- **Datos reales** del backend bookly-mock
- **Requiere backend** corriendo
- Muestra errores si backend no está disponible
- Testing de integración real
- Comportamiento de producción

---

## ⚙️ Configuración

### 1. Variable de Entorno

Edita `.env.local`:

```bash
# mock: Datos quemados sin backend
# serve: Datos reales del backend
NEXT_PUBLIC_DATA_MODE=mock
```

### 2. Reiniciar Servidor

```bash
npm run dev
```

### 3. Verificar Modo Activo

En desarrollo, verás un indicador en la esquina inferior derecha:

- 🟡 **MOCK MODE** - Datos mockeados
- 🟢 **SERVE MODE** - Backend real

---

## 🎯 Cuándo Usar Cada Modo

### Usa MOCK cuando

- ✅ Diseñas nuevas interfaces
- ✅ El backend no está disponible
- ✅ Trabajas en UI/UX sin depender de datos reales
- ✅ Necesitas datos consistentes para testing visual
- ✅ Quieres desarrollo rápido sin delays de red

### Usa SERVE cuando

- ✅ Pruebas integración con backend
- ✅ Verificas flujos end-to-end
- ✅ Debugging de problemas de API
- ✅ Testing de casos reales
- ✅ Preparación para producción

---

## 📦 Datos Mock Disponibles

### Usuarios de Prueba

| Email                     | Password   | Rol         | Descripción               |
| ------------------------- | ---------- | ----------- | ------------------------- |
| `admin@ufps.edu.co`       | `admin123` | ADMIN       | Administrador del sistema |
| `coordinador@ufps.edu.co` | `coord123` | COORDINATOR | Coordinador de programa   |
| `profesor@ufps.edu.co`    | `prof123`  | PROFESSOR   | Profesor                  |
| `estudiante@ufps.edu.co`  | `est123`   | STUDENT     | Estudiante                |

### Datos Incluidos

- ✅ **Usuarios**: 4 usuarios con diferentes roles
- ✅ **Roles**: 4 roles del sistema (Admin, Coordinator, Professor, Student)
- ✅ **Permisos**: 15 permisos granulares
- ⏳ **Recursos**: (próximamente)
- ⏳ **Reservas**: (próximamente)
- ⏳ **Aprobaciones**: (próximamente)

---

## 🔧 Implementación Técnica

### Arquitectura

```
Usuario hace request
       ↓
HttpClient detecta modo
       ↓
¿isMockMode()?
   ↙        ↘
 SI          NO
   ↓          ↓
MockService  Axios → Backend
   ↓          ↓
Datos mock  Datos reales
   ↓          ↓
   └─────┬────┘
         ↓
    Respuesta a UI
```

### Archivos Clave

```
src/
├── lib/
│   └── config.ts                          # Configuración y modo
├── infrastructure/
│   ├── api/
│   │   └── httpClient.ts                  # Cliente HTTP con switch
│   └── mock/
│       ├── mockData.ts                    # Datos quemados
│       └── mockService.ts                 # Servicio de mock
└── components/molecules/
    └── DataModeIndicator/                 # Indicador visual
```

### Extender Datos Mock

Para agregar más datos mock, edita `mockData.ts`:

```typescript
// src/infrastructure/mock/mockData.ts

export const mockResources = [
  {
    id: "res_1",
    name: "Sala 101",
    type: "CLASSROOM",
    capacity: 30,
    // ... más campos
  },
];
```

Y actualiza `mockService.ts`:

```typescript
// src/infrastructure/mock/mockService.ts

private static mockGetResources(): ApiResponse<any> {
  return {
    success: true,
    data: {
      items: mockResources,
      meta: { /* ... */ },
    },
    timestamp: new Date().toISOString(),
  };
}
```

---

## 🐛 Troubleshooting

### El indicador no aparece

**Solución**: El indicador solo aparece en modo desarrollo (`NODE_ENV=development`)

### Errores "Mock no implementado"

**Causa**: El endpoint solicitado no tiene implementación mock

**Solución**:

1. Cambia a modo `serve` temporalmente
2. O implementa el mock en `mockService.ts`

### Backend no responde en modo SERVE

**Síntomas**: Errores "NETWORK_ERROR" en consola

**Solución**:

1. Verifica que backend esté corriendo: `http://localhost:3000`
2. Revisa logs del backend
3. Cambia a modo `mock` temporalmente

---

## 📝 Ejemplo de Uso

### Desarrollo de Login UI

```bash
# 1. Configura modo mock
NEXT_PUBLIC_DATA_MODE=mock

# 2. Reinicia servidor
npm run dev

# 3. Navega a /auth/login
# 4. Usa credenciales mock:
#    Email: admin@ufps.edu.co
#    Password: admin123

# 5. ¡Login exitoso sin backend!
```

### Testing de Integración

```bash
# 1. Asegura que backend esté corriendo
cd ../bookly-mock
npm run start:dev

# 2. Configura modo serve
NEXT_PUBLIC_DATA_MODE=serve

# 3. Reinicia frontend
cd ../bookly-mock-frontend
npm run dev

# 4. Prueba flujos reales
```

---

## 🚀 Mejores Prácticas

### Durante Desarrollo

1. ✅ Usa `mock` para diseño UI/UX
2. ✅ Crea componentes sin depender de backend
3. ✅ Valida estilos y flujos visuales
4. ✅ Cambia a `serve` para testing final

### Antes de Pull Request

1. ✅ Prueba en modo `serve` con backend
2. ✅ Verifica que todos los endpoints funcionen
3. ✅ Documenta nuevos mocks agregados
4. ✅ Asegura que ambos modos funcionen

### En Producción

- 🚫 **Modo MOCK está deshabilitado automáticamente**
- ✅ Solo modo `serve` está disponible
- ✅ Indicador visual no se muestra

---

## 📊 Estado de Implementación

| Feature             | Estado | Notas                     |
| ------------------- | ------ | ------------------------- |
| Switch Mock/Serve   | ✅     | Completamente funcional   |
| Indicador Visual    | ✅     | Solo en desarrollo        |
| Auth Mock Data      | ✅     | Login, registro, usuarios |
| Users Mock Data     | ✅     | 4 usuarios de prueba      |
| Roles & Permissions | ✅     | Sistema completo          |
| Resources Mock      | ⏳     | Pendiente Fase 3          |
| Reservations Mock   | ⏳     | Pendiente Fase 4          |
| Reports Mock        | ⏳     | Pendiente Fase 6          |

---

## 🎉 Beneficios

### Para Developers Frontend

- 🚀 Desarrollo más rápido
- 🎨 Enfoque en UI/UX sin bloqueos
- 🧪 Testing visual consistente
- 💡 Prototipado ágil

### Para el Equipo

- 🤝 Desarrollo paralelo (frontend/backend)
- 🔄 Menos dependencias entre equipos
- 📈 Mayor productividad
- ✅ Testing más completo

---

**Última actualización**: 2025-11-20  
**Versión**: 1.0
