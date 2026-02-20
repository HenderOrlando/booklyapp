/**
 * ResourceFilterPanel - Panel lateral de filtros de recursos
 *
 * Permite seleccionar recursos con checkboxes para filtrar
 * eventos en el calendario y resaltar disponibilidad
 */

"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { useInfiniteResources } from "@/hooks/useInfiniteResources";
import { ResourceStatus, type Resource } from "@/types/entities/resource";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

interface ResourceFilterPanelProps {
  selectedResourceIds: string[];
  onResourceToggle: (resourceId: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  onDragStart?: (resource: Resource) => void;
  onDragEnd?: () => void;
  className?: string;
}

export function ResourceFilterPanel({
  selectedResourceIds,
  onResourceToggle,
  onClearAll,
  onSelectAll,
  onDragStart,
  onDragEnd,
  className = "",
}: ResourceFilterPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterByType, setFilterByType] = useState<string>("all");

  // Cargar recursos con infinite scroll (5 items por página)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteResources({}, 3); // Solo 3 recursos por página

  // Aplanar páginas de recursos
  const resources = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data],
  );

  // Ref para intersection observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filtrar recursos
  const filteredResources = useMemo(() => {
    let filtered = resources;

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (r: Resource) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.location?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filtrar por tipo
    if (filterByType !== "all") {
      filtered = filtered.filter((r: Resource) => r.type === filterByType);
    }

    return filtered;
  }, [resources, searchQuery, filterByType]);

  // Obtener tipos únicos
  const resourceTypes = useMemo(() => {
    const types = new Set(resources.map((r: Resource) => r.type));
    return Array.from(types);
  }, [resources]);

  // Verificar si todos están seleccionados
  const allSelected =
    filteredResources.length > 0 &&
    filteredResources.every((r: Resource) =>
      selectedResourceIds.includes(r.id),
    );

  // Intersection Observer para infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const t = useTranslations("resources");
  const tc = useTranslations("common");

  return (
    <Card
      className={`flex flex-col ${className}`}
      style={{ maxHeight: "calc(100vh - 12rem)" }}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <Badge variant="secondary">
            {selectedResourceIds.length} {tc("selected") || "seleccionados"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col gap-4 min-h-0">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
          <Input
            type="text"
            placeholder={tc("search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtro por tipo */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--color-text-tertiary)]">
            {t("filter_by_type") || "Filtrar por tipo"}
          </label>
          <Select value={filterByType} onValueChange={setFilterByType}>
            <SelectTrigger>
              <SelectValue placeholder={tc("all") || "Todos"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tc("all") || "Todos"}</SelectItem>
              {resourceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Acciones rápidas */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={allSelected ? onClearAll : onSelectAll}
            className="flex-1"
          >
            {allSelected ? (tc("deselect_all") || "Deseleccionar todos") : (tc("select_all") || "Seleccionar todos")}
          </Button>
        </div>

        {/* Lista de recursos con checkboxes - Infinite Scroll */}
        <div className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-[var(--color-text-tertiary)]">
              {tc("loading")}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-tertiary)]">
              {t("no_resources") || "No se encontraron recursos"}
            </div>
          ) : (
            <>
              {filteredResources.map((resource: Resource) => {
                const isSelected = selectedResourceIds.includes(resource.id);

                return (
                  <div
                    key={resource.id}
                    draggable
                    onDragStart={() => onDragStart?.(resource)}
                    onDragEnd={() => onDragEnd?.()}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all ${
                      isSelected
                        ? "border-[var(--color-border-focus)] bg-[var(--color-bg-muted)]"
                        : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-surface)]"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        id={`resource-${resource.id}`}
                        checked={isSelected}
                        onCheckedChange={() => onResourceToggle(resource.id)}
                        className="mt-1"
                      />

                      <label
                        htmlFor={`resource-${resource.id}`}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground truncate">
                            {resource.name}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2 mt-1 text-xs text-[var(--color-text-tertiary)]">
                          <Badge
                            variant={
                              resource.status === ResourceStatus.AVAILABLE
                                ? "success"
                                : resource.status === ResourceStatus.RESERVED
                                  ? "warning"
                                  : resource.status ===
                                      ResourceStatus.MAINTENANCE
                                    ? "error"
                                    : "error"
                            }
                            className="text-xs shrink-0"
                          >
                            {resource.status === ResourceStatus.AVAILABLE
                              ? t("available")
                              : resource.status === ResourceStatus.RESERVED
                                ? t("occupied")
                                : resource.status === ResourceStatus.MAINTENANCE
                                  ? t("maintenance")
                                  : t("unavailable")}
                          </Badge>
                          <span>{resource.type}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1 text-xs text-[var(--color-text-tertiary)]">
                          <span className="font-mono">{resource.code}</span>
                          <span>•</span>
                          {resource.location && (
                            <>
                              <span>•</span>
                              <span>{resource.location}</span>
                            </>
                          )}
                        </div>

                        {resource.capacity && (
                          <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                            {t("capacity") || "Capacidad"}: {resource.capacity}
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                );
              })}

              {/* Trigger para cargar más */}
              {hasNextPage && (
                <div
                  ref={loadMoreRef}
                  className="py-4 text-center text-sm text-[var(--color-text-tertiary)]"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>{tc("loading")}</span>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Contador de resultados */}
        {!isLoading && filteredResources.length > 0 && (
          <div className="text-xs text-[var(--color-text-tertiary)] text-center pt-2 border-t border-[var(--color-border-strong)]">
            {tc("showing_results", { start: 1, end: filteredResources.length, total: resources.length })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
