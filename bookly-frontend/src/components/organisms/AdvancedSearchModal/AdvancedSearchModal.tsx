"use client";

import { DynamicIcon } from "@/components/atoms/DynamicIcon";
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
import { useResourceTypes } from "@/hooks/useResources";
import {
  AcademicProgram,
  ResourceStatus,
  ResourceType,
  type Category,
} from "@/types/entities/resource";
import { Activity, Filter, Layers, Search, Tag, Users, X } from "lucide-react";
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
  characteristicIds?: string[];
  programIds?: string[];
  // Campos legacy para compatibilidad si es necesario
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
  characteristics: { id: string; name: string; icon?: string }[];
  programs: AcademicProgram[];
  initialFilters?: AdvancedSearchFilters;
}

export function AdvancedSearchModal({
  isOpen,
  onClose,
  onSearch,
  categories,
  characteristics: characteristicsCatalog,
  programs,
  initialFilters = {},
}: AdvancedSearchModalProps) {
  const { data: resourceTypesData } = useResourceTypes();
  const [filters, setFilters] =
    React.useState<AdvancedSearchFilters>(initialFilters);
  const [typeQuery, setTypeQuery] = React.useState("");
  const [characteristicQuery, setCharacteristicQuery] = React.useState("");
  const [programQuery, setProgramQuery] = React.useState("");
  const [categoryQuery, setCategoryQuery] = React.useState("");

  const resourceTypes = React.useMemo(() => {
    const types = (resourceTypesData || []).map((rt) => ({
      type: rt.code as ResourceType,
      label: rt.name,
      icon: rt.icon || "📦",
    }));
    return types;
  }, [resourceTypesData]);

  const filteredTypes = React.useMemo(
    () =>
      resourceTypes
        .filter((rt) =>
          rt.label.toLowerCase().includes(typeQuery.toLowerCase()),
        )
        .slice(0, 6),
    [resourceTypes, typeQuery],
  );

  const filteredCharacteristics = React.useMemo(
    () =>
      characteristicsCatalog
        .filter((char) =>
          char.name.toLowerCase().includes(characteristicQuery.toLowerCase()),
        )
        .slice(0, 6),
    [characteristicsCatalog, characteristicQuery],
  );

  const filteredPrograms = React.useMemo(
    () =>
      programs
        .filter(
          (p) =>
            p.name.toLowerCase().includes(programQuery.toLowerCase()) ||
            p.code.toLowerCase().includes(programQuery.toLowerCase()),
        )
        .slice(0, 6),
    [programs, programQuery],
  );

  const filteredCategories = React.useMemo(
    () =>
      categories
        .filter((cat) =>
          cat.name.toLowerCase().includes(categoryQuery.toLowerCase()),
        )
        .slice(0, 6),
    [categories, categoryQuery],
  );

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

  const handleCharacteristicToggle = (id: string) => {
    const currentIds = filters.characteristicIds || [];
    const newIds = currentIds.includes(id)
      ? currentIds.filter((cid) => cid !== id)
      : [...currentIds, id];
    setFilters({ ...filters, characteristicIds: newIds });
  };

  const handleProgramToggle = (id: string) => {
    const currentIds = filters.programIds || [];
    const newIds = currentIds.includes(id)
      ? currentIds.filter((pid) => pid !== id)
      : [...currentIds, id];
    setFilters({ ...filters, programIds: newIds });
  };

  const handleCategoryToggle = (id: string) => {
    setFilters({
      ...filters,
      categoryId: filters.categoryId === id ? undefined : id,
    });
  };

  const handleClear = () => {
    setFilters({});
    setTypeQuery("");
    setCharacteristicQuery("");
    setProgramQuery("");
    setCategoryQuery("");
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
    if (filters.characteristicIds?.length) count++;
    if (filters.programIds?.length) count++;
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
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-2">
                <Layers size={14} />
                Tipos de Recurso
              </label>
              <div className="relative w-48">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                />
                <Input
                  placeholder="Filtrar tipos..."
                  value={typeQuery}
                  onChange={(e) => setTypeQuery(e.target.value)}
                  className="h-7 pl-8 text-[10px] bg-[var(--color-bg-muted)]/20 border-[var(--color-border-subtle)] rounded-lg focus:ring-brand-primary-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {filteredTypes.map(({ type, label, icon }) => (
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
                    <DynamicIcon name={typeof icon === "string" ? icon : "HelpCircle"} className="w-5 h-5" />
                  </span>
                  {label}
                </button>
              ))}
              {filteredTypes.length === 0 && (
                <p className="col-span-full text-center py-4 text-xs text-[var(--color-text-tertiary)] italic">
                  No se encontraron tipos de recurso
                </p>
              )}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-2">
                  <Layers size={14} />
                  Categoría
                </label>
                <div className="relative w-32">
                  <Search
                    size={10}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                  />
                  <Input
                    placeholder="Filtrar..."
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    className="h-6 pl-6 text-[10px] bg-[var(--color-bg-muted)]/20 border border-[var(--color-border-subtle)] rounded-lg focus:ring-brand-primary-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((category, index) => (
                  <button
                    key={category.id || `category-${index}`}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all ${
                      filters.categoryId === category.id
                        ? "border-brand-primary-500 bg-brand-primary-500 text-white shadow-sm"
                        : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-brand-primary-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
                {filteredCategories.length === 0 && (
                  <p className="text-[10px] text-[var(--color-text-tertiary)] italic">
                    No hay coincidencias
                  </p>
                )}
              </div>
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
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-2">
                <Tag size={14} />
                Características Específicas
              </label>
              <div className="relative w-48">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                />
                <Input
                  placeholder="Filtrar características..."
                  value={characteristicQuery}
                  onChange={(e) => setCharacteristicQuery(e.target.value)}
                  className="h-7 pl-8 text-[10px] bg-[var(--color-bg-muted)]/20 border-[var(--color-border-subtle)] rounded-lg focus:ring-brand-primary-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredCharacteristics.map((char, index) => (
                <label
                  key={char.id || `char-${index}`}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    filters.characteristicIds?.includes(char.id)
                      ? "border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700 shadow-sm"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:border-brand-primary-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={
                      filters.characteristicIds?.includes(char.id) || false
                    }
                    onChange={() => handleCharacteristicToggle(char.id)}
                    className="rounded w-4 h-4 text-brand-primary-500 focus:ring-brand-primary-500"
                  />
                  <div className="flex items-center gap-2 truncate">
                    {char.icon ? (
                      <span className="text-lg">
                        <DynamicIcon name={char.icon} className="w-4 h-4" />
                      </span>
                    ) : (
                      <Tag size={14} className="text-brand-primary-500" />
                    )}
                    <span className="text-xs font-medium truncate">
                      {char.name}
                    </span>
                  </div>
                </label>
              ))}
              {filteredCharacteristics.length === 0 && (
                <p className="col-span-full text-center py-4 text-xs text-[var(--color-text-tertiary)] italic">
                  No se encontraron características
                </p>
              )}
            </div>
          </div>

          {/* Programas Académicos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-2">
                <Users size={14} />
                Programas Académicos
              </label>
              <div className="relative w-48">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                />
                <Input
                  placeholder="Filtrar programas..."
                  value={programQuery}
                  onChange={(e) => setProgramQuery(e.target.value)}
                  className="h-7 pl-8 text-[10px] bg-[var(--color-bg-muted)]/20 border-[var(--color-border-subtle)] rounded-lg focus:ring-brand-primary-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredPrograms.map((program, index) => (
                <label
                  key={program.id || `program-${index}`}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    filters.programIds?.includes(program.id)
                      ? "border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700 shadow-sm"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:border-brand-primary-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.programIds?.includes(program.id) || false}
                    onChange={() => handleProgramToggle(program.id)}
                    className="rounded w-4 h-4 text-brand-primary-500 focus:ring-brand-primary-500"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-brand-primary-600 uppercase">
                      {program.code}
                    </span>
                    <span className="text-xs font-medium truncate">
                      {program.name}
                    </span>
                  </div>
                </label>
              ))}
              {filteredPrograms.length === 0 && (
                <p className="col-span-full text-center py-4 text-xs text-[var(--color-text-tertiary)] italic">
                  No se encontraron programas
                </p>
              )}
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
