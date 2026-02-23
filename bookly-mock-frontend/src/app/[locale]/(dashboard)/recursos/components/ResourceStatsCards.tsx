/**
 * ResourceStatsCards - Tarjetas de estadísticas de recursos
 *
 * Muestra métricas clave del sistema de recursos
 */

import { Card, CardContent } from "@/components/atoms/Card";
import type { Resource } from "@/types/entities/resource";
import { ResourceStatus } from "@/types/entities/resource";
import { Building2, CheckCircle2, Users, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

interface ResourceStatsCardsProps {
  resources: Resource[];
}

export function ResourceStatsCards({ resources }: ResourceStatsCardsProps) {
  const t = useTranslations("resources.stats");
  const tResource = useTranslations("resources");

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    const totalResources = resources.length;
    const availableResources = resources.filter(
      (r) => r.status === ResourceStatus.AVAILABLE,
    ).length;
    const inMaintenanceResources = resources.filter(
      (r) => r.status === ResourceStatus.MAINTENANCE,
    ).length;
    const reservedResources = resources.filter(
      (r) => r.status === ResourceStatus.RESERVED,
    ).length;

    // Capacidad total
    const totalCapacity = resources.reduce(
      (sum, r) => sum + (r.capacity || 0),
      0,
    );

    // Tipos de recursos
    const resourceTypes = new Set(resources.map((r) => r.type));

    const typeLabels: Record<string, string> = {
      CLASSROOM: tResource("type_labels.CLASSROOM"),
      LABORATORY: tResource("type_labels.LABORATORY"),
      AUDITORIUM: tResource("type_labels.AUDITORIUM"),
      MULTIMEDIA_EQUIPMENT: tResource("type_labels.MULTIMEDIA_EQUIPMENT"),
      SPORTS_FACILITY: tResource("type_labels.SPORTS_FACILITY"),
      MEETING_ROOM: tResource("type_labels.MEETING_ROOM"),
    };

    const typeCountText = Array.from(resourceTypes)
      .map((type) => typeLabels[type] || type)
      .join(", ");

    return {
      total: totalResources,
      available: availableResources,
      inMaintenance: inMaintenanceResources,
      reserved: reservedResources,
      totalCapacity,
      uniqueTypes: resourceTypes.size,
      typeCountText,
    };
  }, [resources, t]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total recursos */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-brand-primary-500/5 to-brand-primary-600/5 border-brand-primary-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary-600/80 mb-1">
                {t("total_resources") || "Total Recursos"}
              </p>
              <h3 className="text-3xl font-black text-brand-primary-800 dark:text-brand-primary-200 leading-none">
                {stats.total}
              </h3>
              <p
                className="text-[11px] font-medium text-brand-primary-600/70 mt-2 flex items-center gap-1"
                title={stats.typeCountText}
              >
                <span className="w-1 h-1 rounded-full bg-brand-primary-400" />
                {stats.uniqueTypes} {t("types") || "tipos"}
              </p>
            </div>
            <div className="w-12 h-12 bg-brand-primary-500/10 text-brand-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Building2 size={24} strokeWidth={2.5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disponibles */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-success-500/5 to-state-success-700/5 border-state-success-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-state-success-700/80 dark:text-state-success-200/80 mb-1">
                {t("available") || "Disponibles"}
              </p>
              <h3 className="text-3xl font-black text-state-success-900 dark:text-state-success-200 leading-none">
                {stats.available}
              </h3>
              <p className="text-[11px] font-medium text-state-success-700/70 dark:text-state-success-200/70 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-state-success-500" />
                {stats.total > 0
                  ? ((stats.available / stats.total) * 100).toFixed(0)
                  : 0}
                % {t("of_total") || "del total"}
              </p>
            </div>
            <div className="w-12 h-12 bg-state-success-500/10 text-state-success-700 dark:text-state-success-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* En mantenimiento */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-warning-500/5 to-state-warning-700/5 border-state-warning-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-state-warning-700/80 dark:text-state-warning-200/80 mb-1">
                {t("in_maintenance") || "En Mantenimiento"}
              </p>
              <h3 className="text-3xl font-black text-state-warning-900 dark:text-state-warning-200 leading-none">
                {stats.inMaintenance}
              </h3>
              <p className="text-[11px] font-medium text-state-warning-700/70 dark:text-state-warning-200/70 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-state-warning-500" />
                {stats.total > 0
                  ? ((stats.inMaintenance / stats.total) * 100).toFixed(0)
                  : 0}
                % {t("of_total") || "del total"}
              </p>
            </div>
            <div className="w-12 h-12 bg-state-warning-500/10 text-state-warning-700 dark:text-state-warning-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Wrench size={24} strokeWidth={2.5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacidad total */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-brand-secondary-500/5 to-brand-secondary-600/5 border-brand-secondary-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary-600/80 mb-1">
                {t("total_capacity") || "Capacidad Total"}
              </p>
              <h3 className="text-3xl font-black text-brand-secondary-800 dark:text-brand-secondary-200 leading-none">
                {stats.totalCapacity}
              </h3>
              <p className="text-[11px] font-medium text-brand-secondary-600/70 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-brand-secondary-400" />
                {t("people") || "personas"} · {stats.reserved}{" "}
                {t("reserved") || "reservados"}
              </p>
            </div>
            <div className="w-12 h-12 bg-brand-secondary-500/10 text-brand-secondary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Users size={24} strokeWidth={2.5} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
