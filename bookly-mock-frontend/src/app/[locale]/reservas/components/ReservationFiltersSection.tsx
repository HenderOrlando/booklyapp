/**
 * ReservationFiltersSection - Sección de filtros para reservas
 *
 * Incluye búsqueda, filtro por estado y chips de filtros activos
 */

import { Button } from "@/components/atoms/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import {
  FilterChips,
  type FilterChip,
} from "@/components/molecules/FilterChips";
import { SearchBar } from "@/components/molecules/SearchBar";
import type { ReservationStatus } from "@/types/entities/reservation";
import { useTranslations } from "next-intl";

interface ReservationFiltersSectionProps {
  filter: string;
  statusFilter: ReservationStatus | "all";
  onFilterChange: (value: string) => void;
  onStatusFilterChange: (status: ReservationStatus | "all") => void;
  onClearFilters: () => void;
}

export function ReservationFiltersSection({
  filter,
  statusFilter,
  onFilterChange,
  onStatusFilterChange,
  onClearFilters,
}: ReservationFiltersSectionProps) {
  const t = useTranslations("reservations");

  // Verificar si hay filtros activos
  const hasActiveFilters = filter || statusFilter !== "all";

  // Convertir filtros a chips
  const getFilterChips = (): FilterChip[] => {
    const chips: FilterChip[] = [];

    if (filter) {
      chips.push({
        key: "search",
        label: t("filters.search") || "Búsqueda",
        value: filter,
      });
    }

    if (statusFilter !== "all") {
      const statusLabels: Record<ReservationStatus, string> = {
        PENDING: t("status.pending") || "Pendiente",
        CONFIRMED: t("status.confirmed") || "Confirmada",
        IN_PROGRESS: t("status.in_progress") || "En Progreso",
        COMPLETED: t("status.completed") || "Completada",
        CANCELLED: t("status.cancelled") || "Cancelada",
        REJECTED: t("status.rejected") || "Rechazada",
      };

      chips.push({
        key: "status",
        label: t("filters.status") || "Estado",
        value: statusLabels[statusFilter],
      });
    }

    return chips;
  };

  // Remover chip individual
  const handleRemoveChip = (key: string) => {
    if (key === "search") {
      onFilterChange("");
    } else if (key === "status") {
      onStatusFilterChange("all");
    }
  };

  // Opciones de estado
  const statusOptions: { value: ReservationStatus | "all"; label: string }[] = [
    { value: "all", label: t("status.all") || "Todos" },
    { value: "PENDING", label: t("status.pending") || "Pendiente" },
    { value: "CONFIRMED", label: t("status.confirmed") || "Confirmada" },
    { value: "IN_PROGRESS", label: t("status.in_progress") || "En Progreso" },
    { value: "COMPLETED", label: t("status.completed") || "Completada" },
    { value: "CANCELLED", label: t("status.cancelled") || "Cancelada" },
  ];

  return (
    <div className="space-y-3">
      {/* Barra de búsqueda y filtro de estado */}
      <div className="flex items-center gap-3">
        <SearchBar
          placeholder={t("search_placeholder") || "Buscar reserva..."}
          value={filter}
          onChange={onFilterChange}
          onClear={() => onFilterChange("")}
          className="flex-1"
        />

        {/* Filtro de estado */}
        <div className="min-w-[180px]">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              onStatusFilterChange(value as ReservationStatus | "all")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("filters.status") || "Estado"} />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            {t("clear_filters") || "Limpiar filtros"}
          </Button>
        )}
      </div>

      {/* Chips de filtros activos */}
      {hasActiveFilters && (
        <FilterChips
          filters={getFilterChips()}
          onRemove={handleRemoveChip}
          onClearAll={onClearFilters}
        />
      )}
    </div>
  );
}
