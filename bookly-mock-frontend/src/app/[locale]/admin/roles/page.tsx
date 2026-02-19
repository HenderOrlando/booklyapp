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
import { usePermissions } from "@/hooks/usePermissions";
import {
  useAssignPermissionsToRole,
  useCreateRole,
  useDeleteRole,
  useRemovePermissionsFromRole,
  useRoles,
  useUpdateRole,
} from "@/hooks/useRoles";
import { useToast } from "@/hooks/useToast";
import { useUsers } from "@/hooks/useUsers";
import type { Permission, Role, User } from "@/types/entities/user";
import { useTranslations } from "next-intl";
import * as React from "react";
import { RoleDetailPanel, RoleFormModal, RoleStatsCards } from "./components";

/**
 * Página de Administración de Roles y Permisos - Bookly
 *
 * Permite gestionar:
 * - Lista de roles del sistema
 * - Asignación de permisos a roles
 * - Asignación de roles a usuarios
 * - Crear/editar/eliminar roles
 */

// Extender Role con usersCount (calculado en runtime)
interface RoleWithStats extends Role {
  usersCount: number;
}

export default function RolesAdminPage() {
  const t = useTranslations("admin.roles");
  const { showSuccess, showError } = useToast();

  // Hooks de backend
  const { data: roles = [], isLoading: loadingRoles } = useRoles();
  const { data: usersResponse } = useUsers();
  const { data: allPermissions = [] } = usePermissions();

  // Procesar respuesta paginada de usuarios
  const users = React.useMemo(() => {
    return usersResponse?.items || [];
  }, [usersResponse]);

  // Calcular roles con estadísticas (usersCount)
  const rolesWithStats: RoleWithStats[] = React.useMemo(() => {
    return roles.map((role) => ({
      ...role,
      usersCount: users.filter((user) =>
        user.roles.some((r) => r.id === role.id),
      ).length,
    }));
  }, [roles, users]);

  // Mutations
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const assignPermissionsMutation = useAssignPermissionsToRole();
  const removePermissionsMutation = useRemovePermissionsFromRole();

  const loading = loadingRoles;
  const error = "";
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = React.useState(false);
  const [showRoleDetail, setShowRoleDetail] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"permissions" | "users">(
    "permissions",
  );
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    string[]
  >([]);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);

  // Estados del formulario de rol
  const [roleName, setRoleName] = React.useState("");
  const [roleDescription, setRoleDescription] = React.useState("");

  // Filtros para ventana de crear/editar
  const [filterPermissionModal, setFilterPermissionModal] = React.useState("");
  const [filterUserModal, setFilterUserModal] = React.useState("");

  // Filtros para ventana de detalle
  const [filterPermissionDetail, setFilterPermissionDetail] =
    React.useState("");
  const [filterUserDetail, setFilterUserDetail] = React.useState("");

  // Filtros para tablas principales
  const [filterRoleTable, setFilterRoleTable] = React.useState("");
  const [filterPermissionTable, setFilterPermissionTable] = React.useState("");

  // React Query maneja el fetch automáticamente

  const header = <AppHeader title={t("title")} />;
  const sidebar = <AppSidebar />;

  // Columnas para la tabla de roles
  const roleColumns = [
    {
      key: "name",
      header: t("role_name"),
      cell: (role: Role) => (
        <div>
          <div className="font-medium text-foreground">{role.name}</div>
          <div className="text-sm text-[var(--color-text-tertiary)]">
            {role.description}
          </div>
        </div>
      ),
    },
    {
      key: "permissions",
      header: t("permissions"),
      cell: (role: Role) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions.slice(0, 3).map((perm) => (
            <Badge key={perm.id} variant="secondary">
              {perm.description}
            </Badge>
          ))}
          {role.permissions.length > 3 && (
            <Badge variant="secondary">
              {t("more", { count: role.permissions.length - 3 })}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "usersCount",
      header: t("users"),
      cell: (role: RoleWithStats) => (
        <Badge variant="primary">{role.usersCount}</Badge>
      ),
    },
    {
      key: "actions",
      header: t("actions"),
      cell: (role: Role) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedRole(role);
              setRoleName(role.name);
              setRoleDescription(role.description || "");
              setSelectedPermissions(
                role.permissions.map((p: Permission) => p.id),
              );
              // Get users with this role
              const usersWithRole = users.filter((u: User) =>
                u.roles.some((r) => r.id === role.id),
              );
              setSelectedUsers(usersWithRole.map((u: User) => u.id));
              setShowRoleModal(true);
            }}
          >
            {t("edit")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedRole(role);
              setShowRoleDetail(true);
            }}
          >
            {t("view")}
          </Button>
        </div>
      ),
    },
  ];

  // Tabla de permisos mostrando qué roles los tienen
  const permissionsColumns = [
    {
      key: "permission",
      header: t("permission"),
      cell: (perm: Permission) => (
        <div>
          <div className="font-medium text-foreground">{perm.description}</div>
          <div className="text-sm text-[var(--color-text-tertiary)]">
            {perm.resource} : {perm.action}
          </div>
        </div>
      ),
    },
    {
      key: "roles",
      header: t("roles_with_perm"),
      cell: (perm: Permission) => {
        const rolesWithPermission = roles.filter((role: Role) =>
          role.permissions.some((p: Permission) => p.id === perm.id),
        );
        return (
          <div className="flex flex-wrap gap-1">
            {rolesWithPermission.length === 0 ? (
              <span className="text-[var(--color-text-tertiary)] text-sm">
                {t("no_roles")}
              </span>
            ) : (
              rolesWithPermission.map((role: Role) => (
                <Badge key={role.id} variant="primary">
                  {role.name}
                </Badge>
              ))
            )}
          </div>
        );
      },
    },
  ];

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      showError(
        t("error") || "Error",
        t("error_name_required") || "Name is required",
      );
      return;
    }

    try {
      if (selectedRole) {
        // Actualizar rol existente
        await updateRoleMutation.mutateAsync({
          id: selectedRole.id,
          data: {
            name: roleName,
            displayName: roleName,
            description: roleDescription,
            permissionIds: selectedPermissions,
          },
        });
        showSuccess(
          t("success") || "Success",
          t("success_role_updated") || "Role updated successfully",
        );
      } else {
        // Crear nuevo rol
        await createRoleMutation.mutateAsync({
          name: roleName,
          displayName: roleName,
          description: roleDescription,
          permissionIds: selectedPermissions,
          isActive: true,
        });
        showSuccess(
          t("success") || "Success",
          t("success_role_created") || "Role created successfully",
        );
      }
      handleCloseRoleModal();
    } catch (error: any) {
      showError(
        t("error") || "Error",
        error?.message || t("error_saving_role") || "Error saving role",
      );
    }
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setSelectedRole(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setSelectedUsers([]);
    setFilterPermissionModal("");
    setFilterUserModal("");
  };

  const handleCloseRoleDetail = () => {
    setShowRoleDetail(false);
    setSelectedRole(null);
    setFilterPermissionDetail("");
    setFilterUserDetail("");
  };

  const handleDeleteRole = async (roleId: string) => {
    if (
      !confirm(
        t("confirm_delete") || "Are you sure you want to delete this role?",
      )
    ) {
      return;
    }

    try {
      await deleteRoleMutation.mutateAsync(roleId);
      showSuccess(
        t("success") || "Success",
        t("success_role_deleted") || "Role deleted successfully",
      );
      handleCloseRoleDetail();
    } catch (error: any) {
      showError(
        t("error") || "Error",
        error?.message || t("error_deleting_role") || "Error deleting role",
      );
    }
  };

  const handleAssignPermissions = async (
    roleId: string,
    permissionIds: string[],
  ) => {
    try {
      await assignPermissionsMutation.mutateAsync({
        id: roleId,
        permissionIds,
      });
      showSuccess(
        t("success") || "Success",
        t("success_permissions_assigned") ||
          "Permissions assigned successfully",
      );
    } catch (error: any) {
      showError(
        t("error") || "Error",
        error?.message ||
          t("error_assigning_permissions") ||
          "Error assigning permissions",
      );
    }
  };

  const handleRemovePermissions = async (
    roleId: string,
    permissionIds: string[],
  ) => {
    try {
      await removePermissionsMutation.mutateAsync({
        id: roleId,
        permissionIds,
      });
      showSuccess(
        t("success") || "Success",
        t("success_permissions_removed") || "Permissions removed successfully",
      );
    } catch (error: any) {
      showError(
        t("error") || "Error",
        error?.message ||
          t("error_removing_permissions") ||
          "Error removing permissions",
      );
    }
  };

  // Helper: Toggle permission selection
  const handlePermissionToggle = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(
        selectedPermissions.filter((id) => id !== permissionId),
      );
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };

  // Helper: Toggle user selection
  const handleUserToggle = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Get loading states from mutations
  const isCreating = createRoleMutation.isPending;
  const isUpdating = updateRoleMutation.isPending;
  const isDeleting = deleteRoleMutation.isPending;
  const isSaving = isCreating || isUpdating;

  // Filtrar roles para la tabla
  const filteredRoles = rolesWithStats.filter(
    (role: RoleWithStats) =>
      role.name.toLowerCase().includes(filterRoleTable.toLowerCase()) ||
      (role.description || "")
        .toLowerCase()
        .includes(filterRoleTable.toLowerCase()),
  );

  // Filtrar permisos para la tabla
  const filteredPermissions = allPermissions.filter(
    (perm: Permission) =>
      perm.description
        ?.toLowerCase()
        .includes(filterPermissionTable.toLowerCase()) ||
      perm.resource
        .toLowerCase()
        .includes(filterPermissionTable.toLowerCase()) ||
      perm.action.toLowerCase().includes(filterPermissionTable.toLowerCase()),
  );

  if (loading) {
    return (
      <MainLayout>
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
    <MainLayout>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {t("title")}
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-2">
            {t("subtitle")}
          </p>
        </div>

        {error && (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Estadísticas */}
        <RoleStatsCards
          roles={roles}
          users={users}
          permissions={allPermissions}
        />

        {/* Tabla de Roles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>{t("roles_in_system")}</CardTitle>
                <CardDescription>{t("roles_list_desc")}</CardDescription>
              </div>
              <Button
                onClick={() => {
                  setSelectedRole(null);
                  setSelectedPermissions([]);
                  setSelectedUsers([]);
                  setShowRoleModal(true);
                }}
              >
                {t("create_new")}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Input
                placeholder={t("filter_placeholder")}
                value={filterRoleTable}
                onChange={(e) => setFilterRoleTable(e.target.value)}
                className="max-w-md"
              />
              {filterRoleTable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterRoleTable("")}
                >
                  {t("clear")}
                </Button>
              )}
              <span className="text-sm text-[var(--color-text-tertiary)] whitespace-nowrap">
                {t("showing_count", {
                  count: filteredRoles.length,
                  total: roles.length,
                })}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable data={filteredRoles} columns={roleColumns} />
          </CardContent>
        </Card>

        {/* Tabla de Permisos */}
        <Card>
          <CardHeader>
            <div className="mb-4">
              <CardTitle>{t("system_permissions")}</CardTitle>
              <CardDescription>{t("permissions_desc")}</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Input
                placeholder={t("filter_perm_placeholder")}
                value={filterPermissionTable}
                onChange={(e) => setFilterPermissionTable(e.target.value)}
                className="max-w-md"
              />
              {filterPermissionTable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterPermissionTable("")}
                >
                  {t("clear")}
                </Button>
              )}
              <span className="text-sm text-[var(--color-text-tertiary)] whitespace-nowrap">
                {t("showing_perm_count", {
                  count: filteredPermissions.length,
                  total: allPermissions.length,
                })}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredPermissions}
              columns={permissionsColumns}
            />
          </CardContent>
        </Card>

        {/* Panel de Detalle de Rol */}
        <RoleDetailPanel
          show={showRoleDetail}
          role={selectedRole}
          users={users}
          filterPermissionDetail={filterPermissionDetail}
          filterUserDetail={filterUserDetail}
          isDeleting={isDeleting}
          onClose={handleCloseRoleDetail}
          onDelete={handleDeleteRole}
          onFilterPermissionChange={setFilterPermissionDetail}
          onFilterUserDetailChange={setFilterUserDetail}
        />

        {/* Modal de Edición/Creación de Rol */}
        <RoleFormModal
          show={showRoleModal}
          selectedRole={selectedRole}
          roleName={roleName}
          roleDescription={roleDescription}
          selectedPermissions={selectedPermissions}
          selectedUsers={selectedUsers}
          allPermissions={allPermissions}
          users={users}
          activeTab={activeTab}
          filterPermissionModal={filterPermissionModal}
          filterUserModal={filterUserModal}
          isLoading={isSaving}
          onClose={handleCloseRoleModal}
          onSave={handleSaveRole}
          onRoleNameChange={setRoleName}
          onRoleDescriptionChange={setRoleDescription}
          onTabChange={setActiveTab}
          onFilterPermissionChange={setFilterPermissionModal}
          onFilterUserChange={setFilterUserModal}
          onPermissionToggle={handlePermissionToggle}
          onUserToggle={handleUserToggle}
        />
      </div>
    </MainLayout>
  );
}
