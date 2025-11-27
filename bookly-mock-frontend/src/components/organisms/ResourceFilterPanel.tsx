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
import { Input } from "@/components/atoms/Input";
import { useInfiniteResources } from "@/hooks/useInfiniteResources";
import { ResourceStatus, type Resource } from "@/types/entities/resource";
import { Search, X } from "lucide-react";
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
    [data]
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
          r.location?.toLowerCase().includes(searchQuery.toLowerCase())
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
      selectedResourceIds.includes(r.id)
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
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Card
      className={`flex flex-col ${className}`}
      style={{ maxHeight: "calc(100vh - 12rem)" }}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recursos</CardTitle>
          <Badge variant="secondary">
            {selectedResourceIds.length} seleccionados
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col gap-4 min-h-0">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar recursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtro por tipo */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterByType("all")}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filterByType === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Todos
          </button>
          {resourceTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterByType(type)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filterByType === type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Acciones rápidas */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={allSelected ? onClearAll : onSelectAll}
            className="flex-1"
          >
            {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
          </Button>
        </div>

        {/* Lista de recursos con checkboxes - Infinite Scroll */}
        <div className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">
              Cargando recursos...
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No se encontraron recursos
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
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                    }`}
                  >
                    <label className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onResourceToggle(resource.id)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900 cursor-pointer"
                      />

                      <div className="flex-1 min-w-0 ">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-white truncate">
                            {resource.name}
                          </span>
                        </div>

                        <div className="flex justify-between gap-2 mt-1 text-xs text-gray-400">
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
                              ? "Disponible"
                              : resource.status === ResourceStatus.RESERVED
                                ? "Reservado"
                                : resource.status === ResourceStatus.MAINTENANCE
                                  ? "Mantenimiento"
                                  : "No disponible"}
                          </Badge>
                          <span>{resource.type}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1 text-xs text-gray-400">
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
                          <div className="mt-1 text-xs text-gray-400">
                            Capacidad: {resource.capacity} personas
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                );
              })}

              {/* Trigger para cargar más */}
              {hasNextPage && (
                <div
                  ref={loadMoreRef}
                  className="py-4 text-center text-sm text-gray-400"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>Cargando más...</span>
                    </div>
                  ) : (
                    "Scroll para cargar más"
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Contador de resultados */}
        {!isLoading && filteredResources.length > 0 && (
          <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-700">
            Mostrando {filteredResources.length} de {resources.length} recursos
          </div>
        )}
      </CardContent>
    </Card>
  );
}
