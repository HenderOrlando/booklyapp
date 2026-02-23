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
      color: "bg-brand-primary-500/10 text-brand-primary-500",
    },
    {
      title: t("total_users"),
      value: users.length,
      icon: "👥",
      description: t("assigned_users"),
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: t("unique_permissions"),
      value: permissions.length,
      icon: "🔑",
      description: t("system_permissions"),
      color: "bg-emerald-500/10 text-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-black text-foreground">
                  {stat.value}
                </h3>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
