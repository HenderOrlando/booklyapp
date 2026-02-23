/**
 * UserDetailPanel - Panel de detalles de un usuario
 *
 * Muestra información completa incluyendo roles y permisos efectivos
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
import { Skeleton } from "@/components/atoms/Skeleton";
import { usePrograms } from "@/hooks/usePrograms";
import type { Permission, User } from "@/types/entities/user";
import { UserStatus } from "@/types/entities/user";
import { useTranslations } from "next-intl";
import * as React from "react";

interface UserDetailPanelProps {
  show: boolean;
  user: User | null;
  filterPermissions: string;
  isLoading?: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  onFilterPermissionsChange: (value: string) => void;
}

export function UserDetailPanel({
  show,
  user,
  filterPermissions,
  isLoading = false,
  isDeleting = false,
  onClose,
  onEdit,
  onDelete,
  onFilterPermissionsChange,
}: UserDetailPanelProps) {
  const t = useTranslations("admin.users");
  const { data: programs = [] } = usePrograms();

  // Obtener permisos efectivos de todos los roles del usuario
  const effectivePermissions = React.useMemo(() => {
    if (!user) return [];
    const permsMap = new Map<string, Permission>();
    user.roles.forEach((role) => {
      role.permissions.forEach((perm) => {
        if (!permsMap.has(perm.id)) {
          permsMap.set(perm.id, perm);
        }
      });
    });
    return Array.from(permsMap.values());
  }, [user]);

  if (!show) return null;

  // Render Skeleton while loading
  if (isLoading || !user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Button variant="outline" size="sm" onClick={onClose}>✕</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-5 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-24 rounded-full" />
                    <Skeleton className="h-10 w-24 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredPermissions = effectivePermissions.filter(
    (p: Permission) =>
      p.description?.toLowerCase().includes(filterPermissions.toLowerCase()) ||
      p.resource.toLowerCase().includes(filterPermissions.toLowerCase()) ||
      p.action.toLowerCase().includes(filterPermissions.toLowerCase()),
  );

  const statusConfig: Record<
    UserStatus,
    { variant: "success" | "warning" | "error" | "secondary"; label: string }
  > = {
    [UserStatus.ACTIVE]: {
      variant: "success",
      label: t("status_active"),
    },
    [UserStatus.INACTIVE]: {
      variant: "secondary",
      label: t("status_inactive"),
    },
    [UserStatus.SUSPENDED]: {
      variant: "error",
      label: t("status_suspended"),
    },
    [UserStatus.PENDING_VERIFICATION]: {
      variant: "warning",
      label: t("status_pending"),
    },
  };

  const statusInfo = statusConfig[user.status];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("user_details")}</CardTitle>
                <CardDescription>{t("view_user_info")}</CardDescription>
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
            {/* Información personal */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {t("personal_info")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                    {t("full_name")}
                  </label>
                  <div className="text-foreground mt-1">
                    {user.firstName} {user.lastName}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                    {t("username")}
                  </label>
                  <div className="text-foreground mt-1">{user.username}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                    {t("email")}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-foreground">{user.email}</span>
                    {user.emailVerified && (
                      <Badge variant="success" className="text-xs">
                        {t("verified")}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                    {t("phone_number")}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-foreground">
                      {user.phoneNumber || t("not_provided")}
                    </span>
                    {user.phoneVerified && (
                      <Badge variant="success" className="text-xs">
                        {t("verified")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de Programa */}
              {(user.programId || user.coordinatedProgramId) && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                      {t("program_id") || "Programa Académico"}
                    </label>
                    <div className="text-foreground mt-1">
                      {programs.find((p) => p.id === user.programId)?.name ||
                        user.programId ||
                        t("not_provided")}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                      {t("coordinated_program_id") || "Programa Coordinado"}
                    </label>
                    <div className="text-foreground mt-1">
                      {programs.find((p) => p.id === user.coordinatedProgramId)?.name ||
                        user.coordinatedProgramId ||
                        t("not_provided")}
                    </div>
                  </div>
                </div>
              )}

              {/* Documento */}
              {(user.documentType || user.documentNumber) && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                      {t("document_type")}
                    </label>
                    <div className="text-foreground mt-1">
                      {user.documentType || t("not_provided")}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                      {t("document_number")}
                    </label>
                    <div className="text-foreground mt-1">
                      {user.documentNumber || t("not_provided")}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Estado y seguridad */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                  {t("account_status")}
                </label>
                <div className="mt-1">
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                  {t("two_factor")}
                </label>
                <div className="mt-1">
                  <Badge
                    variant={user.twoFactorEnabled ? "success" : "secondary"}
                  >
                    {user.twoFactorEnabled ? t("enabled") : t("disabled")}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                  {t("last_login")}
                </label>
                <div className="text-foreground mt-1">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString("es-ES")
                    : t("never")}
                </div>
              </div>
            </div>

            {/* Roles asignados */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {t("assigned_roles")} ({user.roles.length})
              </h3>
              {user.roles.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-tertiary)]">
                  {t("no_roles_assigned")}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {user.roles.map((role) => (
                    <div
                      key={role.id}
                      className="p-4 bg-gradient-to-r from-gray-800 to-gray-750 rounded-lg border border-[var(--color-border-strong)]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-foreground font-medium">
                          {role.name}
                        </span>
                        {role.isSystem && (
                          <Badge variant="warning" className="text-xs">
                            {t("system_role")}
                          </Badge>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          {role.description}
                        </p>
                      )}
                      <div className="text-xs text-[var(--color-text-tertiary)] mt-2">
                        {role.permissions.length} {t("permissions")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Permisos efectivos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("effective_permissions")} ({filteredPermissions.length} /{" "}
                  {effectivePermissions.length})
                </h3>
                <Input
                  placeholder={t("filter_permissions")}
                  value={filterPermissions}
                  onChange={(e) => onFilterPermissionsChange(e.target.value)}
                  className="max-w-xs"
                  disabled={isDeleting}
                />
              </div>
              {effectivePermissions.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-tertiary)]">
                  {t("no_permissions")}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {filteredPermissions.map((perm: Permission) => (
                    <div
                      key={perm.id}
                      className="p-3 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border-strong)]"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-brand-primary-500 rounded-lg flex items-center justify-center">
                          <span className="text-foreground text-xs font-bold">
                            {perm.resource.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-foreground text-xs font-medium">
                            {perm.description ||
                              `${perm.resource}:${perm.action}`}
                          </div>
                          <div className="text-[var(--color-text-tertiary)] text-xs mt-1">
                            {perm.resource}:{perm.action}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border-strong)]">
              <div>
                <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                  {t("created_at")}
                </label>
                <div className="text-foreground mt-1">
                  {new Date(user.createdAt).toLocaleString("es-ES")}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                  {t("updated_at")}
                </label>
                <div className="text-foreground mt-1">
                  {new Date(user.updatedAt).toLocaleString("es-ES")}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 justify-end pt-6 border-t border-[var(--color-border-strong)]">
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={() => onEdit(user)}
                  disabled={isDeleting}
                >
                  {t("edit")}
                </Button>
              )}
              {onDelete && user.status !== UserStatus.SUSPENDED && (
                <Button
                  variant="destructive"
                  onClick={() => onDelete(user.id)}
                  disabled={isDeleting}
                  className="bg-state-error-600 hover:bg-state-error-700 text-white"
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
