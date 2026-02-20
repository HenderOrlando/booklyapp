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
// import { AppHeader } from "@/components/organisms/AppHeader";
// import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  useChangePassword,
  useUpdateUserPreferences,
  useUpdateUserProfile,
  useUploadProfilePhoto,
} from "@/hooks/mutations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserPreferences } from "@/types/entities/user";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
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
  phone?: string;
  documentType?: string;
  documentNumber?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  language: "es",
  theme: "system",
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  timezone: "America/Bogota",
};

function getUserInitials(firstName: string, lastName: string, email: string) {
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.trim();
  if (initials.length > 0) {
    return initials.toUpperCase();
  }

  return (email?.[0] || "U").toUpperCase();
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const { refreshUser } = useAuth();
  const photoInputRef = React.useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  // React Query: Usuario actual (reemplaza Redux completamente)
  const { data: user, isLoading: loading } = useCurrentUser();

  const [error] = React.useState("");

  // Estados para edición de perfil
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [profileData, setProfileData] = React.useState<UpdateProfileData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || user?.phoneNumber || "",
    documentType: user?.documentType || "CC",
    documentNumber: user?.documentNumber || "",
  });
  const [profileError, setProfileError] = React.useState("");
  const [profileSuccess, setProfileSuccess] = React.useState("");
  const [photoError, setPhotoError] = React.useState("");
  const [photoSuccess, setPhotoSuccess] = React.useState("");

  // Mutations
  const updateProfile = useUpdateUserProfile();
  const changePassword = useChangePassword();
  const uploadProfilePhoto = useUploadProfilePhoto();
  const updatePreferences = useUpdateUserPreferences();

  // Estados para cambio de contraseña
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = React.useState("");
  const [passwordSuccess, setPasswordSuccess] = React.useState("");

  // Estados para preferencias
  const [preferencesData, setPreferencesData] = React.useState<UserPreferences>(
    DEFAULT_USER_PREFERENCES,
  );
  const [preferencesError, setPreferencesError] = React.useState("");
  const [preferencesSuccess, setPreferencesSuccess] = React.useState("");

  // React Query maneja el fetch automáticamente

  // Actualizar datos de perfil cuando el usuario cambie
  React.useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || user.phoneNumber || "",
        documentType: user.documentType || "CC",
        documentNumber: user.documentNumber || "",
      });

      setPreferencesData({
        language:
          user.preferences?.language ?? DEFAULT_USER_PREFERENCES.language,
        theme: user.preferences?.theme ?? DEFAULT_USER_PREFERENCES.theme,
        timezone:
          user.preferences?.timezone ?? DEFAULT_USER_PREFERENCES.timezone,
        notifications: {
          ...DEFAULT_USER_PREFERENCES.notifications,
          ...user.preferences?.notifications,
        },
      });
    }
  }, [user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    updateProfile.mutate(profileData, {
      onSuccess: () => {
        void refreshUser();
        setProfileSuccess(t("update_success"));
        setIsEditingProfile(false);
      },
      onError: (mutationError: unknown) => {
        setProfileError(
          mutationError instanceof Error
            ? mutationError.message
            : t("update_error"),
        );
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

    if (passwordData.newPassword.length < 8) {
      setPasswordError(t("password_min"));
      return;
    }

    changePassword.mutate(passwordData, {
      onSuccess: () => {
        setPasswordSuccess(t("password_success"));
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      },
      onError: (mutationError: unknown) => {
        setPasswordError(
          mutationError instanceof Error
            ? mutationError.message
            : t("password_error"),
        );
      },
    });
  };

  const handleProfilePhotoUploadClick = () => {
    setPhotoError("");
    setPhotoSuccess("");
    photoInputRef.current?.click();
  };

  const handleProfilePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    const input = event.target;

    if (!file) {
      return;
    }

    setPhotoError("");
    setPhotoSuccess("");

    uploadProfilePhoto.mutate(file, {
      onSuccess: () => {
        input.value = "";
        void refreshUser();
        setPhotoSuccess(t("photo_success"));
      },
      onError: (mutationError: unknown) => {
        setPhotoError(
          mutationError instanceof Error
            ? mutationError.message
            : t("photo_error"),
        );
      },
    });
  };

  const handleToggleNotification = (
    channel: keyof UserPreferences["notifications"],
  ) => {
    setPreferencesData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [channel]: !prev.notifications[channel],
      },
    }));
  };

  const handleUpdatePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPreferencesError("");
    setPreferencesSuccess("");

    updatePreferences.mutate(preferencesData, {
      onSuccess: () => {
        void refreshUser();
        setPreferencesSuccess(t("preferences_success"));

        // Si el idioma cambió, recargar la aplicación en la nueva ruta
        if (preferencesData.language !== locale) {
          router.replace(pathname, { locale: preferencesData.language });
        }
      },
      onError: (mutationError: unknown) => {
        setPreferencesError(
          mutationError instanceof Error
            ? mutationError.message
            : t("preferences_error"),
        );
      },
    });
  };

  // Usar componentes compartidos de Header y Sidebar
  // const header = <AppHeader title={t("title")} />;
  // const sidebar = <AppSidebar />;

  // Mostrar loading
  if (loading) {
    return (
      <MainLayout>
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
      <MainLayout>
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
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {t("user_profile")}
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {t("description")}
          </p>
        </div>

        <Card data-testid="profile-photo-card">
          <CardHeader>
            <CardTitle>{t("photo_title")}</CardTitle>
            <CardDescription>{t("photo_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {photoSuccess && (
              <Alert
                variant="success"
                className="mb-4"
                data-testid="photo-success-alert"
              >
                <AlertDescription>{photoSuccess}</AlertDescription>
              </Alert>
            )}

            {photoError && (
              <Alert
                variant="error"
                className="mb-4"
                data-testid="photo-error-alert"
              >
                <AlertDescription>{photoError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-bg-muted)] bg-cover bg-center"
                  data-testid="profile-avatar-image"
                  style={
                    user.profilePicture
                      ? { backgroundImage: `url(${user.profilePicture})` }
                      : undefined
                  }
                >
                  {!user.profilePicture && (
                    <span
                      className="text-lg font-semibold text-[var(--color-text-primary)]"
                      data-testid="profile-avatar-fallback"
                    >
                      {getUserInitials(
                        user.firstName,
                        user.lastName,
                        user.email,
                      )}
                    </span>
                  )}
                </div>

                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  accept="image/*"
                  className="hidden"
                  data-testid="profile-photo-input"
                  onChange={handleProfilePhotoChange}
                  ref={photoInputRef}
                  type="file"
                />
                <Button
                  data-testid="profile-photo-upload-button"
                  disabled={uploadProfilePhoto.isPending}
                  onClick={handleProfilePhotoUploadClick}
                  type="button"
                  variant="outline"
                >
                  {uploadProfilePhoto.isPending
                    ? t("uploading_photo")
                    : t("upload_photo")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    data-testid="profile-edit-button"
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
                <Alert
                  variant="success"
                  className="mb-4"
                  data-testid="profile-success-alert"
                >
                  <AlertDescription>{profileSuccess}</AlertDescription>
                </Alert>
              )}

              {profileError && (
                <Alert
                  variant="error"
                  className="mb-4"
                  data-testid="profile-error-alert"
                >
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              {isEditingProfile ? (
                <form
                  onSubmit={handleUpdateProfile}
                  className="space-y-4"
                  data-testid="profile-form"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {tAuth("first_name")}
                      </label>
                      <Input
                        data-testid="profile-first-name-input"
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
                        data-testid="profile-last-name-input"
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
                      data-testid="profile-phone-input"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
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
                        id="profile-document-type"
                        name="documentType"
                        title={t("document_type")}
                        data-testid="profile-document-type-select"
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
                        <option value="PASSPORT">
                          {t("document_types.pa")}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {tAuth("doc_number")}
                      </label>
                      <Input
                        data-testid="profile-document-number-input"
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
                    <Button
                      data-testid="profile-save-button"
                      type="submit"
                      disabled={updateProfile.isPending}
                    >
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
                    <p className="font-medium">{user.username || "—"}</p>
                  </div>

                  {(user.phone || user.phoneNumber) && (
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {tAuth("phone")}
                      </p>
                      <p className="font-medium">
                        {user.phone || user.phoneNumber}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {t("tenant_id")}
                    </p>
                    <p className="font-medium">{user.tenantId || "—"}</p>
                  </div>

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
                      {user.roles.map((role, index: number) => (
                        <Badge key={index} variant="secondary">
                          {role.name}
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
                  data-testid="profile-change-password-button"
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
              <Alert
                variant="success"
                className="mb-4"
                data-testid="password-success-alert"
              >
                <AlertDescription>{passwordSuccess}</AlertDescription>
              </Alert>
            )}

            {passwordError && (
              <Alert
                variant="error"
                className="mb-4"
                data-testid="password-error-alert"
              >
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {isChangingPassword ? (
              <form
                onSubmit={handleChangePassword}
                className="space-y-4"
                data-testid="profile-password-form"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("current_password")}
                  </label>
                  <Input
                    data-testid="profile-current-password-input"
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
                    data-testid="profile-new-password-input"
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
                    data-testid="profile-confirm-password-input"
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
                  <Button
                    data-testid="profile-password-submit-button"
                    type="submit"
                    disabled={changePassword.isPending}
                  >
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

        {/* Preferencias */}
        <Card data-testid="profile-preferences-card">
          <CardHeader>
            <CardTitle>{t("preferences_title")}</CardTitle>
            <CardDescription>{t("preferences_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {preferencesSuccess && (
              <Alert
                variant="success"
                className="mb-4"
                data-testid="preferences-success-alert"
              >
                <AlertDescription>{preferencesSuccess}</AlertDescription>
              </Alert>
            )}

            {preferencesError && (
              <Alert
                variant="error"
                className="mb-4"
                data-testid="preferences-error-alert"
              >
                <AlertDescription>{preferencesError}</AlertDescription>
              </Alert>
            )}

            <form
              className="space-y-4"
              data-testid="profile-preferences-form"
              onSubmit={handleUpdatePreferences}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("preferences_language")}
                  </label>
                  <select
                    id="profile-preferences-language"
                    name="language"
                    title={t("preferences_language")}
                    className="w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-[var(--color-text-primary)]"
                    data-testid="preferences-language-select"
                    onChange={(event) =>
                      setPreferencesData((prev) => ({
                        ...prev,
                        language: event.target.value,
                      }))
                    }
                    value={preferencesData.language}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("preferences_theme")}
                  </label>
                  <select
                    className="w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-[var(--color-text-primary)]"
                    data-testid="preferences-theme-select"
                    onChange={(event) =>
                      setPreferencesData((prev) => ({
                        ...prev,
                        theme: event.target.value as UserPreferences["theme"],
                      }))
                    }
                    value={preferencesData.theme}
                  >
                    <option value="system">
                      {t("preferences_theme_system")}
                    </option>
                    <option value="light">
                      {t("preferences_theme_light")}
                    </option>
                    <option value="dark">{t("preferences_theme_dark")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("preferences_timezone")}
                </label>
                <Input
                  data-testid="preferences-timezone-input"
                  onChange={(event) =>
                    setPreferencesData((prev) => ({
                      ...prev,
                      timezone: event.target.value,
                    }))
                  }
                  value={preferencesData.timezone || ""}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">
                  {t("preferences_notifications")}
                </p>
                <div className="grid gap-2 md:grid-cols-3">
                  <Button
                    aria-pressed={preferencesData.notifications.email}
                    className="justify-between"
                    data-testid="preferences-email-toggle"
                    onClick={() => handleToggleNotification("email")}
                    type="button"
                    variant="outline"
                  >
                    <span>{t("preferences_notifications_email")}</span>
                    <Badge
                      variant={
                        preferencesData.notifications.email
                          ? "success"
                          : "default"
                      }
                    >
                      {preferencesData.notifications.email ? t("yes") : t("no")}
                    </Badge>
                  </Button>

                  <Button
                    aria-pressed={preferencesData.notifications.push}
                    className="justify-between"
                    data-testid="preferences-push-toggle"
                    onClick={() => handleToggleNotification("push")}
                    type="button"
                    variant="outline"
                  >
                    <span>{t("preferences_notifications_push")}</span>
                    <Badge
                      variant={
                        preferencesData.notifications.push
                          ? "success"
                          : "default"
                      }
                    >
                      {preferencesData.notifications.push ? t("yes") : t("no")}
                    </Badge>
                  </Button>

                  <Button
                    aria-pressed={preferencesData.notifications.sms}
                    className="justify-between"
                    data-testid="preferences-sms-toggle"
                    onClick={() => handleToggleNotification("sms")}
                    type="button"
                    variant="outline"
                  >
                    <span>{t("preferences_notifications_sms")}</span>
                    <Badge
                      variant={
                        preferencesData.notifications.sms
                          ? "success"
                          : "default"
                      }
                    >
                      {preferencesData.notifications.sms ? t("yes") : t("no")}
                    </Badge>
                  </Button>
                </div>
              </div>

              <Button
                data-testid="preferences-save-button"
                disabled={updatePreferences.isPending}
                type="submit"
              >
                {updatePreferences.isPending ? t("saving") : t("save")}
              </Button>
            </form>
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
