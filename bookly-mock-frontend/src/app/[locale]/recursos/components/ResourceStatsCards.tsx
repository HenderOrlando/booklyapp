/**
 * ResourceStatsCards - Tarjetas de estadísticas de recursos
 *
 * Muestra métricas clave del sistema de recursos
 */

import { Card, CardContent } from "@/components/atoms/Card";
import type { Resource } from "@/types/entities/resource";
import { ResourceStatus } from "@/types/entities/resource";
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
      (r) => r.status === ResourceStatus.AVAILABLE
    ).length;
    const inMaintenanceResources = resources.filter(
      (r) => r.status === ResourceStatus.MAINTENANCE
    ).length;
    const reservedResources = resources.filter(
      (r) => r.status === ResourceStatus.RESERVED
    ).length;

    // Capacidad total
    const totalCapacity = resources.reduce(
      (sum, r) => sum + (r.capacity || 0),
      0
    );

    // Tipos de recursos
    const resourceTypes = new Set(resources.map((r) => r.type));

    return {
      total: totalResources,
      available: availableResources,
      inMaintenance: inMaintenanceResources,
      reserved: reservedResources,
      totalCapacity,
      uniqueTypes: resourceTypes.size,
    };
  }, [resources]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total recursos */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                {t("total_resources") || "Total Recursos"}
              </p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {stats.total}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {stats.uniqueTypes} {t("types") || "tipos"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disponibles */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                {t("available") || "Disponibles"}
              </p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {stats.available}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total > 0
                  ? ((stats.available / stats.total) * 100).toFixed(0)
                  : 0}
                % {t("of_total") || "del total"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* En mantenimiento */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                {t("in_maintenance") || "En Mantenimiento"}
              </p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {stats.inMaintenance}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total > 0
                  ? ((stats.inMaintenance / stats.total) * 100).toFixed(0)
                  : 0}
                % {t("of_total") || "del total"}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔧</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacidad total */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                {t("total_capacity") || "Capacidad Total"}
              </p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {stats.totalCapacity}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {t("people") || "personas"} · {stats.reserved}{" "}
                {t("reserved") || "reservados"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
