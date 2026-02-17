"use client";

import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { DataTable } from "@/components/molecules/DataTable";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import { httpClient } from "@/infrastructure/http";
import * as React from "react";

/**
 * Página de Administración de Roles y Permisos - Bookly
 *
 * Permite gestionar:
 * - Lista de roles del sistema
 * - Asignación de permisos a roles
 * - Asignación de roles a usuarios
 * - Crear/editar/eliminar roles
 */

interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  isSystem: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  usersCount: number;
  createdAt: string;
  isSystem: boolean;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export default function RolesAdminPage() {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = React.useState(false);
  const [showUserRoleModal, setShowUserRoleModal] = React.useState(false);

  // Cargar roles y usuarios
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesResponse, usersResponse] = await Promise.all([
          httpClient.get("roles"),
          httpClient.get("users"),
        ]);

        if (rolesResponse.success && rolesResponse.data) {
          setRoles(rolesResponse.data.items || []);
        }

        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data.items || []);
        }
      } catch (err: any) {
        setError(err?.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const header = <AppHeader title="Administración de Roles" />;
  const sidebar = <AppSidebar />;

  // Columnas para la tabla de roles
  const roleColumns = [
    {
      key: "name",
      header: "Rol",
      cell: (role: Role) => (
        <div>
          <div className="font-medium text-white">{role.name}</div>
          <div className="text-sm text-[var(--color-text-tertiary)]">{role.description}</div>
        </div>
      ),
    },
    {
      key: "permissions",
      header: "Permisos",
      cell: (role: Role) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions.slice(0, 3).map((perm) => (
            <Badge key={perm.id} variant="secondary">
              {perm.description}
            </Badge>
          ))}
          {role.permissions.length > 3 && (
            <Badge variant="secondary">
              +{role.permissions.length - 3} más
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "usersCount",
      header: "Usuarios",
      cell: (role: Role) => <Badge variant="primary">{role.usersCount}</Badge>,
    },
    {
      key: "actions",
      header: "Acciones",
      cell: (role: Role) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedRole(role);
              setShowRoleModal(true);
            }}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => alert(`Ver detalles de ${role.name}`)}
          >
            Ver
          </Button>
        </div>
      ),
    },
  ];

  // Columnas para la tabla de usuarios
  const userColumns = [
    {
      key: "user",
      header: "Usuario",
      cell: (user: User) => (
        <div>
          <div className="font-medium text-white">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-sm text-[var(--color-text-tertiary)]">{user.email}</div>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Roles Asignados",
      cell: (user: User) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <Badge key={role} variant="primary">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      cell: (user: User) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setShowUserRoleModal(true);
          }}
        >
          Gestionar Roles
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout header={header} sidebar={sidebar}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-500 mx-auto mb-4"></div>
            <p className="text-[var(--color-text-secondary)]">
              Cargando roles...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Administración de Roles y Permisos
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Gestiona los roles y permisos del sistema
          </p>
        </div>

        {error && (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Roles</CardTitle>
              <CardDescription>Roles en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-brand-primary-500">
                {roles.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Usuarios</CardTitle>
              <CardDescription>Usuarios con roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-brand-primary-500">
                {users.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permisos Únicos</CardTitle>
              <CardDescription>Permisos disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-brand-primary-500">
                {[...new Set(roles.flatMap((r) => r.permissions))].length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Roles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Roles del Sistema</CardTitle>
                <CardDescription>
                  Lista completa de roles y sus permisos
                </CardDescription>
              </div>
              <Button onClick={() => setShowRoleModal(true)}>
                + Nuevo Rol
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable data={roles} columns={roleColumns} />
          </CardContent>
        </Card>

        {/* Tabla de Usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios y Roles</CardTitle>
            <CardDescription>Asignación de roles a usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={users} columns={userColumns} />
          </CardContent>
        </Card>

        {/* Modal de Edición de Rol (placeholder) */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>
                  {selectedRole ? "Editar Rol" : "Nuevo Rol"}
                </CardTitle>
                <CardDescription>
                  Configura los permisos del rol
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nombre del Rol
                  </label>
                  <Input
                    placeholder="Ej: Coordinador"
                    defaultValue={selectedRole?.name || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Descripción
                  </label>
                  <Input
                    placeholder="Descripción del rol"
                    defaultValue={selectedRole?.description || ""}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Permisos
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "crear_recursos",
                      "editar_recursos",
                      "eliminar_recursos",
                      "ver_reservas",
                      "aprobar_reservas",
                      "rechazar_reservas",
                      "ver_reportes",
                      "gestionar_usuarios",
                    ].map((perm) => (
                      <label
                        key={perm}
                        className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                      >
                        <input
                          type="checkbox"
                          defaultChecked={selectedRole?.permissions.some(
                            (p) =>
                              `${p.action}_${p.resource}` === perm ||
                              p.resource === perm.split("_")[1]
                          )}
                          className="rounded"
                        />
                        {perm.replace(/_/g, " ")}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRoleModal(false);
                      setSelectedRole(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      alert("Funcionalidad de guardado pendiente");
                      setShowRoleModal(false);
                    }}
                  >
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
