/**
 * UserStatsCards - Tarjetas de estadísticas de usuarios
 *
 * Muestra métricas clave del sistema de usuarios
 */

import { Card, CardContent } from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import type { Role, User } from "@/types/entities/user";
import { UserStatus } from "@/types/entities/user";
import { useTranslations } from "next-intl";

interface UserStatsCardsProps {
  users: User[];
  roles: Role[];
  isLoading?: boolean;
}

export function UserStatsCards({
  users,
  roles,
  isLoading = false,
}: UserStatsCardsProps) {
  const t = useTranslations("admin.users");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-gray-500/5 to-gray-600/5 border-gray-500/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="w-12 h-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-brand-primary-500/5 to-brand-primary-600/5 border-brand-primary-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary-600/80 mb-1">
                {t("total_users")}
              </p>
              <h3 className="text-3xl font-black text-brand-primary-800 dark:text-brand-primary-200 leading-none mt-2">
                {users.length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-brand-primary-500/10 text-brand-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuarios activos */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-success-500/5 to-state-success-700/5 border-state-success-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-state-success-700/80 dark:text-state-success-200/80 mb-1">
                {t("active_users")}
              </p>
              <h3 className="text-3xl font-black text-state-success-900 dark:text-state-success-200 leading-none mt-2">
                {activeUsers.length}
              </h3>
              <p className="text-[11px] font-medium text-state-success-700/70 dark:text-state-success-200/70 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-state-success-500" />
                {((activeUsers.length / users.length) * 100).toFixed(0)}%{" "}
                {t("of_total")}
              </p>
            </div>
            <div className="w-12 h-12 bg-state-success-500/10 text-state-success-700 dark:text-state-success-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuarios inactivos */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-warning-500/5 to-state-warning-700/5 border-state-warning-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-state-warning-700/80 dark:text-state-warning-200/80 mb-1">
                {t("inactive_users")}
              </p>
              <h3 className="text-3xl font-black text-state-warning-900 dark:text-state-warning-200 leading-none mt-2">
                {inactiveUsers.length}
              </h3>
              <p className="text-[11px] font-medium text-state-warning-700/70 dark:text-state-warning-200/70 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-state-warning-500" />
                {users.length > 0
                  ? ((inactiveUsers.length / users.length) * 100).toFixed(0)
                  : 0}
                % {t("of_total")}
              </p>
            </div>
            <div className="w-12 h-12 bg-state-warning-500/10 text-state-warning-700 dark:text-state-warning-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles totales */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-purple-500/5 to-purple-600/5 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700/80 dark:text-purple-200/80 mb-1">
                {t("total_roles")}
              </p>
              <h3 className="text-3xl font-black text-purple-900 dark:text-purple-200 leading-none mt-2">
                {roles.length}
              </h3>
              {mostCommonRole && (
                <p className="text-[11px] font-medium text-purple-700/70 dark:text-purple-200/70 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-purple-500" />
                  {t("most_common")}: {mostCommonRole[0]} ({mostCommonRole[1]})
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-500/10 text-purple-700 dark:text-purple-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">🎭</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
