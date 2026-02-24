# 🔐 Auth Service - Plan de Frontend

**Microservicio**: Auth Service (Puerto 3001)  
**Requerimientos Funcionales**: RF-41 a RF-45  
**Endpoints Base**: `/api/v1/auth/*`, `/api/v1/users/*`, `/api/v1/roles/*`, `/api/v1/permissions/*`, `/api/v1/audit/*`

---

## 📋 Tabla de Contenidos

- [Requerimientos Funcionales](#requerimientos-funcionales)
- [Endpoints HTTP Disponibles](#endpoints-http-disponibles)
- [Páginas a Implementar](#páginas-a-implementar)
- [Componentes Necesarios](#componentes-necesarios)
- [Store y Estado](#store-y-estado)
- [Tipos TypeScript](#tipos-typescript)
- [Casos de Uso](#casos-de-uso)

---

## 📌 Requerimientos Funcionales

### RF-41: Gestión de Roles y Permisos

**Descripción**: Sistema granular de roles con permisos específicos (resource:action)

**Funcionalidades Frontend**:

- Lista de roles con búsqueda y filtros
- Crear/editar roles personalizados
- Asignar/remover permisos a roles
- Visualizar permisos por recurso
- Roles predefinidos no editables (6 roles del sistema)

### RF-42: Restricción de Modificación

**Descripción**: Solo administradores pueden modificar recursos

**Funcionalidades Frontend**:

- Guards de rutas basados en permisos
- Deshabilitar botones según permisos
- Mensajes claros de permisos insuficientes
- Doble confirmación para eliminaciones

### RF-43: Autenticación y SSO

**Descripción**: Login tradicional + SSO con Google Workspace

**Funcionalidades Frontend**:

- Formulario de login/registro
- Botón "Continuar con Google"
- Recuperación de contraseña
- Cambio de contraseña
- Validación de sesión persistente

### RF-44: Sistema de Auditoría

**Descripción**: Registro completo de acciones del sistema

**Funcionalidades Frontend**:

- Dashboard de auditoría con filtros
- Línea de tiempo de eventos
- Exportación de logs (CSV)
- Alertas de actividad sospechosa
- Estadísticas de uso por usuario

### RF-45: Autenticación de Dos Factores (2FA)

**Descripción**: Capa adicional de seguridad con TOTP

**Funcionalidades Frontend**:

- Configuración de 2FA (QR code)
- Ingreso de código 2FA en login
- Generación de códigos de respaldo
- Deshabilitar 2FA

---

## 🌐 Endpoints HTTP Disponibles

### Autenticación

```typescript
POST   /api/v1/auth/register           // Registrar nuevo usuario
POST   /api/v1/auth/login              // Iniciar sesión
POST   /api/v1/auth/logout             // Cerrar sesión
POST   /api/v1/auth/refresh            // Renovar access token
POST   /api/v1/auth/forgot-password    // Solicitar recuperación
POST   /api/v1/auth/reset-password     // Restablecer contraseña
POST   /api/v1/auth/change-password    // Cambiar contraseña
GET    /api/v1/auth/validate-token     // Validar token actual

// SSO
GET    /api/v1/auth/google             // Iniciar OAuth Google
GET    /api/v1/auth/google/callback    // Callback OAuth Google

// 2FA
POST   /api/v1/auth/2fa/setup          // Configurar 2FA (obtener QR)
POST   /api/v1/auth/2fa/enable         // Activar 2FA
POST   /api/v1/auth/2fa/disable        // Desactivar 2FA
POST   /api/v1/auth/2fa/verify         // Verificar código 2FA
POST   /api/v1/auth/2fa/backup-codes   // Regenerar códigos de respaldo
POST   /api/v1/auth/login-2fa          // Login con 2FA
POST   /api/v1/auth/backup-code        // Login con código de respaldo
```

### Usuarios

```typescript
GET    /api/v1/users/me                // Perfil del usuario actual
PATCH  /api/v1/users/me                // Actualizar perfil
GET    /api/v1/users                   // Listar usuarios (paginado)
GET    /api/v1/users/:id               // Obtener usuario por ID
PATCH  /api/v1/users/:id               // Actualizar usuario
DELETE /api/v1/users/:id               // Eliminar usuario
POST   /api/v1/users/:id/roles         // Asignar roles a usuario
DELETE /api/v1/users/:id/roles/:roleId // Remover rol de usuario
```

### Roles

```typescript
GET    /api/v1/roles                   // Listar roles
POST   /api/v1/roles                   // Crear rol
GET    /api/v1/roles/:id               // Obtener rol por ID
PATCH  /api/v1/roles/:id               // Actualizar rol
DELETE /api/v1/roles/:id               // Eliminar rol
GET    /api/v1/roles/filter/active     // Roles activos
GET    /api/v1/roles/filter/system     // Roles del sistema
POST   /api/v1/roles/:id/permissions   // Asignar permisos
DELETE /api/v1/roles/:id/permissions   // Remover permisos
```

### Permisos

```typescript
GET    /api/v1/permissions                  // Listar permisos
POST   /api/v1/permissions                  // Crear permiso
GET    /api/v1/permissions/:id              // Obtener permiso
PATCH  /api/v1/permissions/:id              // Actualizar permiso
DELETE /api/v1/permissions/:id              // Eliminar permiso
GET    /api/v1/permissions/module/:resource // Permisos por recurso
GET    /api/v1/permissions/active           // Permisos activos
POST   /api/v1/permissions/bulk             // Crear múltiples
```

### Auditoría

```typescript
GET    /api/v1/audit/user/:userId       // Logs de un usuario
GET    /api/v1/audit/resource            // Logs de un recurso
GET    /api/v1/audit/failed-attempts     // Intentos fallidos
GET    /api/v1/audit/export/csv          // Exportar logs CSV
GET    /api/v1/audit/cleanup             // Limpiar logs antiguos
```

---

## 📄 Páginas a Implementar

### 1. Autenticación

#### `/login` - Página de Inicio de Sesión

```typescript
// app/(auth)/login/page.tsx
"use client";

interface LoginPageProps {}

export default function LoginPage() {
  return (
    <AuthTemplate>
      <LoginForm />
      <SSOButtons />
      <ForgotPasswordLink />
    </AuthTemplate>
  );
}
```

**Componentes**:

- `LoginForm`: Formulario email/password
- `SSOButtons`: Botones de SSO (Google)
- `TwoFactorModal`: Modal para código 2FA
- `ForgotPasswordLink`: Link a recuperación

#### `/register` - Registro de Usuario

```typescript
// app/(auth)/register/page.tsx
"use client";

export default function RegisterPage() {
  return (
    <AuthTemplate>
      <RegisterForm />
      <LoginLink />
    </AuthTemplate>
  );
}
```

#### `/forgot-password` - Recuperación de Contraseña

```typescript
// app/(auth)/forgot-password/page.tsx
"use client";

export default function ForgotPasswordPage() {
  return (
    <AuthTemplate>
      <ForgotPasswordForm />
    </AuthTemplate>
  );
}
```

### 2. Perfil de Usuario

#### `/dashboard/profile` - Perfil Personal

```typescript
// app/(dashboard)/profile/page.tsx
"use client";

export default function ProfilePage() {
  return (
    <DashboardTemplate>
      <ProfileHeader />
      <Tabs>
        <TabPanel value="general">
          <ProfileForm />
        </TabPanel>
        <TabPanel value="security">
          <ChangePasswordForm />
          <TwoFactorSettings />
        </TabPanel>
        <TabPanel value="activity">
          <UserActivityLog />
        </TabPanel>
      </Tabs>
    </DashboardTemplate>
  );
}
```

### 3. Administración de Usuarios

#### `/dashboard/admin/users` - Lista de Usuarios

```typescript
// app/(dashboard)/admin/users/page.tsx
"use client";

export default function UsersPage() {
  return (
    <DashboardTemplate>
      <PageHeader title="Gestión de Usuarios" actions={<CreateUserButton />} />
      <UsersFilter />
      <UsersTable />
      <Pagination />
    </DashboardTemplate>
  );
}
```

#### `/dashboard/admin/users/[id]` - Detalle de Usuario

```typescript
// app/(dashboard)/admin/users/[id]/page.tsx
"use client";

export default function UserDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardTemplate>
      <UserHeader />
      <Tabs>
        <TabPanel value="info">
          <UserInfoForm />
        </TabPanel>
        <TabPanel value="roles">
          <UserRolesManager />
        </TabPanel>
        <TabPanel value="activity">
          <UserAuditLog />
        </TabPanel>
      </Tabs>
    </DashboardTemplate>
  );
}
```

### 4. Administración de Roles

#### `/dashboard/admin/roles` - Gestión de Roles

```typescript
// app/(dashboard)/admin/roles/page.tsx
"use client";

export default function RolesPage() {
  return (
    <DashboardTemplate>
      <PageHeader title="Gestión de Roles" actions={<CreateRoleButton />} />
      <RolesGrid />
    </DashboardTemplate>
  );
}
```

#### `/dashboard/admin/roles/[id]` - Editar Rol

```typescript
// app/(dashboard)/admin/roles/[id]/page.tsx
"use client";

export default function RoleEditPage({ params }: { params: { id: string } }) {
  return (
    <DashboardTemplate>
      <RoleForm />
      <PermissionsManager />
      <SaveButton />
    </DashboardTemplate>
  );
}
```

### 5. Auditoría

#### `/dashboard/admin/audit` - Dashboard de Auditoría

```typescript
// app/(dashboard)/admin/audit/page.tsx
"use client";

export default function AuditPage() {
  return (
    <DashboardTemplate>
      <AuditStats />
      <AuditFilters />
      <AuditTimeline />
      <ExportButton />
    </DashboardTemplate>
  );
}
```

---

## 🧩 Componentes Necesarios

### Atoms

```typescript
// components/atoms/Button/AuthButton.tsx
interface AuthButtonProps {
  provider: "google" | "microsoft";
  onClick: () => void;
}

// components/atoms/Input/PasswordInput.tsx
interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  showStrength?: boolean;
}

// components/atoms/Badge/RoleBadge.tsx
interface RoleBadgeProps {
  role: string;
  isPredefined?: boolean;
}

// components/atoms/Badge/PermissionBadge.tsx
interface PermissionBadgeProps {
  permission: string; // "resource:action"
}
```

### Molecules

```typescript
// components/molecules/LoginForm/LoginForm.tsx
interface LoginFormProps {
  onSubmit: (credentials: LoginDto) => void;
  isLoading?: boolean;
}

// components/molecules/TwoFactorInput/TwoFactorInput.tsx
interface TwoFactorInputProps {
  onSubmit: (code: string) => void;
  onUseBackupCode: () => void;
}

// components/molecules/RoleSelector/RoleSelector.tsx
interface RoleSelectorProps {
  selectedRoles: string[];
  onChange: (roles: string[]) => void;
  availableRoles: Role[];
}

// components/molecules/PermissionsMatrix/PermissionsMatrix.tsx
interface PermissionsMatrixProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onToggle: (permissionId: string) => void;
  groupByResource?: boolean;
}
```

### Organisms

```typescript
// components/organisms/UsersTable/UsersTable.tsx
interface UsersTableProps {
  users: User[];
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
  onAssignRole: (userId: string) => void;
}

// components/organisms/AuditTimeline/AuditTimeline.tsx
interface AuditTimelineProps {
  logs: AuditLog[];
  filters?: AuditFilters;
  onFilterChange: (filters: AuditFilters) => void;
}

// components/organisms/TwoFactorSetup/TwoFactorSetup.tsx
interface TwoFactorSetupProps {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
  onEnable: (code: string) => void;
}
```

---

## 🗄️ Store y Estado

### Auth Slice

```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  is2FARequired: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  is2FARequired: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    require2FA: (state) => {
      state.is2FARequired = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.is2FARequired = false;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setCredentials, require2FA, logout, setError } =
  authSlice.actions;
export default authSlice.reducer;
```

### RTK Query API

```typescript
// store/api/authApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL + "/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Role", "Permission", "Audit"],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<LoginResponse, LoginDto>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterDto>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenDto>({
      query: (data) => ({
        url: "/auth/refresh",
        method: "POST",
        body: data,
      }),
    }),

    // Users
    getMe: builder.query<User, void>({
      query: () => "/users/me",
      providesTags: ["User"],
    }),
    getUsers: builder.query<PaginatedResponse<User>, QueryParams>({
      query: (params) => ({
        url: "/users",
        params,
      }),
      providesTags: ["User"],
    }),
    updateUser: builder.mutation<User, { id: string; data: UpdateUserDto }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Roles
    getRoles: builder.query<Role[], void>({
      query: () => "/roles",
      providesTags: ["Role"],
    }),
    createRole: builder.mutation<Role, CreateRoleDto>({
      query: (data) => ({
        url: "/roles",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Role"],
    }),
    assignPermissions: builder.mutation<
      void,
      { roleId: string; permissionIds: string[] }
    >({
      query: ({ roleId, permissionIds }) => ({
        url: `/roles/${roleId}/permissions`,
        method: "POST",
        body: { permissionIds },
      }),
      invalidatesTags: ["Role"],
    }),

    // 2FA
    setup2FA: builder.mutation<Setup2FAResponse, void>({
      query: () => ({
        url: "/auth/2fa/setup",
        method: "POST",
      }),
    }),
    enable2FA: builder.mutation<void, Enable2FADto>({
      query: (data) => ({
        url: "/auth/2fa/enable",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useGetRolesQuery,
  useCreateRoleMutation,
  useAssignPermissionsMutation,
  useSetup2FAMutation,
  useEnable2FAMutation,
} = authApi;
```

---

## 📐 Tipos TypeScript

```typescript
// types/api/auth.ts

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  is2FAEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  isDefault: boolean;
  isPredefined: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resource: string;
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  status: "SUCCESS" | "FAILED";
  executionTime?: number;
  changes?: Record<string, any>;
  error?: string;
  timestamp: string;
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  VIEW = "VIEW",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
}

// DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Enable2FADto {
  code: string;
}

export interface Setup2FAResponse {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
}
```

---

## 🎯 Casos de Uso

### 1. Login con Email/Password

```typescript
// hooks/useLogin.ts
export const useLogin = () => {
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (credentials: LoginDto) => {
    try {
      const response = await login(credentials).unwrap();

      if (response.requires2FA) {
        dispatch(require2FA());
        return { success: true, requires2FA: true };
      }

      dispatch(
        setCredentials({
          user: response.data.user,
          accessToken: response.data.accessToken,
        })
      );

      return { success: true, requires2FA: false };
    } catch (error) {
      dispatch(setError(error.message));
      return { success: false, error };
    }
  };

  return { handleLogin, isLoading };
};
```

### 2. Configurar 2FA

```typescript
// hooks/useSetup2FA.ts
export const useSetup2FA = () => {
  const [setup2FA] = useSetup2FAMutation();
  const [enable2FA] = useEnable2FAMutation();

  const setupAndEnable = async (verificationCode: string) => {
    try {
      // 1. Obtener QR y secret
      const setupResponse = await setup2FA().unwrap();

      // 2. Usuario escanea QR y obtiene código
      // 3. Verificar código y activar
      await enable2FA({ code: verificationCode }).unwrap();

      return {
        success: true,
        backupCodes: setupResponse.data.backupCodes,
      };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { setupAndEnable };
};
```

### 3. Asignar Permisos a Rol

```typescript
// hooks/useRolePermissions.ts
export const useRolePermissions = (roleId: string) => {
  const [assignPermissions] = useAssignPermissionsMutation();
  const { data: permissions } = useGetPermissionsQuery();

  const handleAssign = async (permissionIds: string[]) => {
    try {
      await assignPermissions({ roleId, permissionIds }).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { handleAssign, availablePermissions: permissions };
};
```

### 4. Exportar Logs de Auditoría

```typescript
// hooks/useAuditExport.ts
export const useAuditExport = () => {
  const exportLogs = async (filters: AuditFilters) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/audit/export/csv?${new URLSearchParams(filters)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${Date.now()}.csv`;
      a.click();

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { exportLogs };
};
```

---

## ✅ Checklist de Implementación

### Autenticación

- [ ] Página de login con email/password
- [ ] Botón SSO con Google
- [ ] Página de registro
- [ ] Recuperación de contraseña
- [ ] Modal de 2FA en login
- [ ] Configuración de 2FA en perfil
- [ ] Auto-refresh de tokens
- [ ] Logout con limpieza de estado

### Gestión de Usuarios

- [ ] Lista de usuarios con paginación
- [ ] Búsqueda y filtros
- [ ] Crear/editar usuario
- [ ] Asignar roles a usuario
- [ ] Ver actividad de usuario
- [ ] Eliminar usuario (con confirmación)

### Gestión de Roles

- [ ] Grid de roles
- [ ] Crear rol personalizado
- [ ] Editar rol (solo no-predefinidos)
- [ ] Matriz de permisos
- [ ] Asignar/remover permisos
- [ ] Ver usuarios con rol

### Auditoría

- [ ] Dashboard con estadísticas
- [ ] Línea de tiempo de eventos
- [ ] Filtros por usuario/recurso/acción
- [ ] Exportación CSV
- [ ] Alertas de actividad sospechosa
- [ ] Limpieza de logs antiguos

### Seguridad

- [ ] Guards de rutas protegidas
- [ ] Validación de permisos
- [ ] Manejo de tokens en memoria
- [ ] Refresh token automático
- [ ] Logout en todas las pestañas
- [ ] Detección de sesión expirada

---

**Próximo**: [02_RESOURCES_SERVICE.md](./02_RESOURCES_SERVICE.md)
