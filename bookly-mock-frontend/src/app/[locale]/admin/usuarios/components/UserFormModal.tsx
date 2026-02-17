/**
 * UserFormModal - Modal para crear/editar usuarios
 *
 * Formulario completo con datos personales y asignación de roles
 */

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
import type { Role, User } from "@/types/entities/user";
import { UserStatus } from "@/types/entities/user";
import { useTranslations } from "next-intl";

interface UserFormModalProps {
  show: boolean;
  selectedUser: User | null;
  // Form data
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  documentType: string;
  documentNumber: string;
  password: string;
  status: UserStatus;
  selectedRoles: string[];
  // Available data
  allRoles: Role[];
  filterRoles: string;
  // States
  isLoading?: boolean;
  // Callbacks
  onClose: () => void;
  onSave: () => void;
  onEmailChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onDocumentTypeChange: (value: string) => void;
  onDocumentNumberChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onStatusChange: (value: UserStatus) => void;
  onFilterRolesChange: (value: string) => void;
  onRoleToggle: (roleId: string) => void;
}

export function UserFormModal({
  show,
  selectedUser,
  email,
  username,
  firstName,
  lastName,
  phoneNumber,
  documentType,
  documentNumber,
  password,
  status,
  selectedRoles,
  allRoles,
  filterRoles,
  isLoading = false,
  onClose,
  onSave,
  onEmailChange,
  onUsernameChange,
  onFirstNameChange,
  onLastNameChange,
  onPhoneNumberChange,
  onDocumentTypeChange,
  onDocumentNumberChange,
  onPasswordChange,
  onStatusChange,
  onFilterRolesChange,
  onRoleToggle,
}: UserFormModalProps) {
  const t = useTranslations("admin.users");

  if (!show) return null;

  const filteredRoles = allRoles.filter(
    (r: Role) =>
      r.name.toLowerCase().includes(filterRoles.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(filterRoles.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {selectedUser ? t("edit_user_title") : t("create_user_title")}
              </CardTitle>
              <CardDescription>
                {selectedUser ? t("edit_user_desc") : t("create_user_desc")}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sección: Información básica */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t("basic_info")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("first_name")}{" "}
                  <span className="text-state-error-500">*</span>
                </label>
                <Input
                  placeholder={t("first_name_placeholder")}
                  value={firstName}
                  onChange={(e) => onFirstNameChange(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("last_name")}{" "}
                  <span className="text-state-error-500">*</span>
                </label>
                <Input
                  placeholder={t("last_name_placeholder")}
                  value={lastName}
                  onChange={(e) => onLastNameChange(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Sección: Credenciales */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t("credentials")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("email")} <span className="text-state-error-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder={t("email_placeholder")}
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  disabled={isLoading || !!selectedUser}
                />
                {selectedUser && (
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                    {t("email_readonly")}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("username")}{" "}
                  <span className="text-state-error-500">*</span>
                </label>
                <Input
                  placeholder={t("username_placeholder")}
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  disabled={isLoading || !!selectedUser}
                />
                {selectedUser && (
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                    {t("username_readonly")}
                  </p>
                )}
              </div>
            </div>
            {!selectedUser && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("password")}{" "}
                  <span className="text-state-error-500">*</span>
                </label>
                <Input
                  type="password"
                  placeholder={t("password_placeholder")}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  {t("password_hint")}
                </p>
              </div>
            )}
          </div>

          {/* Sección: Información adicional */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t("additional_info")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("phone_number")}
                </label>
                <Input
                  type="tel"
                  placeholder={t("phone_placeholder")}
                  value={phoneNumber}
                  onChange={(e) => onPhoneNumberChange(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("document_type")}
                </label>
                <select
                  value={documentType}
                  onChange={(e) => onDocumentTypeChange(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border-strong)] rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
                >
                  <option value="">{t("select_document_type")}</option>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="PASSPORT">Pasaporte</option>
                  <option value="OTHER">{t("other")}</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("document_number")}
              </label>
              <Input
                placeholder={t("document_number_placeholder")}
                value={documentNumber}
                onChange={(e) => onDocumentNumberChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Sección: Estado */}
          {selectedUser && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {t("account_status")}
              </h3>
              <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value as UserStatus)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border-strong)] rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
              >
                <option value={UserStatus.ACTIVE}>{t("status_active")}</option>
                <option value={UserStatus.INACTIVE}>
                  {t("status_inactive")}
                </option>
                <option value={UserStatus.SUSPENDED}>
                  {t("status_suspended")}
                </option>
                <option value={UserStatus.PENDING_VERIFICATION}>
                  {t("status_pending")}
                </option>
              </select>
            </div>
          )}

          {/* Sección: Roles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">
                {t("assign_roles")} ({selectedRoles.length} {t("selected")})
              </h3>
              <Input
                placeholder={t("filter_roles")}
                value={filterRoles}
                onChange={(e) => onFilterRolesChange(e.target.value)}
                className="max-w-xs"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {filteredRoles.map((role: Role) => (
                <label
                  key={role.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                    selectedRoles.includes(role.id)
                      ? "bg-brand-primary-500/10 border-brand-primary-500"
                      : "bg-[var(--color-bg-primary)] border-[var(--color-border-strong)] hover:bg-[var(--color-bg-secondary)]"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => onRoleToggle(role.id)}
                    disabled={isLoading}
                    className="rounded w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-sm font-medium">
                        {role.name}
                      </span>
                      {role.isSystem && (
                        <Badge variant="warning" className="text-xs">
                          {t("system_role")}
                        </Badge>
                      )}
                    </div>
                    {role.description && (
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                        {role.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 justify-end pt-4 border-t border-[var(--color-border-strong)]">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {t("cancel")}
            </Button>
            <Button onClick={onSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {t("saving")}
                </>
              ) : (
                <>{selectedUser ? t("save_changes") : t("create_user")}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
