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
  Category,
  ResourceStatus,
  ResourceType,
} from "@/types/entities/resource";
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Búsqueda Avanzada</CardTitle>
              <CardDescription>
                Filtra recursos con múltiples criterios
              </CardDescription>
            </div>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} filtro(s) activo(s)
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Búsqueda por texto */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Búsqueda de Texto
            </label>
            <Input
              placeholder="Buscar por nombre, código, ubicación..."
              value={filters.text || ""}
              onChange={(e) => setFilters({ ...filters, text: e.target.value })}
            />
          </div>

          {/* Tipos de Recurso */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Tipos de Recurso
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.values(ResourceType).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeToggle(type)}
                  className={`p-3 rounded-lg border text-sm transition-all ${
                    filters.types?.includes(type)
                      ? "border-brand-primary-500 bg-brand-primary-500/10 text-foreground"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-bg-inverse)]/50 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-inverse)]"
                  }`}
                >
                  {type === ResourceType.CLASSROOM && "Aula"}
                  {type === ResourceType.LABORATORY && "Laboratorio"}
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
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Estados
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.values(ResourceStatus).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusToggle(status)}
                  className={`p-3 rounded-lg border text-sm transition-all ${
                    filters.statuses?.includes(status)
                      ? "border-brand-primary-500 bg-brand-primary-500/10 text-foreground"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-bg-inverse)]/50 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-inverse)]"
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

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Categoría
            </label>
            <Select
              value={filters.categoryId}
              onValueChange={(value) =>
                setFilters({ ...filters, categoryId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.categoryId && (
              <button
                type="button"
                onClick={() =>
                  setFilters({ ...filters, categoryId: undefined })
                }
                className="text-xs text-brand-primary-500 hover:underline mt-1"
              >
                Limpiar categoría
              </button>
            )}
          </div>

          {/* Rango de Capacidad */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rango de Capacidad
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="number"
                  placeholder="Mínimo"
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
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Máximo"
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
                />
              </div>
            </div>
          </div>

          {/* Características */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Características Requeridas
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { key: "hasProjector", label: "Proyector", icon: "📽️" },
                {
                  key: "hasAirConditioning",
                  label: "Aire Acondicionado",
                  icon: "❄️",
                },
                { key: "hasWhiteboard", label: "Tablero/Pizarra", icon: "📝" },
                { key: "hasComputers", label: "Computadores", icon: "💻" },
              ].map((attr) => (
                <label
                  key={attr.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    filters[attr.key as keyof AdvancedSearchFilters]
                      ? "border-brand-primary-500 bg-brand-primary-500/10"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-bg-inverse)]/50 hover:bg-[var(--color-bg-inverse)]"
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
                    className="rounded w-4 h-4"
                  />
                  <span className="text-xl">{attr.icon}</span>
                  <span className="text-sm text-foreground flex-1">
                    {attr.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={getActiveFiltersCount() === 0}
            >
              Limpiar Filtros
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSearch}>
              Buscar ({getActiveFiltersCount()})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
