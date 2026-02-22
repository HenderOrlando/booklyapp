# 🚀 Instrucciones de Setup - Bookly Mock Frontend

## ✅ Progreso Actual

### Fase 1 - Fundación (En Progreso)

- ✅ **Fase 1.1**: Setup inicial de Next.js 14+ con TypeScript
- 🔄 **Fase 1.2**: Configurar Tailwind CSS y Shadcn/ui
- ✅ **Fase 1.3**: Estructura de carpetas (Clean Architecture)
- ✅ **Fase 1.4**: Cliente HTTP base y manejo de errores
- ⏳ **Fase 1.5**: Sistema de autenticación básico
- 🔄 **Fase 1.6**: Componentes atómicos base

## 📦 Lo que se ha creado

### Configuración Base

- ✅ `package.json` con todas las dependencias
- ✅ `tsconfig.json` con paths alias configurados
- ✅ `next.config.js` con rewrites y optimizaciones
- ✅ `tailwind.config.ts` con tema personalizado
- ✅ `postcss.config.js` para Tailwind
- ✅ `.gitignore` completo
- ✅ `.env.local.example` con variables necesarias

### Estructura de Carpetas

```
src/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 ✅ Root layout
│   ├── page.tsx                   ✅ Home page
│   ├── providers.tsx              ✅ Providers wrapper
│   └── globals.css                ✅ Estilos globales
│
├── components/                    # Atomic Design
│   ├── atoms/
│   │   ├── Button/               ✅ Button component
│   │   ├── Input/                ✅ Input component
│   │   └── Card/                 ✅ Card components
│   ├── molecules/                ⏳
│   ├── organisms/                ⏳
│   └── templates/                ⏳
│
├── infrastructure/                # Adaptadores
│   ├── api/
│   │   └── httpClient.ts         ✅ Cliente HTTP con interceptores
│   └── websocket/
│       └── WebSocketProvider.tsx ✅ WebSocket provider
│
├── store/                         # Redux Toolkit
│   ├── store.ts                  ✅ Store configuration
│   ├── slices/                   ⏳
│   └── api/                      ⏳
│
├── hooks/                         # Custom Hooks
│   └── useAuth.ts                ✅ Auth hook
│
├── lib/                           # Utilities
│   └── utils.ts                  ✅ Helper functions
│
└── types/                         # TypeScript Types
    ├── api/
    │   └── response.ts           ✅ API response types
    └── entities/
        ├── user.ts               ✅ User types
        └── auth.ts               ✅ Auth types
```

## 🛠️ Próximos Pasos

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores:

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXTAUTH_URL=http://localhost:4200
NEXTAUTH_SECRET=tu-clave-secreta-aqui
```

### 2. Instalar Dependencia Faltante

```bash
npm install tailwindcss-animate
```

### 3. Ejecutar el Proyecto

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:4200`

### 4. Verificar Backend

Asegúrate de que el backend bookly-mock esté corriendo:

```bash
# En el directorio bookly-mock
cd ../bookly-mock
npm run start:dev
```

Verifica que los servicios estén activos:

- API Gateway: <http://localhost:3000>
- Auth Service: <http://localhost:3001>
- Resources Service: <http://localhost:3002>
- Availability Service: <http://localhost:3003>
- Stockpile Service: <http://localhost:3004>
- Reports Service: <http://localhost:3005>

## 📋 Tareas Pendientes

### Componentes Atómicos Adicionales

- [ ] Label
- [ ] Badge
- [ ] Avatar
- [ ] Spinner/Loading
- [ ] Alert
- [ ] Tooltip
- [ ] Separator
- [ ] Checkbox
- [ ] Radio
- [ ] Switch
- [ ] Textarea
- [ ] Select

### Componentes Moleculares

- [ ] FormField (Input + Label + Error)
- [ ] SearchBar
- [ ] DatePicker
- [ ] Pagination
- [ ] Breadcrumb
- [ ] EmptyState
- [ ] ErrorBoundary

### Auth Service Integration

- [ ] Configurar NextAuth.js
- [ ] Página de Login
- [ ] Página de Registro
- [ ] Recuperar contraseña
- [ ] API endpoints para auth
- [ ] Protected routes middleware

### Redux Store

- [ ] Auth slice
- [ ] Auth API (RTK Query)
- [ ] Hooks de Redux (useAppDispatch, useAppSelector)

## 🔍 Verificación

Para verificar que todo está configurado correctamente:

```bash
# Type-check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [NextAuth.js](https://next-auth.js.org)

## 🐛 Solución de Problemas

### Error: Cannot find module 'tailwindcss-animate'

```bash
npm install tailwindcss-animate
```

### Error: TypeScript errors about missing types

```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

### Puerto 4200 en uso

Cambia el puerto en package.json:

```json
"dev": "next dev -p 4300"
```

---

**Estado**: Fase 1 - 70% completada  
**Próxima fase**: Sistema de autenticación con NextAuth.js  
**Última actualización**: 2025-11-20
