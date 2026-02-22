"use client";

import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { MainLayout } from "@/components/templates/MainLayout";
import { useToast } from "@/hooks/useToast";
import { useRoles } from "@/hooks/useRoles";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/hooks/useUsers";
import type { User } from "@/types/entities/user";
// import { UserStatus } from "@/types/entities/user";
import { useTranslations } from "next-intl";
import * as React from "react";
import {
  UserDetailPanel,
  UserFormModal,
  UserStatsCards,
  UsersTable,
} from "./components";
import type { UserFormValues } from "./components/user-schema";

/**
 * Página de Administración de Usuarios - Bookly
 *
 * Permite gestionar:
 * - Lista de usuarios del sistema
 * - Creación de nuevos usuarios
 * - Edición de datos personales y estado
 * - Asignación de roles
 * - Eliminación de usuarios
 */

export default function UsersAdminPage() {
  const t = useTranslations("admin.users");
  const { showSuccess, showError } = useToast();

  // ============================================
  // HOOKS DE DATOS
  // ============================================

  const { data: usersResponse, isLoading: loadingUsers } = useUsers();
  const { data: rolesData, isLoading: loadingRoles } = useRoles();

  const users = usersResponse?.items || [];
  const roles = rolesData || [];

  // ============================================
  // MUTATIONS
  // ============================================

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // ============================================
  // ESTADO LOCAL
  // ============================================

  // Filtros
  const [filterUserTable, setFilterUserTable] = React.useState("");
  const [filterPermissions, setFilterPermissions] = React.useState("");

  // Modales y paneles
  const [showUserModal, setShowUserModal] = React.useState(false);
  const [showUserDetail, setShowUserDetail] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<string | null>(null);

  // Usuario seleccionado
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // ============================================
  // HANDLERS
  // ============================================

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleOpenDetailPanel = (user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleCloseDetailPanel = () => {
    setShowUserDetail(false);
    setSelectedUser(null);
    setFilterPermissions("");
  };

  const handleSaveUser = async (data: UserFormValues) => {
    try {
      if (selectedUser) {
        // Actualizar usuario existente
        await updateUserMutation.mutateAsync({
          id: selectedUser.id,
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber || undefined,
            documentType: data.documentType || undefined,
            documentNumber: data.documentNumber || undefined,
            status: data.status,
            roles: data.roles,
            programId: data.programId || undefined,
            coordinatedProgramId: data.coordinatedProgramId || undefined,
          },
        });

        showSuccess(
          t("success") || "Success",
          t("success_user_updated") || "User updated successfully",
        );
      } else {
        // Crear nuevo usuario
        // Nos aseguramos de que los campos requeridos estén presentes (validados por el schema)
        if (!data.email || !data.username || !data.password) {
          throw new Error("Email, username and password are required for new users");
        }

        await createUserMutation.mutateAsync({
          email: data.email,
          username: data.username,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber || undefined,
          documentType: data.documentType || undefined,
          documentNumber: data.documentNumber || undefined,
          roles: data.roles,
          programId: data.programId || undefined,
          coordinatedProgramId: data.coordinatedProgramId || undefined,
        });

        showSuccess(
          t("success") || "Success",
          t("success_user_created") || "User created successfully",
        );
      }

      handleCloseUserModal();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("error_saving_user") || "Error saving user";
      showError(
        t("error") || "Error",
        errorMessage,
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete);
      showSuccess(
        t("success") || "Success",
        t("success_user_deleted") || "User deleted successfully",
      );
      handleCloseDetailPanel();
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("error_deleting_user") || "Error deleting user";
      showError(
        t("error") || "Error",
        errorMessage,
      );
    }
  };

  // Get loading states from mutations
  const isCreating = createUserMutation.isPending;
  const isUpdating = updateUserMutation.isPending;
  const isDeleting = deleteUserMutation.isPending;
  const isSaving = isCreating || isUpdating;

  // ============================================
  // FILTRADO
  // ============================================

  const filteredUsers = users.filter(
    (user: User) =>
      user.firstName.toLowerCase().includes(filterUserTable.toLowerCase()) ||
      user.lastName.toLowerCase().includes(filterUserTable.toLowerCase()) ||
      user.email.toLowerCase().includes(filterUserTable.toLowerCase()) ||
      user.username.toLowerCase().includes(filterUserTable.toLowerCase()),
  );

  // ============================================
  // RENDER
  // ============================================

  const loading = loadingUsers || loadingRoles;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("page_title")}
            </h1>
            <p className="text-[var(--color-text-tertiary)] mt-1">
              {t("page_description")}
            </p>
          </div>
          <Button onClick={handleOpenCreateModal} disabled={loading}>
            + {t("create_user")}
          </Button>
        </div>

        {/* Error/Loading States */}
        {loading && (
          <Alert>
            <AlertDescription>{t("loading")}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <UserStatsCards users={users} roles={roles} isLoading={loading} />

        {/* Users Table */}
        <UsersTable
          users={filteredUsers}
          filter={filterUserTable}
          isLoading={loadingUsers}
          onFilterChange={setFilterUserTable}
          onEdit={handleOpenEditModal}
          onView={handleOpenDetailPanel}
        />

        {/* Detail Panel */}
        <UserDetailPanel
          show={showUserDetail}
          user={selectedUser}
          filterPermissions={filterPermissions}
          isLoading={loadingUsers}
          isDeleting={isDeleting}
          onClose={handleCloseDetailPanel}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteUser}
          onFilterPermissionsChange={setFilterPermissions}
        />

        {/* Form Modal */}
        <UserFormModal
          show={showUserModal}
          selectedUser={selectedUser}
          allRoles={roles}
          isLoading={isSaving}
          onClose={handleCloseUserModal}
          onSave={handleSaveUser}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          title={t("confirm_delete_title") || "Confirm Delete"}
          description={t("confirm_delete_description") || "Are you sure you want to delete this user? This action cannot be undone."}
          confirmText={t("delete") || "Delete"}
          cancelText={t("cancel") || "Cancel"}
          variant="destructive"
          loading={isDeleting}
        />
      </div>
    </MainLayout>
  );
}
