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
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${role.isSystem ? 'bg-warning-500/20 text-warning-500' : 'bg-brand-primary-500/20 text-brand-primary-500'}`}>
            {role.isSystem ? '⚙️' : '👤'}
          </div>
          <div>
            <div className="font-bold text-foreground flex items-center gap-2">
              {role.name}
              {role.isSystem && (
                <Badge variant="warning" className="text-[10px] py-0 px-1.5 h-4">
                  {t("system")}
                </Badge>
              )}
            </div>
            <div className="text-xs text-[var(--color-text-tertiary)] max-w-xs truncate">
              {role.description || ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "permissions",
      header: t("permissions"),
      cell: (role: RoleWithStats) => (
        <div className="flex flex-wrap gap-1 max-w-md">
          {role.permissions.slice(0, 3).map((perm) => (
            <Badge key={perm.id} variant="secondary" className="text-[10px] bg-[var(--color-bg-secondary)] border-[var(--color-border-strong)]">
              {perm.description}
            </Badge>
          ))}
          {role.permissions.length > 3 && (
            <Badge variant="secondary" className="text-[10px]">
              {t("more", { count: role.permissions.length - 3 })}
            </Badge>
          )}
          {role.permissions.length === 0 && (
            <span className="text-xs text-[var(--color-text-tertiary)] italic">
              {t("no_permissions")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "usersCount",
      header: t("users"),
      cell: (role: RoleWithStats) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-primary-500"></div>
          <span className="font-medium text-sm">{role.usersCount}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: t("actions"),
      cell: (role: RoleWithStats) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onView(role)}
            className="h-8 w-8 p-0"
            title={t("view")}
          >
            👁️
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(role)}
            className="h-8 w-8 p-0"
            title={t("edit")}
          >
            ✏️
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
