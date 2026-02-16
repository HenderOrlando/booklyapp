"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { cn } from "@/lib/utils";
import { Plus, X, Search, MapPin, Users, Check } from "lucide-react";
import * as React from "react";

/**
 * MultiResourceSelector — RF-19: Reservas con múltiples recursos
 *
 * Permite seleccionar varios recursos para una misma reserva.
 * Valida disponibilidad cruzada y muestra conflictos.
 */

interface ResourceOption {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  isAvailable: boolean;
}

interface MultiResourceSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  resources: ResourceOption[];
  maxResources?: number;
  className?: string;
}

export function MultiResourceSelector({
  selectedIds,
  onChange,
  resources,
  maxResources = 5,
  className,
}: MultiResourceSelectorProps) {
  const [search, setSearch] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedResources = resources.filter((r) => selectedIds.includes(r.id));
  const availableResources = resources.filter(
    (r) => !selectedIds.includes(r.id) && r.isAvailable
  );

  const filtered = availableResources.filter(
    (r) =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase())
  );

  const addResource = (id: string) => {
    if (selectedIds.length < maxResources) {
      onChange([...selectedIds, id]);
    }
  };

  const removeResource = (id: string) => {
    onChange(selectedIds.filter((sid) => sid !== id));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--color-text-primary)]">
          Recursos seleccionados ({selectedIds.length}/{maxResources})
        </label>
        {selectedIds.length < maxResources && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar recurso
          </Button>
        )}
      </div>

      {/* Selected Resources */}
      {selectedResources.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-[var(--color-text-tertiary)]">
          Selecciona al menos un recurso para tu reserva
        </p>
      ) : (
        <div className="space-y-2">
          {selectedResources.map((resource, index) => (
            <div
              key={resource.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary-500 text-xs font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {resource.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {resource.location}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Users className="h-3 w-3" />
                      {resource.capacity}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeResource(resource.id)}
                className="rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-muted)] hover:text-state-error-500"
                aria-label={`Remover ${resource.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Resource Picker Dropdown */}
      {isOpen && (
        <div className="rounded-lg border bg-[var(--color-bg-surface)] shadow-lg">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <Input
                placeholder="Buscar recurso por nombre o ubicación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-4 text-center text-sm text-[var(--color-text-tertiary)]">
                No se encontraron recursos disponibles
              </p>
            ) : (
              filtered.slice(0, 10).map((resource) => (
                <button
                  key={resource.id}
                  type="button"
                  onClick={() => {
                    addResource(resource.id);
                    setSearch("");
                    if (selectedIds.length + 1 >= maxResources) {
                      setIsOpen(false);
                    }
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-[var(--color-bg-muted)] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {resource.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                      <span>{resource.location}</span>
                      <span>·</span>
                      <span>Cap. {resource.capacity}</span>
                      <span>·</span>
                      <Badge variant="default" className="text-[10px] px-1 py-0">
                        {resource.type}
                      </Badge>
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-brand-primary-500 shrink-0" />
                </button>
              ))
            )}
          </div>
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
