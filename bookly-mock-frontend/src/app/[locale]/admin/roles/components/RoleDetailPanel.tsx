/**
 * RoleDetailPanel - Panel de detalles de un rol
 *
 * Muestra información completa de un rol con sus permisos y usuarios asignados
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

interface RoleDetailPanelProps {
  show: boolean;
  role: Role | null;
  users: User[];
  filterPermissionDetail: string;
  filterUserDetail: string;
  isDeleting?: boolean;
  onClose: () => void;
  onDelete?: (roleId: string) => void;
  onFilterPermissionChange: (value: string) => void;
  onFilterUserDetailChange: (value: string) => void;
}

export function RoleDetailPanel({
  show,
  role,
  users,
  filterPermissionDetail,
  filterUserDetail,
  isDeleting = false,
  onClose,
  onDelete,
  onFilterPermissionChange,
  onFilterUserDetailChange,
}: RoleDetailPanelProps) {
  const t = useTranslations("admin.roles");

  if (!show || !role) return null;

  const usersWithRole = users.filter((u: User) =>
    u.roles.some((r) => r.id === role.id)
  );

  const filteredPermissions = role.permissions.filter(
    (p: Permission) =>
      p.description
        ?.toLowerCase()
        .includes(filterPermissionDetail.toLowerCase()) ||
      p.resource.toLowerCase().includes(filterPermissionDetail.toLowerCase()) ||
      p.action.toLowerCase().includes(filterPermissionDetail.toLowerCase())
  );

  const filteredUsers = usersWithRole.filter(
    (u: User) =>
      `${u.firstName} ${u.lastName}`
        .toLowerCase()
        .includes(filterUserDetail.toLowerCase()) ||
      u.email.toLowerCase().includes(filterUserDetail.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("role_details")}</CardTitle>
                <CardDescription>{t("view_role_info")}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isDeleting}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">
                  {t("name")}
                </label>
                <div className="text-white mt-1">{role.name}</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400">
                {t("description")}
              </label>
              <div className="text-white mt-1">{role.description}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">
                  {t("assigned_users")}
                </label>
                <div className="text-white mt-1">{usersWithRole.length}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">
                  {t("type")}
                </label>
                <div className="mt-1">
                  <Badge variant={role.isSystem ? "warning" : "primary"}>
                    {role.isSystem ? t("system_role") : t("custom_role")}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Permisos asignados */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-400">
                  {t("assigned_permissions")} ({filteredPermissions.length} /{" "}
                  {role.permissions.length})
                </label>
                <Input
                  placeholder={t("filter_permissions")}
                  value={filterPermissionDetail}
                  onChange={(e) => onFilterPermissionChange(e.target.value)}
                  className="max-w-xs"
                  disabled={isDeleting}
                />
              </div>
              {role.permissions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {t("no_permissions_assigned")}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {filteredPermissions.map((perm: Permission) => (
                    <div
                      key={perm.id}
                      className="p-3 bg-gradient-to-r from-gray-800 to-gray-750 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-brand-primary-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {perm.resource.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium">
                            {perm.description}
                          </div>
                          <div className="text-gray-400 text-xs mt-1">
                            {perm.resource}:{perm.action}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Usuarios con este rol */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-400">
                  {t("users_with_role")} ({filteredUsers.length} /{" "}
                  {usersWithRole.length})
                </label>
                <Input
                  placeholder={t("filter_users")}
                  value={filterUserDetail}
                  onChange={(e) => onFilterUserDetailChange(e.target.value)}
                  className="max-w-xs"
                  disabled={isDeleting}
                />
              </div>
              {usersWithRole.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {t("no_users_assigned")}
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredUsers.map((user: User) => (
                    <div
                      key={user.id}
                      className="p-3 bg-gradient-to-r from-gray-800 to-gray-750 rounded-lg border border-gray-700 hover:border-brand-primary-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
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
                          <div className="text-xs text-gray-400 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div>
                <label className="text-sm font-medium text-gray-400">
                  {t("created_at")}
                </label>
                <div className="text-white mt-1">
                  {new Date(role.createdAt).toLocaleString("es-ES")}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">
                  {t("updated_at")}
                </label>
                <div className="text-white mt-1">
                  {new Date(role.updatedAt).toLocaleString("es-ES")}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 justify-end">
              {!role.isSystem && onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => onDelete(role.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {t("deleting")}
                    </>
                  ) : (
                    t("delete")
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                {t("close")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
