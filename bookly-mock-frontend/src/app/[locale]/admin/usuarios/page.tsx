"use client";

import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { AppHeader } from "@/components/organisms/AppHeader";
import { MainLayout } from "@/components/templates/MainLayout";
import { useRoles } from "@/hooks/useRoles";
import { useToast } from "@/hooks/useToast";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/hooks/useUsers";
import type { User } from "@/types/entities/user";
import { UserStatus } from "@/types/entities/user";
import { useTranslations } from "next-intl";
import * as React from "react";
import {
  UserDetailPanel,
  UserFormModal,
  UserStatsCards,
  UsersTable,
} from "./components";

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
  const [filterRoles, setFilterRoles] = React.useState("");

  // Modales y paneles
  const [showUserModal, setShowUserModal] = React.useState(false);
  const [showUserDetail, setShowUserDetail] = React.useState(false);

  // Usuario seleccionado
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // Formulario de usuario
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [documentType, setDocumentType] = React.useState("");
  const [documentNumber, setDocumentNumber] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState<UserStatus>(UserStatus.ACTIVE);
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setEmail("");
    setUsername("");
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setDocumentType("");
    setDocumentNumber("");
    setPassword("");
    setStatus(UserStatus.ACTIVE);
    setSelectedRoles([]);
    setShowUserModal(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEmail(user.email);
    setUsername(user.username);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhoneNumber(user.phoneNumber || "");
    setDocumentType(user.documentType || "");
    setDocumentNumber(user.documentNumber || "");
    setPassword(""); // No mostrar password en edición
    setStatus(user.status);
    setSelectedRoles(user.roles.map((r) => r.id));
    setShowUserModal(true);
  };

  const handleOpenDetailPanel = (user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    // Resetear formulario
    setEmail("");
    setUsername("");
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setDocumentType("");
    setDocumentNumber("");
    setPassword("");
    setStatus(UserStatus.ACTIVE);
    setSelectedRoles([]);
  };

  const handleCloseDetailPanel = () => {
    setShowUserDetail(false);
    setSelectedUser(null);
    setFilterPermissions("");
  };

  const handleSaveUser = async () => {
    // Validaciones
    if (!firstName.trim()) {
      showError(
        t("error") || "Error",
        t("error_firstname_required") || "First name is required",
      );
      return;
    }
    if (!lastName.trim()) {
      showError(
        t("error") || "Error",
        t("error_lastname_required") || "Last name is required",
      );
      return;
    }
    if (!email.trim()) {
      showError(
        t("error") || "Error",
        t("error_email_required") || "Email is required",
      );
      return;
    }
    if (!username.trim()) {
      showError(
        t("error") || "Error",
        t("error_username_required") || "Username is required",
      );
      return;
    }
    if (!selectedUser && !password.trim()) {
      showError(
        t("error") || "Error",
        t("error_password_required") || "Password is required",
      );
      return;
    }

    try {
      if (selectedUser) {
        // Actualizar usuario existente
        await updateUserMutation.mutateAsync({
          id: selectedUser.id,
          data: {
            phoneNumber: phoneNumber || undefined,
            documentType: documentType || undefined,
            documentNumber: documentNumber || undefined,
            status,
          },
        });

        showSuccess(
          t("success") || "Success",
          t("success_user_updated") || "User updated successfully",
        );
      } else {
        // Crear nuevo usuario
        await createUserMutation.mutateAsync({
          email,
          username,
          password,
          firstName,
          lastName,
          phoneNumber: phoneNumber || undefined,
          documentType: documentType || undefined,
          documentNumber: documentNumber || undefined,
        });

        showSuccess(
          t("success") || "Success",
          t("success_user_created") || "User created successfully",
        );
      }

      handleCloseUserModal();
    } catch (error: any) {
      showError(
        t("error") || "Error",
        error?.message || t("error_saving_user") || "Error saving user",
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        t("confirm_delete") || "Are you sure you want to delete this user?",
      )
    ) {
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(userId);
      showSuccess(
        t("success") || "Success",
        t("success_user_deleted") || "User deleted successfully",
      );
      handleCloseDetailPanel();
    } catch (error: any) {
      showError(
        t("error") || "Error",
        error?.message || t("error_deleting_user") || "Error deleting user",
      );
    }
  };

  // Helper: Toggle role selection
  const handleRoleToggle = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
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

  const header = <AppHeader />;
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
        <UserStatsCards users={users} roles={roles} />

        {/* Users Table */}
        <UsersTable
          users={filteredUsers}
          filter={filterUserTable}
          onFilterChange={setFilterUserTable}
          onEdit={handleOpenEditModal}
          onView={handleOpenDetailPanel}
        />

        {/* Detail Panel */}
        <UserDetailPanel
          show={showUserDetail}
          user={selectedUser}
          filterPermissions={filterPermissions}
          isDeleting={isDeleting}
          onClose={handleCloseDetailPanel}
          onDelete={handleDeleteUser}
          onFilterPermissionsChange={setFilterPermissions}
        />

        {/* Form Modal */}
        <UserFormModal
          show={showUserModal}
          selectedUser={selectedUser}
          email={email}
          username={username}
          firstName={firstName}
          lastName={lastName}
          phoneNumber={phoneNumber}
          documentType={documentType}
          documentNumber={documentNumber}
          password={password}
          status={status}
          selectedRoles={selectedRoles}
          allRoles={roles}
          filterRoles={filterRoles}
          isLoading={isSaving}
          onClose={handleCloseUserModal}
          onSave={handleSaveUser}
          onEmailChange={setEmail}
          onUsernameChange={setUsername}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onPhoneNumberChange={setPhoneNumber}
          onDocumentTypeChange={setDocumentType}
          onDocumentNumberChange={setDocumentNumber}
          onPasswordChange={setPassword}
          onStatusChange={setStatus}
          onFilterRolesChange={setFilterRoles}
          onRoleToggle={handleRoleToggle}
        />
      </div>
    </MainLayout>
  );
}
