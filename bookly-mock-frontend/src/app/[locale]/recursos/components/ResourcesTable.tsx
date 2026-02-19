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
import { Resource, ResourceType } from "@/types/entities/resource";
import {
  Edit2,
  Eye,
  Hash,
  MapPin,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface ResourcesTableProps {
  resources: Resource[];
  useVirtualScrolling: boolean;
  onView: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onRestore?: (resource: Resource) => void;
}

export function ResourcesTable({
  resources,
  useVirtualScrolling,
  onView,
  onEdit,
  onDelete,
  onRestore,
}: ResourcesTableProps) {
  const t = useTranslations("resources");
  const tCommon = useTranslations("common");

  const RESOURCE_TYPE_LABELS: Record<string, string> = {
    [ResourceType.CLASSROOM]: t("type_labels.CLASSROOM"),
    [ResourceType.LABORATORY]: t("type_labels.LABORATORY"),
    [ResourceType.AUDITORIUM]: t("type_labels.AUDITORIUM"),
    [ResourceType.MULTIMEDIA_EQUIPMENT]: t("type_labels.MULTIMEDIA_EQUIPMENT"),
    [ResourceType.SPORTS_FACILITY]: t("type_labels.SPORTS_FACILITY"),
    [ResourceType.MEETING_ROOM]: t("type_labels.MEETING_ROOM"),
    [ResourceType.VEHICLE]: t("type_labels.VEHICLE"),
    [ResourceType.OTHER]: t("type_labels.OTHER"),
  };
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
        <Badge variant="outline">
          {RESOURCE_TYPE_LABELS[resource.type] || resource.type}
        </Badge>
      ),
    },
    {
      key: "capacity",
      header: (
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[var(--color-text-tertiary)]" />
          <span>{t("capacity")}</span>
        </div>
      ),
      cell: (resource: Resource) => (
        <span className="font-medium">{resource.capacity}</span>
      ),
      className: "text-center",
    },
    {
      key: "location",
      header: (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[var(--color-text-tertiary)]" />
          <span>{t("location")}</span>
        </div>
      ),
      cell: (resource: Resource) => (
        <div className="text-sm text-[var(--color-text-secondary)] font-medium">
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(resource)}
            className="h-8 w-8 p-0 hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
            title={t("view")}
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(resource)}
            className="h-8 w-8 p-0 hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
            title={tCommon("edit")}
          >
            <Edit2 size={16} />
          </Button>
          {resource.status === "UNAVAILABLE" && onRestore ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(resource)}
              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
              title={t("restore")}
            >
              <RefreshCw size={16} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(resource)}
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
              title={tCommon("delete")}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Renderizado de item para lista virtualizada
  const renderResourceItem = (resource: Resource) => (
    <div className="group bg-[var(--color-bg-surface)] rounded-xl p-5 border border-[var(--color-border-subtle)] hover:border-brand-primary-500/50 hover:shadow-lg transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              {resource.name}
            </h3>
            <Badge
              variant="secondary"
              className="text-[10px] uppercase tracking-wider font-bold bg-brand-primary-50 text-brand-primary-700 border-brand-primary-100"
            >
              {RESOURCE_TYPE_LABELS[resource.type] || resource.type}
            </Badge>
            <StatusBadge type="resource" status={resource.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
              <div className="p-1.5 rounded-md bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]">
                <Hash size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-tight text-[var(--color-text-tertiary)]">
                  {t("code")}
                </span>
                <span className="font-mono text-xs font-medium">
                  {resource.code}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
              <div className="p-1.5 rounded-md bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]">
                <Users size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-tight text-[var(--color-text-tertiary)]">
                  {t("capacity")}
                </span>
                <span className="font-medium text-xs">
                  {resource.capacity} {t("people")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
              <div className="p-1.5 rounded-md bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]">
                <MapPin size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-tight text-[var(--color-text-tertiary)]">
                  {t("location")}
                </span>
                <span className="font-medium text-xs">{resource.location}</span>
              </div>
            </div>
          </div>

          {resource.description && (
            <div className="pt-2 border-t border-[var(--color-border-subtle)]/50">
              <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 italic opacity-80">
                {resource.description}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-center bg-[var(--color-bg-muted)]/50 p-1.5 rounded-xl border border-[var(--color-border-subtle)]/50 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 md:translate-y-0 group-hover:translate-y-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(resource)}
            className="h-9 w-9 p-0 rounded-lg hover:bg-white hover:shadow-sm text-[var(--color-text-secondary)]"
            title={t("view")}
          >
            <Eye size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(resource)}
            className="h-9 w-9 p-0 rounded-lg hover:bg-white hover:shadow-sm text-[var(--color-text-secondary)]"
            title={tCommon("edit")}
          >
            <Edit2 size={18} />
          </Button>

          {resource.status === "UNAVAILABLE" && onRestore ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => onRestore(resource)}
              className="h-9 px-3 rounded-lg text-xs font-bold bg-green-600 hover:bg-green-700 text-white border-none shadow-sm flex items-center gap-2"
            >
              <RefreshCw size={14} />
              {t("restore")}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(resource)}
              className="h-9 w-9 p-0 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
              title={tCommon("delete")}
            >
              <Trash2 size={18} />
            </Button>
          )}
        </div>
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
