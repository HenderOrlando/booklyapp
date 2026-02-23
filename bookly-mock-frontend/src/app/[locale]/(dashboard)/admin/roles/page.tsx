"use client";

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
import { usePermissions } from "@/hooks/usePermissions";
import {
  useCreateRole,
  useDeleteRole,
  useRoles,
  useUpdateRole,
} from "@/hooks/useRoles";
import { useToast } from "@/hooks/useToast";
import { useUsers } from "@/hooks/useUsers";
import type { Permission, Role, User } from "@/types/entities/user";
import { useTranslations } from "next-intl";
import * as React from "react";
import { RoleDetailPanel, RoleFormModal, RoleStatsCards, RolesTable } from "./components";

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

  const loading = loadingRoles;
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

  // Tabla de permisos mostrando qué roles los tienen
  const permissionsColumns = [
    {
      key: "permission",
      header: t("permission"),
      cell: (perm: Permission) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-primary-500/10 flex items-center justify-center text-brand-primary-500 font-bold text-xs">
            {perm.resource.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-foreground">{perm.description}</div>
            <div className="text-xs text-[var(--color-text-tertiary)]">
              {perm.resource} : {perm.action}
            </div>
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
              <span className="text-[var(--color-text-tertiary)] text-xs italic">
                {t("no_roles")}
              </span>
            ) : (
              rolesWithPermission.map((role: Role) => (
                <Badge key={role.id} variant={role.isSystem ? "warning" : "primary"} className="text-[10px]">
                  {role.name}
                </Badge>
              ))
            )}
          </div>
        );
      },
    },
  ];

  const handleEditRole = (role: Role) => {
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
  };

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setShowRoleDetail(true);
  };

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("error_saving_role");
      showError(
        t("error") || "Error",
        errorMessage || "Error saving role",
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("error_deleting_role");
      showError(
        t("error") || "Error",
        errorMessage || "Error deleting role",
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

  // Helper: Bulk change permissions
  const handlePermissionBulkChange = (permissionIds: string[], add: boolean) => {
    if (add) {
      setSelectedPermissions((prev) => {
        const newIds = permissionIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    } else {
      setSelectedPermissions((prev) => 
        prev.filter(id => !permissionIds.includes(id))
      );
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
      <>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-500 mx-auto mb-4"></div>
            <p className="text-[var(--color-text-secondary)]">
              {t("loading")}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-10">
        {/* Header Seccion */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
              {t("title")}
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2 text-lg">
              {t("subtitle")}
            </p>
          </div>
          <Button
            size="lg"
            className="shadow-lg shadow-brand-primary-500/20"
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

        {/* Estadísticas */}
        <RoleStatsCards
          roles={roles}
          users={users}
          permissions={allPermissions}
        />

        {/* Tabla de Roles Refactorizada */}
        <RolesTable 
          roles={rolesWithStats}
          onEdit={handleEditRole}
          onView={handleViewRole}
          filter={filterRoleTable}
          onFilterChange={setFilterRoleTable}
        />

        {/* Tabla de Permisos del Sistema */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-strong)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold">{t("system_permissions")}</CardTitle>
                <CardDescription>{t("permissions_desc")}</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  placeholder={t("filter_perm_placeholder")}
                  value={filterPermissionTable}
                  onChange={(e) => setFilterPermissionTable(e.target.value)}
                  className="max-w-md h-10 bg-[var(--color-bg-primary)]"
                />
                <span className="text-xs font-bold text-[var(--color-text-tertiary)] bg-[var(--color-bg-primary)] px-2 py-1 rounded-md border border-[var(--color-border-strong)] whitespace-nowrap">
                  {filteredPermissions.length} / {allPermissions.length}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
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
          onPermissionBulkChange={handlePermissionBulkChange}
          onUserToggle={handleUserToggle}
        />
      </div>
    </>
  );
}
