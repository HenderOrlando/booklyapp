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
import * as React from "react";

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

  const usersWithRole = React.useMemo(() => {
    if (!role) return [];
    return users.filter((u: User) =>
      u.roles.some((r) => r.id === role.id),
    );
  }, [users, role]);

  const filteredPermissions = React.useMemo(() => {
    if (!role) return [];
    return role.permissions.filter(
      (p: Permission) =>
        p.description
          ?.toLowerCase()
          .includes(filterPermissionDetail.toLowerCase()) ||
        p.resource.toLowerCase().includes(filterPermissionDetail.toLowerCase()) ||
        p.action.toLowerCase().includes(filterPermissionDetail.toLowerCase()),
    );
  }, [role, filterPermissionDetail]);

  const groupedPermissions = React.useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    filteredPermissions.forEach((p) => {
      if (!groups[p.resource]) {
        groups[p.resource] = [];
      }
      groups[p.resource].push(p);
    });
    return groups;
  }, [filteredPermissions]);

  const filteredUsers = React.useMemo(() => {
    return usersWithRole.filter(
      (u: User) =>
        `${u.firstName} ${u.lastName}`
          .toLowerCase()
          .includes(filterUserDetail.toLowerCase()) ||
        u.email.toLowerCase().includes(filterUserDetail.toLowerCase()),
    );
  }, [usersWithRole, filterUserDetail]);

  if (!show || !role) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4">
        <Card>
          <CardHeader className="border-b border-[var(--color-border-strong)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role.isSystem ? 'bg-warning-500/20 text-warning-500' : 'bg-brand-primary-500/20 text-brand-primary-500'}`}>
                  {role.isSystem ? '⚙️' : '👤'}
                </div>
                <div>
                  <CardTitle className="text-2xl">{role.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {role.isSystem ? (
                      <Badge variant="warning">{t("system_role")}</Badge>
                    ) : (
                      <Badge variant="primary">{t("custom_role")}</Badge>
                    )}
                    <span>•</span>
                    <span>{role.description}</span>
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isDeleting}
                className="rounded-full w-10 h-10 p-0"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 py-6">
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-strong)]">
                <div className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">{t("assigned_users")}</div>
                <div className="text-2xl font-bold mt-1">{usersWithRole.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-strong)]">
                <div className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">{t("permissions")}</div>
                <div className="text-2xl font-bold mt-1">{role.permissions.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-strong)]">
                <div className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">{t("updated_at")}</div>
                <div className="text-sm font-bold mt-2">{new Date(role.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Permisos asignados */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border-strong)] pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  🛡️ {t("assigned_permissions")}
                  <span className="text-sm font-normal text-[var(--color-text-tertiary)]">
                    ({filteredPermissions.length} {t("selected")})
                  </span>
                </h3>
                <Input
                  placeholder={t("filter_permissions")}
                  value={filterPermissionDetail}
                  onChange={(e) => onFilterPermissionChange(e.target.value)}
                  className="max-w-xs h-9"
                  disabled={isDeleting}
                />
              </div>

              {role.permissions.length === 0 ? (
                <div className="text-center py-12 bg-[var(--color-bg-secondary)] rounded-xl border border-dashed border-[var(--color-border-strong)]">
                  <p className="text-[var(--color-text-tertiary)]">{t("no_permissions_assigned")}</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto pr-2 space-y-6">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div key={resource} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-[var(--color-border-strong)]/50 pb-1">
                        <span className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">
                          {resource}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {perms.map((perm: Permission) => (
                          <div
                            key={perm.id}
                            className="p-3 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-strong)] flex items-start gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-brand-primary-500/10 flex items-center justify-center text-brand-primary-500 font-bold text-xs">
                              {perm.action.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">{perm.description}</div>
                              <code className="text-[10px] text-[var(--color-text-tertiary)] bg-[var(--color-bg-primary)] px-1.5 py-0.5 rounded mt-1 inline-block">
                                {perm.action}
                              </code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Usuarios con este rol */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border-strong)] pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  👥 {t("users_with_role")}
                  <span className="text-sm font-normal text-[var(--color-text-tertiary)]">
                    ({filteredUsers.length} / {usersWithRole.length})
                  </span>
                </h3>
                <Input
                  placeholder={t("filter_users")}
                  value={filterUserDetail}
                  onChange={(e) => onFilterUserDetailChange(e.target.value)}
                  className="max-w-xs h-9"
                  disabled={isDeleting}
                />
              </div>

              {usersWithRole.length === 0 ? (
                <div className="text-center py-12 bg-[var(--color-bg-secondary)] rounded-xl border border-dashed border-[var(--color-border-strong)]">
                  <p className="text-[var(--color-text-tertiary)]">{t("no_users_assigned")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                  {filteredUsers.map((user: User) => (
                    <div
                      key={user.id}
                      className="p-3 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-strong)] flex items-center gap-3 hover:border-brand-primary-500 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-brand-primary-500 rounded-full flex items-center justify-center font-bold text-foreground">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-[var(--color-text-tertiary)] truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer de acciones */}
            <div className="flex gap-3 justify-end pt-6 border-t border-[var(--color-border-strong)]">
              {!role.isSystem && onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => onDelete(role.id)}
                  disabled={isDeleting}
                  className="min-w-[120px]"
                >
                  {isDeleting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin text-lg">⏳</span>
                      {t("deleting")}
                    </span>
                  ) : (
                    t("delete")
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={onClose} disabled={isDeleting} className="min-w-[120px]">
                {t("close")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
