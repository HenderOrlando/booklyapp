/**
 * ResourcesTable - Tabla de recursos del sistema
 *
 * Incluye vista de tabla y lista virtualizada
 */

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { EmptyState } from "@/components/atoms/EmptyState";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { DataTable } from "@/components/molecules/DataTable";
import { VirtualizedList } from "@/components/organisms/VirtualizedList";
import type { Resource } from "@/types/entities/resource";
import { useTranslations } from "next-intl";

interface ResourcesTableProps {
  resources: Resource[];
  useVirtualScrolling: boolean;
  onView: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
}

export function ResourcesTable({
  resources,
  useVirtualScrolling,
  onView,
  onEdit,
  onDelete,
}: ResourcesTableProps) {
  const t = useTranslations("resources");
  const tCommon = useTranslations("common");

  // Columnas de la tabla
  const columns = [
    {
      key: "code",
      header: t("code"),
      cell: (resource: Resource) => (
        <div>
          <p className="font-medium text-foreground">{resource.code}</p>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            {resource.name}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: t("type"),
      cell: (resource: Resource) => (
        <Badge variant="outline">{resource.type}</Badge>
      ),
    },
    {
      key: "capacity",
      header: t("capacity"),
      cell: (resource: Resource) => `${resource.capacity} ${t("people")}`,
      className: "text-center",
    },
    {
      key: "location",
      header: t("location"),
      cell: (resource: Resource) => (
        <div className="text-sm text-[var(--color-text-secondary)]">
          {resource.location}
        </div>
      ),
    },
    {
      key: "status",
      header: t("status"),
      cell: (resource: Resource) => (
        <StatusBadge type="resource" status={resource.status} />
      ),
      className: "text-center",
    },
    {
      key: "actions",
      header: t("actions"),
      cell: (resource: Resource) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onView(resource)}>
            {t("view")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(resource)}>
            {tCommon("edit")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(resource)}
          >
            {tCommon("delete")}
          </Button>
        </div>
      ),
    },
  ];

  // Renderizado de item para lista virtualizada
  const renderResourceItem = (resource: Resource) => (
    <div className="bg-[var(--color-bg-primary)] rounded-lg p-4 border border-[var(--color-border-strong)] hover:border-[var(--color-border-strong)] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground">
              {resource.name}
            </h3>
            <Badge variant="outline">{resource.type}</Badge>
            <StatusBadge type="resource" status={resource.status} />
          </div>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            {t("code")}: {resource.code}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <span className="text-[var(--color-text-tertiary)]">
            {t("capacity")}:
          </span>
          <span className="text-foreground ml-2">
            {resource.capacity} {t("people")}
          </span>
        </div>
        <div>
          <span className="text-[var(--color-text-tertiary)]">
            {t("location")}:
          </span>
          <span className="text-foreground ml-2">{resource.location}</span>
        </div>
      </div>

      {resource.description && (
        <p className="text-sm text-[var(--color-text-tertiary)] mb-3 line-clamp-2">
          {resource.description}
        </p>
      )}

      <div className="flex gap-2 pt-3 border-t border-[var(--color-border-strong)]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(resource)}
          className="flex-1"
        >
          {t("view")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(resource)}
          className="flex-1"
        >
          {tCommon("edit")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(resource)}
          className="flex-1"
        >
          {tCommon("delete")}
        </Button>
      </div>
    </div>
  );

  // Sin recursos
  if (resources.length === 0) {
    return (
      <EmptyState
        title={t("no_resources")}
        description={t("no_resources_desc")}
        icon="📦"
      />
    );
  }

  // Vista de tabla vs lista virtualizada
  if (useVirtualScrolling) {
    return (
      <VirtualizedList
        items={resources}
        renderItem={renderResourceItem}
        itemHeight={180}
        className="max-h-[600px]"
      />
    );
  }

  return <DataTable data={resources} columns={columns} />;
}
