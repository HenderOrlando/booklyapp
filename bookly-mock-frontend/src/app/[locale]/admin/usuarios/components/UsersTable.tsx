/**
 * UsersTable - Tabla de usuarios del sistema
 *
 * Muestra lista de usuarios con filtrado y acciones
 */

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { DataTable } from "@/components/molecules/DataTable";
import type { User } from "@/types/entities/user";
import { UserStatus } from "@/types/entities/user";
import { useTranslations } from "next-intl";

interface UsersTableProps {
  users: User[];
  filter: string;
  onFilterChange: (value: string) => void;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
}

export function UsersTable({
  users,
  filter,
  onFilterChange,
  onEdit,
  onView,
}: UsersTableProps) {
  const t = useTranslations("admin.users");

  // Definir columnas de la tabla
  const columns = [
    {
      key: "fullName",
      header: t("name"),
      cell: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-brand-primary-500 rounded-full flex items-center justify-center">
            <span className="text-foreground font-bold text-sm">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-foreground font-medium">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-[var(--color-text-tertiary)]">
              {user.username}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: t("email"),
      cell: (user: User) => (
        <div>
          <div className="text-foreground">{user.email}</div>
          {user.emailVerified && (
            <Badge variant="success" className="text-xs mt-1">
              {t("verified")}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "roles",
      header: t("roles"),
      cell: (user: User) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.length === 0 ? (
            <Badge variant="secondary" className="text-xs">
              {t("no_roles")}
            </Badge>
          ) : (
            user.roles.map((role) => (
              <Badge key={role.id} variant="primary" className="text-xs">
                {role.name}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: t("status"),
      cell: (user: User) => {
        const statusConfig: Record<
          UserStatus,
          {
            variant: "success" | "warning" | "error" | "secondary";
            label: string;
          }
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

        const config = statusConfig[user.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "lastLogin",
      header: t("last_login"),
      cell: (user: User) => (
        <div className="text-foreground text-sm">
          {user.lastLoginAt
            ? new Date(user.lastLoginAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : t("never")}
        </div>
      ),
    },
    {
      key: "actions",
      header: t("actions"),
      cell: (user: User) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onView(user)}>
            {t("view")}
          </Button>
          <Button size="sm" variant="default" onClick={() => onEdit(user)}>
            {t("edit")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("users_list")}</CardTitle>
          <Input
            placeholder={t("search_placeholder")}
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent>
        <DataTable data={users} columns={columns} />
      </CardContent>
    </Card>
  );
}
