/**
 * RoleStatsCards - Componente de estadísticas de roles
 *
 * Muestra tarjetas con métricas clave del sistema de roles
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("total_roles")}</CardTitle>
          <CardDescription>{t("roles_in_system")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-brand-primary-500">
            {roles.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("total_users")}</CardTitle>
          <CardDescription>{t("assigned_users")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-brand-primary-500">
            {users.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("unique_permissions")}</CardTitle>
          <CardDescription>{t("system_permissions")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-brand-primary-500">
            {permissions.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
