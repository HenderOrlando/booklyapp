/**
 * RoleStatsCards - Componente de estadísticas de roles
 *
 * Muestra tarjetas con métricas clave del sistema de roles
 */

import {
  Card,
  CardContent,
} from "@/components/atoms/Card";
import type { Permission, Role, User } from "@/types/entities/user";
import { useTranslations } from "next-intl";

interface RoleStatsCardsProps {
  roles: Role[];
  users: User[];
  permissions: Permission[];
}

export function RoleStatsCards({
  roles,
  users,
  permissions,
}: RoleStatsCardsProps) {
  const t = useTranslations("admin.roles");

  const stats = [
    {
      title: t("total_roles"),
      value: roles.length,
      icon: "🛡️",
      description: t("roles_in_system"),
      color: "bg-brand-primary-500/10 text-brand-primary-600",
      bgClass: "bg-gradient-to-br from-brand-primary-500/5 to-brand-primary-600/5 border-brand-primary-500/20",
      textClass: "text-brand-primary-600/80",
      valueClass: "text-brand-primary-800 dark:text-brand-primary-200"
    },
    {
      title: t("total_users"),
      value: users.length,
      icon: "👥",
      description: t("assigned_users"),
      color: "bg-state-success-500/10 text-state-success-700 dark:text-state-success-200",
      bgClass: "bg-gradient-to-br from-state-success-500/5 to-state-success-700/5 border-state-success-500/20",
      textClass: "text-state-success-700/80 dark:text-state-success-200/80",
      valueClass: "text-state-success-900 dark:text-state-success-200"
    },
    {
      title: t("unique_permissions"),
      value: permissions.length,
      icon: "🔑",
      description: t("system_permissions"),
      color: "bg-state-info-500/10 text-state-info-700 dark:text-state-info-200",
      bgClass: "bg-gradient-to-br from-state-info-500/5 to-state-info-700/5 border-state-info-500/20",
      textClass: "text-state-info-700/80 dark:text-state-info-200/80",
      valueClass: "text-state-info-900 dark:text-state-info-200"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`group hover:shadow-md transition-all duration-200 ${stat.bgClass}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${stat.textClass}`}>
                  {stat.title}
                </p>
                <h3 className={`text-3xl font-black leading-none mt-2 ${stat.valueClass}`}>
                  {stat.value}
                </h3>
                <p className={`text-[11px] font-medium mt-2 flex items-center gap-1 ${stat.textClass}`}>
                  {stat.description}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${stat.color}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
