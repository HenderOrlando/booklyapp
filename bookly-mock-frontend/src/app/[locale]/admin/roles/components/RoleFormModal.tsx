/**
 * RoleFormModal - Modal para crear/editar roles
 *
 * Componente modal que permite crear nuevos roles o editar existentes
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
import type { Permission, Role, User } from "@/types/entities/user";
import { useTranslations } from "next-intl";

interface RoleFormModalProps {
  show: boolean;
  selectedRole: Role | null;
  roleName: string;
  roleDescription: string;
  selectedPermissions: string[];
  selectedUsers: string[];
  allPermissions: Permission[];
  users: User[];
  activeTab: "permissions" | "users";
  filterPermissionModal: string;
  filterUserModal: string;
  isLoading?: boolean;
  onClose: () => void;
  onSave: () => void;
  onRoleNameChange: (value: string) => void;
  onRoleDescriptionChange: (value: string) => void;
  onTabChange: (tab: "permissions" | "users") => void;
  onFilterPermissionChange: (value: string) => void;
  onFilterUserChange: (value: string) => void;
  onPermissionToggle: (permissionId: string) => void;
  onUserToggle: (userId: string) => void;
}

export function RoleFormModal({
  show,
  selectedRole,
  roleName,
  roleDescription,
  selectedPermissions,
  selectedUsers,
  allPermissions,
  users,
  activeTab,
  filterPermissionModal,
  filterUserModal,
  isLoading = false,
  onClose,
  onSave,
  onRoleNameChange,
  onRoleDescriptionChange,
  onTabChange,
  onFilterPermissionChange,
  onFilterUserChange,
  onPermissionToggle,
  onUserToggle,
}: RoleFormModalProps) {
  const t = useTranslations("admin.roles");

  if (!show) return null;

  const filteredPermissions = allPermissions.filter(
    (p: Permission) =>
      p.description
        ?.toLowerCase()
        .includes(filterPermissionModal.toLowerCase()) ||
      p.resource.toLowerCase().includes(filterPermissionModal.toLowerCase()) ||
      p.action.toLowerCase().includes(filterPermissionModal.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u: User) =>
      `${u.firstName} ${u.lastName}`
        .toLowerCase()
        .includes(filterUserModal.toLowerCase()) ||
      u.email.toLowerCase().includes(filterUserModal.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {selectedRole ? t("modal_edit_title") : t("modal_create_title")}
              </CardTitle>
              <CardDescription>{t("modal_desc")}</CardDescription>
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
        <CardContent className="space-y-4">
          {/* Formulario básico */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t("role_name_label")}
            </label>
            <Input
              placeholder={t("role_placeholder")}
              value={roleName}
              onChange={(e) => onRoleNameChange(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t("role_desc_label")}
            </label>
            <Input
              placeholder={t("desc_placeholder")}
              value={roleDescription}
              onChange={(e) => onRoleDescriptionChange(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-[var(--color-border-strong)]">
            <nav className="flex gap-4">
              <button
                onClick={() => onTabChange("permissions")}
                disabled={isLoading}
                className={`pb-2 px-1 border-b-2 transition-colors ${
                  activeTab === "permissions"
                    ? "border-brand-primary-500 text-brand-primary-500"
                    : "border-transparent text-[var(--color-text-tertiary)] hover:text-white"
                }`}
              >
                {t("tab_permissions")} ({selectedPermissions.length})
              </button>
              <button
                onClick={() => onTabChange("users")}
                disabled={isLoading}
                className={`pb-2 px-1 border-b-2 transition-colors ${
                  activeTab === "users"
                    ? "border-brand-primary-500 text-brand-primary-500"
                    : "border-transparent text-[var(--color-text-tertiary)] hover:text-white"
                }`}
              >
                {t("tab_users")} ({selectedUsers.length})
              </button>
            </nav>
          </div>

          {/* Tab Content: Permisos */}
          {activeTab === "permissions" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white">
                  {t("select_permissions")} ({selectedPermissions.length}{" "}
                  {t("selected")}, {filteredPermissions.length} {t("visible")})
                </label>
                <Input
                  placeholder={t("filter_permissions")}
                  value={filterPermissionModal}
                  onChange={(e) => onFilterPermissionChange(e.target.value)}
                  className="max-w-xs"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
                {filteredPermissions.map((perm: Permission) => (
                  <label
                    key={perm.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                      selectedPermissions.includes(perm.id)
                        ? "bg-brand-primary-500/10 border-brand-primary-500 hover:bg-brand-primary-500/20"
                        : "bg-[var(--color-bg-primary)] border-[var(--color-border-strong)] hover:bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-strong)]"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => onPermissionToggle(perm.id)}
                      disabled={isLoading}
                      className="rounded w-4 h-4"
                    />
                    <div className="flex items-start gap-2 flex-1">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand-primary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {perm.resource.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium">
                          {perm.description}
                        </div>
                        <div className="text-[var(--color-text-tertiary)] text-xs mt-1">
                          {perm.resource}:{perm.action}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Usuarios */}
          {activeTab === "users" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white">
                  {t("assign_users")} ({selectedUsers.length} {t("selected")},{" "}
                  {filteredUsers.length} {t("visible")})
                </label>
                <Input
                  placeholder={t("filter_users")}
                  value={filterUserModal}
                  onChange={(e) => onFilterUserChange(e.target.value)}
                  className="max-w-xs"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
                {filteredUsers.map((user: User) => (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                      selectedUsers.includes(user.id)
                        ? "bg-brand-primary-500/10 border-brand-primary-500"
                        : "bg-[var(--color-bg-primary)] border-[var(--color-border-strong)] hover:bg-[var(--color-bg-secondary)]"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => onUserToggle(user.id)}
                      disabled={isLoading}
                      className="rounded w-4 h-4"
                    />
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-[var(--color-text-tertiary)] truncate">
                        {user.email}
                      </div>
                      {user.roles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.roles.map((role) => (
                            <Badge
                              key={role.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

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
                <>{selectedRole ? t("save_changes") : t("create_role")}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
