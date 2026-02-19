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
      CLASSROOM: t("type_labels.CLASSROOM"),
      LABORATORY: t("type_labels.LABORATORY"),
      AUDITORIUM: t("type_labels.AUDITORIUM"),
      MULTIMEDIA_EQUIPMENT: t("type_labels.MULTIMEDIA_EQUIPMENT"),
      SPORTS_FACILITY: t("type_labels.SPORTS_FACILITY"),
      MEETING_ROOM: t("type_labels.MEETING_ROOM"),
      VEHICLE: t("type_labels.VEHICLE"),
      OTHER: t("type_labels.OTHER"),
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
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-blue-500/5 to-blue-600/5 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600/80 mb-1">
                {t("total_resources") || "Total Recursos"}
              </p>
              <h3 className="text-3xl font-black text-blue-900 leading-none">
                {stats.total}
              </h3>
              <p
                className="text-[11px] font-medium text-blue-600/70 mt-2 flex items-center gap-1"
                title={stats.typeCountText}
              >
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                {stats.uniqueTypes} {t("types") || "tipos"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Building2 size={24} strokeWidth={2.5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disponibles */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-green-500/5 to-green-600/5 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-600/80 mb-1">
                {t("available") || "Disponibles"}
              </p>
              <h3 className="text-3xl font-black text-green-900 leading-none">
                {stats.available}
              </h3>
              <p className="text-[11px] font-medium text-green-600/70 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-green-400" />
                {stats.total > 0
                  ? ((stats.available / stats.total) * 100).toFixed(0)
                  : 0}
                % {t("of_total") || "del total"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* En mantenimiento */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-orange-500/5 to-orange-600/5 border-orange-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600/80 mb-1">
                {t("in_maintenance") || "En Mantenimiento"}
              </p>
              <h3 className="text-3xl font-black text-orange-900 leading-none">
                {stats.inMaintenance}
              </h3>
              <p className="text-[11px] font-medium text-orange-600/70 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-orange-400" />
                {stats.total > 0
                  ? ((stats.inMaintenance / stats.total) * 100).toFixed(0)
                  : 0}
                % {t("of_total") || "del total"}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500/10 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Wrench size={24} strokeWidth={2.5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacidad total */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-purple-500/5 to-purple-600/5 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600/80 mb-1">
                {t("total_capacity") || "Capacidad Total"}
              </p>
              <h3 className="text-3xl font-black text-purple-900 leading-none">
                {stats.totalCapacity}
              </h3>
              <p className="text-[11px] font-medium text-purple-600/70 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-purple-400" />
                {t("people") || "personas"} · {stats.reserved}{" "}
                {t("reserved") || "reservados"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Users size={24} strokeWidth={2.5} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
