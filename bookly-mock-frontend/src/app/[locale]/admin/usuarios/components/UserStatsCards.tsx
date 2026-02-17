/**
 * UserStatsCards - Tarjetas de estadísticas de usuarios
 *
 * Muestra métricas clave del sistema de usuarios
 */

import { Card, CardContent } from "@/components/atoms/Card";
import type { Role, User } from "@/types/entities/user";
import { UserStatus } from "@/types/entities/user";
import { useTranslations } from "next-intl";

interface UserStatsCardsProps {
  users: User[];
  roles: Role[];
}

export function UserStatsCards({ users, roles }: UserStatsCardsProps) {
  const t = useTranslations("admin.users");

  const activeUsers = users.filter((u) => u.status === UserStatus.ACTIVE);
  const inactiveUsers = users.filter((u) => u.status !== UserStatus.ACTIVE);

  // Contar usuarios por rol más común
  const roleDistribution = users.reduce(
    (acc, user) => {
      user.roles.forEach((role) => {
        acc[role.name] = (acc[role.name] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostCommonRole = Object.entries(roleDistribution).sort(
    ([, a], [, b]) => b - a,
  )[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total usuarios */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("total_users")}
              </p>
              <h3 className="text-3xl font-bold text-foreground mt-2">
                {users.length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-brand-primary-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuarios activos */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("active_users")}
              </p>
              <h3 className="text-3xl font-bold text-foreground mt-2">
                {activeUsers.length}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {((activeUsers.length / users.length) * 100).toFixed(0)}%{" "}
                {t("of_total")}
              </p>
            </div>
            <div className="w-12 h-12 bg-state-success-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuarios inactivos */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("inactive_users")}
              </p>
              <h3 className="text-3xl font-bold text-foreground mt-2">
                {inactiveUsers.length}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {users.length > 0
                  ? ((inactiveUsers.length / users.length) * 100).toFixed(0)
                  : 0}
                % {t("of_total")}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles totales */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("total_roles")}
              </p>
              <h3 className="text-3xl font-bold text-foreground mt-2">
                {roles.length}
              </h3>
              {mostCommonRole && (
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  {t("most_common")}: {mostCommonRole[0]} ({mostCommonRole[1]})
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
