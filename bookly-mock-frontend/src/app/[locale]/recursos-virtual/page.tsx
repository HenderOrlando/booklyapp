/**
 * Ejemplo de Virtual Scrolling - Recursos
 *
 * Demuestra el uso de VirtualizedResourceList
 * Capaz de renderizar 10,000+ items sin lag
 */

"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { VirtualizedResourceList } from "@/components/organisms/VirtualizedResourceList";
import { MainLayout } from "@/components/templates/MainLayout";
import { usePrefetchResource } from "@/hooks/usePrefetch";
import type { Resource } from "@/types/entities/resource";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import * as React from "react";

/**
 * Página de demostración de Virtual Scrolling
 *
 * Características:
 * - Renderiza solo items visibles (60fps con 10,000+ items)
 * - Infinite scrolling automático
 * - Prefetch on hover
 * - Filtros en tiempo real
 */
export default function RecursosVirtualPage() {
  const t = useTranslations("resources");
  const router = useRouter();
  const { prefetchResource } = usePrefetchResource();

  const [filters, setFilters] = React.useState({
    search: "",
    status: "",
    categoryId: "",
  });

  const _header = <AppHeader title={t("virtual_scrolling_title")} />;
  const _sidebar = <AppSidebar />;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const renderResourceItem = (resource: Resource, index: number) => (
    <Card
      className="mb-2 hover:border-brand-primary-500 transition-all"
      onMouseEnter={() => prefetchResource(resource.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-[var(--color-text-tertiary)] text-sm font-mono">
                #{index + 1}
              </span>
              <h3 className="font-semibold text-foreground">{resource.name}</h3>
              <StatusBadge type="resource" status={resource.status} />
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
              {resource.code} • {resource.location}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {resource.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {t("capacity")}: {resource.capacity}
              </Badge>
              {resource.category && (
                <Badge variant="primary" className="text-xs">
                  {resource.category.name}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/recursos/${resource.id}`)}
            >
              {t("view")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Información y controles */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {t("virtual_demo_title")}
                </h2>
                <p className="text-[var(--color-text-tertiary)] text-sm">
                  {t.rich("virtual_demo_desc", {
                    code_tag: (chunks) => (
                      <code className="text-brand-primary-400">{chunks}</code>
                    ),
                  })}
                </p>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    {t("search_label")}
                  </label>
                  <Input
                    placeholder={t("search_virtual_placeholder")}
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    {t("status_label")}
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border-strong)] rounded-md text-foreground"
                  >
                    <option value="">{t("filters.statuses")}</option>
                    <option value="AVAILABLE">{t("available")}</option>
                    <option value="IN_USE">{t("occupied")}</option>
                    <option value="MAINTENANCE">{t("maintenance")}</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFilters({ search: "", status: "", categoryId: "" })
                    }
                    className="w-full"
                  >
                    {t("clear_filters")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista virtualizada */}
        <VirtualizedResourceList
          filters={filters}
          renderItem={renderResourceItem}
          onResourceClick={(resource) =>
            router.push(`/recursos/${resource.id}`)
          }
          itemHeight={120}
          overscan={5}
        />

        {/* Info técnica */}
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-[var(--color-text-tertiary)] space-y-1">
              <p>
                {t.rich("performance_info", {
                  strong_tag: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
              <p>
                {t.rich("infinite_scroll_info", {
                  strong_tag: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
              <p>
                {t.rich("prefetch_info", {
                  strong_tag: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
              <p>
                {t.rich("capacity_info", {
                  strong_tag: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
