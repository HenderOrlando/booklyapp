/**
 * RolesTable - Componente de tabla de roles
 *
 * Muestra la lista de roles con acciones
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
import { DataTable } from "@/components/molecules/DataTable";
import type { Role } from "@/types/entities/user";
import { useTranslations } from "next-intl";

// Extender Role con usersCount
interface RoleWithStats extends Role {
  usersCount: number;
}

interface RolesTableProps {
  roles: RoleWithStats[];
  onEdit: (role: Role) => void;
  onView: (role: Role) => void;
  filter: string;
  onFilterChange: (value: string) => void;
}

export function RolesTable({
  roles,
  onEdit,
  onView,
  filter,
  onFilterChange,
}: RolesTableProps) {
  const t = useTranslations("admin.roles");

  // Columnas para la tabla de roles
  const roleColumns = [
    {
      key: "name",
      header: t("role_name"),
      cell: (role: RoleWithStats) => (
        <div>
          <div className="font-medium text-foreground">{role.name}</div>
          <div className="text-sm text-[var(--color-text-tertiary)]">
            {role.description || ""}
          </div>
        </div>
      ),
    },
    {
      key: "permissions",
      header: t("permissions"),
      cell: (role: RoleWithStats) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions.slice(0, 3).map((perm) => (
            <Badge key={perm.id} variant="secondary">
              {perm.description}
            </Badge>
          ))}
          {role.permissions.length > 3 && (
            <Badge variant="secondary">
              {t("more", { count: role.permissions.length - 3 })}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "usersCount",
      header: t("users"),
      cell: (role: RoleWithStats) => (
        <Badge variant="primary">{role.usersCount}</Badge>
      ),
    },
    {
      key: "actions",
      header: t("actions"),
      cell: (role: RoleWithStats) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(role)}>
            {t("edit")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onView(role)}>
            {t("view")}
          </Button>
        </div>
      ),
    },
  ];

  // Filtrar roles
  const filteredRoles = roles.filter(
    (role: RoleWithStats) =>
      role.name.toLowerCase().includes(filter.toLowerCase()) ||
      (role.description || "").toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("roles_list")}</CardTitle>
            <CardDescription>{t("manage_system_roles")}</CardDescription>
          </div>
          <Input
            placeholder={t("filter_roles")}
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <DataTable data={filteredRoles} columns={roleColumns} />
      </CardContent>
    </Card>
  );
}
