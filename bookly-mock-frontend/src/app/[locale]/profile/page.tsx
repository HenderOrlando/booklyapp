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
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import { useChangePassword, useUpdateUserProfile } from "@/hooks/mutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Perfil de Usuario - Bookly
 *
 * Permite al usuario:
 * - Ver su información personal
 * - Editar datos básicos
 * - Cambiar contraseña
 * - Ver roles y permisos
 */

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  documentType?: string;
  documentNumber?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");

  // React Query: Usuario actual (reemplaza Redux completamente)
  const {
    data: user,
    isLoading: loading,
    error: queryError,
  } = useCurrentUser();

  const [error, setError] = React.useState("");

  // Estados para edición de perfil
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [profileData, setProfileData] = React.useState<UpdateProfileData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    documentType: user?.documentType || "CC",
    documentNumber: user?.documentNumber || "",
  });
  const [profileError, setProfileError] = React.useState("");
  const [profileSuccess, setProfileSuccess] = React.useState("");

  // Mutations
  const updateProfile = useUpdateUserProfile();
  const changePassword = useChangePassword();

  // Estados para cambio de contraseña
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = React.useState("");
  const [passwordSuccess, setPasswordSuccess] = React.useState("");

  // React Query maneja el fetch automáticamente

  // Actualizar datos de perfil cuando el usuario cambie
  React.useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        documentType: user.documentType || "CC",
        documentNumber: user.documentNumber || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    updateProfile.mutate(profileData as any, {
      onSuccess: () => {
        setProfileSuccess(t("update_success"));
        setIsEditingProfile(false);
      },
      onError: (error: any) => {
        setProfileError(error?.message || t("update_error"));
      },
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validaciones
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t("password_mismatch"));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError(t("password_min"));
      return;
    }

    changePassword.mutate(passwordData as any, {
      onSuccess: () => {
        setPasswordSuccess(t("password_success"));
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      },
      onError: (error: any) => {
        setPasswordError(error?.message || t("password_error"));
      },
    });
  };

  // Usar componentes compartidos de Header y Sidebar
  const header = <AppHeader title={t("title")} />;
  const sidebar = <AppSidebar />;

  // Mostrar loading
  if (loading) {
    return (
      <MainLayout header={header} sidebar={sidebar}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-500 mx-auto mb-4"></div>
            <p className="text-[var(--color-text-secondary)]">{t("loading")}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Mostrar error si no se pudo cargar el usuario
  if (error || !user) {
    return (
      <MainLayout header={header} sidebar={sidebar}>
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>{t("error_loading")}</CardTitle>
              <CardDescription>{error || t("error_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant="error">
                  <AlertDescription>{t("auth_error")}</AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    onClick={() => (window.location.href = "/login")}
                    className="w-full"
                  >
                    {t("go_login")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    {t("retry")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {t("user_profile")}
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {t("description")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("personal_info")}</CardTitle>
                  <CardDescription>{t("personal_info_desc")}</CardDescription>
                </div>
                {!isEditingProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    {t("edit")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {profileSuccess && (
                <Alert variant="success" className="mb-4">
                  <AlertDescription>{profileSuccess}</AlertDescription>
                </Alert>
              )}

              {profileError && (
                <Alert variant="error" className="mb-4">
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {tAuth("first_name")}
                      </label>
                      <Input
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {tAuth("last_name")}
                      </label>
                      <Input
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {tAuth("phone")}
                    </label>
                    <Input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("document_type")}
                      </label>
                      <select
                        value={profileData.documentType}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            documentType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-md bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                      >
                        <option value="CC">{t("document_types.cc")}</option>
                        <option value="TI">{t("document_types.ti")}</option>
                        <option value="CE">{t("document_types.ce")}</option>
                        <option value="PA">{t("document_types.pa")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {tAuth("doc_number")}
                      </label>
                      <Input
                        value={profileData.documentNumber}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            documentNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? t("saving") : t("save")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileError("");
                        setProfileSuccess("");
                      }}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {t("full_name")}
                    </p>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {tAuth("email")}
                    </p>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {t("username")}
                    </p>
                    <p className="font-medium">{user.username}</p>
                  </div>

                  {user.phoneNumber && (
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {tAuth("phone")}
                      </p>
                      <p className="font-medium">{user.phoneNumber}</p>
                    </div>
                  )}

                  {user.documentNumber && (
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {t("document")}
                      </p>
                      <p className="font-medium">
                        {user.documentType}: {user.documentNumber}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {t("account_status")}
                    </p>
                    <Badge
                      variant={user.status === "ACTIVE" ? "success" : "default"}
                    >
                      {user.status === "ACTIVE" ? t("active") : user.status}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Roles y Permisos */}
          <Card>
            <CardHeader>
              <CardTitle>{t("roles_permissions")}</CardTitle>
              <CardDescription>{t("roles_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    {t("assigned_roles")}
                  </p>
                  {user.roles && user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role: any, index: number) => (
                        <Badge key={index} variant="secondary">
                          {role.name || role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {t("no_roles")}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    {t("verifications")}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t("email_verified")}</span>
                      <Badge
                        variant={user.emailVerified ? "success" : "warning"}
                      >
                        {user.emailVerified ? t("yes") : t("no")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t("phone_verified")}</span>
                      <Badge
                        variant={user.phoneVerified ? "success" : "warning"}
                      >
                        {user.phoneVerified ? t("yes") : t("no")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t("two_factor")}</span>
                      <Badge
                        variant={user.twoFactorEnabled ? "success" : "default"}
                      >
                        {user.twoFactorEnabled
                          ? t("activated")
                          : t("deactivated")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cambiar Contraseña */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("security")}</CardTitle>
                <CardDescription>{t("security_desc")}</CardDescription>
              </div>
              {!isChangingPassword && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingPassword(true)}
                >
                  {t("change_password")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {passwordSuccess && (
              <Alert variant="success" className="mb-4">
                <AlertDescription>{passwordSuccess}</AlertDescription>
              </Alert>
            )}

            {passwordError && (
              <Alert variant="error" className="mb-4">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {isChangingPassword ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("current_password")}
                  </label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("new_password")}
                  </label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    placeholder={t("password_placeholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("confirm_password")}
                  </label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    placeholder={t("password_placeholder")}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={changePassword.isPending}>
                    {changePassword.isPending
                      ? t("changing_password")
                      : t("change_password")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordError("");
                      setPasswordSuccess("");
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("password_protected")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>{t("account_info")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("created_at")}
                </p>
                <p className="font-medium">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : t("not_available")}
                </p>
              </div>

              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t("updated_at")}
                </p>
                <p className="font-medium">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : t("not_available")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
