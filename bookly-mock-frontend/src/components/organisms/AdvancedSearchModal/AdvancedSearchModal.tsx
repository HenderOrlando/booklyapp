"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import {
  ResourceStatus,
  ResourceType,
  type Category,
} from "@/types/entities/resource";
import {
  Activity,
  Clipboard,
  Filter,
  Laptop,
  Layers,
  Monitor,
  Search,
  Snowflake,
  Users,
  X,
} from "lucide-react";
import * as React from "react";

/**
 * Modal de Búsqueda Avanzada - Bookly
 *
 * Permite búsqueda con múltiples filtros:
 * - Tipos de recurso (múltiple)
 * - Estados (múltiple)
 * - Rango de capacidad
 * - Categoría
 * - Características
 * - Texto libre
 */

export interface AdvancedSearchFilters {
  text?: string;
  types?: ResourceType[];
  statuses?: ResourceStatus[];
  categoryId?: string;
  minCapacity?: number;
  maxCapacity?: number;
  hasProjector?: boolean;
  hasAirConditioning?: boolean;
  hasWhiteboard?: boolean;
  hasComputers?: boolean;
}

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: AdvancedSearchFilters) => void;
  categories: Category[];
  initialFilters?: AdvancedSearchFilters;
}

export function AdvancedSearchModal({
  isOpen,
  onClose,
  onSearch,
  categories,
  initialFilters = {},
}: AdvancedSearchModalProps) {
  const [filters, setFilters] =
    React.useState<AdvancedSearchFilters>(initialFilters);

  // Solo actualizar cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Cerrar con tecla Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleTypeToggle = (type: ResourceType) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    setFilters({ ...filters, types: newTypes });
  };

  const handleStatusToggle = (status: ResourceStatus) => {
    const currentStatuses = filters.statuses || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    setFilters({ ...filters, statuses: newStatuses });
  };

  const handleClear = () => {
    setFilters({});
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.text) count++;
    if (filters.types?.length) count++;
    if (filters.statuses?.length) count++;
    if (filters.categoryId) count++;
    if (filters.minCapacity || filters.maxCapacity) count++;
    if (
      filters.hasProjector ||
      filters.hasAirConditioning ||
      filters.hasWhiteboard ||
      filters.hasComputers
    )
      count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Cerrar modal al hacer clic en el overlay
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-[var(--color-border-subtle)] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary-500/10 text-brand-primary-600 flex items-center justify-center">
                <Filter size={20} strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  Búsqueda Avanzada
                </CardTitle>
                <CardDescription>
                  Filtra recursos con múltiples criterios
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getActiveFiltersCount() > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-brand-primary-50 text-brand-primary-700 border-brand-primary-100 font-bold px-2 py-0.5"
                >
                  {getActiveFiltersCount()} activo(s)
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X size={18} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 py-6">
          {/* Búsqueda por texto */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-2">
              <Search size={14} />
              Búsqueda de Texto
            </label>
            <Input
              placeholder="Buscar por nombre, código, ubicación..."
              value={filters.text || ""}
              onChange={(e) => setFilters({ ...filters, text: e.target.value })}
              className="bg-[var(--color-bg-muted)]/30 border-[var(--color-border-subtle)] focus:ring-brand-primary-500"
            />
          </div>

          {/* Tipos de Recurso */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-2">
              <Layers size={14} />
              Tipos de Recurso
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.values(ResourceType).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeToggle(type)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-2 ${
                    filters.types?.includes(type)
                      ? "border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700 shadow-sm"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-brand-primary-200 hover:bg-brand-primary-50/30"
                  }`}
                >
                  <span className="text-lg">
                    {type === ResourceType.CLASSROOM && "🏫"}
                    {type === ResourceType.LABORATORY && "🧪"}
                    {type === ResourceType.AUDITORIUM && "🎭"}
                    {type === ResourceType.MULTIMEDIA_EQUIPMENT && "🎥"}
                    {type === ResourceType.SPORTS_FACILITY && "🏀"}
                    {type === ResourceType.MEETING_ROOM && "🤝"}
                    {type === ResourceType.VEHICLE && "🚗"}
                    {type === ResourceType.OTHER && "📦"}
                  </span>
                  {type === ResourceType.CLASSROOM && "Aula"}
                  {type === ResourceType.LABORATORY && "Lab"}
                  {type === ResourceType.AUDITORIUM && "Auditorio"}
                  {type === ResourceType.MULTIMEDIA_EQUIPMENT && "Equipo"}
                  {type === ResourceType.SPORTS_FACILITY && "Deporte"}
                  {type === ResourceType.MEETING_ROOM && "Reunión"}
                  {type === ResourceType.VEHICLE && "Vehículo"}
                  {type === ResourceType.OTHER && "Otro"}
                </button>
              ))}
            </div>
          </div>

          {/* Estados */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-2">
              <Activity size={14} />
              Estados
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.values(ResourceStatus).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusToggle(status)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    filters.statuses?.includes(status)
                      ? "border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700 shadow-sm"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-brand-primary-200 hover:bg-brand-primary-50/30"
                  }`}
                >
                  {status === ResourceStatus.AVAILABLE && "Disponible"}
                  {status === ResourceStatus.RESERVED && "Reservado"}
                  {status === ResourceStatus.MAINTENANCE && "Mantenimiento"}
                  {status === ResourceStatus.UNAVAILABLE && "No Disponible"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categoría */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Categoría
              </label>
              <Select
                value={filters.categoryId}
                onValueChange={(value) =>
                  setFilters({ ...filters, categoryId: value })
                }
              >
                <SelectTrigger className="bg-[var(--color-bg-muted)]/30 border-[var(--color-border-subtle)] rounded-xl">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rango de Capacidad */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-2">
                <Users size={14} />
                Rango de Capacidad
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Mín"
                  min="1"
                  value={filters.minCapacity || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minCapacity: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="bg-[var(--color-bg-muted)]/30 border-[var(--color-border-subtle)] rounded-xl"
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  min="1"
                  value={filters.maxCapacity || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      maxCapacity: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="bg-[var(--color-bg-muted)]/30 border-[var(--color-border-subtle)] rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Características Requeridas
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                {
                  key: "hasProjector",
                  label: "Proyector",
                  icon: <Monitor size={16} />,
                },
                {
                  key: "hasAirConditioning",
                  label: "Aire Acondicionado",
                  icon: <Snowflake size={16} />,
                },
                {
                  key: "hasWhiteboard",
                  label: "Tablero/Pizarra",
                  icon: <Clipboard size={16} />,
                },
                {
                  key: "hasComputers",
                  label: "Computadores",
                  icon: <Laptop size={16} />,
                },
              ].map((attr) => (
                <label
                  key={attr.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    filters[attr.key as keyof AdvancedSearchFilters]
                      ? "border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700 shadow-sm"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:border-brand-primary-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={
                      (filters[
                        attr.key as keyof AdvancedSearchFilters
                      ] as boolean) || false
                    }
                    onChange={(e) =>
                      setFilters({ ...filters, [attr.key]: e.target.checked })
                    }
                    className="rounded w-4 h-4 text-brand-primary-500 focus:ring-brand-primary-500"
                  />
                  <span className="text-brand-primary-500">{attr.icon}</span>
                  <span className="text-sm font-medium">{attr.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--color-border-subtle)]">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClear}
              disabled={getActiveFiltersCount() === 0}
              className="text-[var(--color-text-tertiary)] hover:text-red-500"
            >
              Limpiar Filtros
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSearch}
                className="rounded-xl px-8 bg-brand-primary-600 hover:bg-brand-primary-700"
              >
                Aplicar Filtros ({getActiveFiltersCount()})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
