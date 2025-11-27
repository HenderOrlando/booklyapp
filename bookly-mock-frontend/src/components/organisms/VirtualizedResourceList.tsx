/**
 * VirtualizedResourceList - Lista virtualizada con @tanstack/react-virtual
 *
 * Renderiza solo los items visibles para máxima performance
 * Ideal para listas con 1000+ items
 */

"use client";

import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { useInfiniteResourcesList } from "@/hooks/useInfiniteResources";
import type { Resource } from "@/types/entities/resource";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

interface VirtualizedResourceListProps {
  filters?: any;
  renderItem: (resource: Resource, index: number) => React.ReactNode;
  onResourceClick?: (resource: Resource) => void;
  itemHeight?: number; // Altura estimada de cada item en px
  overscan?: number; // Número de items extra a renderizar fuera del viewport
  className?: string;
}

/**
 * Lista virtualizada de recursos con infinite scrolling
 *
 * Solo renderiza items visibles en viewport + overscan
 * Maneja automáticamente listas de 10,000+ items sin lag
 *
 * @example
 * ```typescript
 * <VirtualizedResourceList
 *   filters={{ status: 'AVAILABLE' }}
 *   renderItem={(resource) => <ResourceCard resource={resource} />}
 *   itemHeight={80}
 *   overscan={5}
 * />
 * ```
 */
export function VirtualizedResourceList({
  filters,
  renderItem,
  onResourceClick,
  itemHeight = 80,
  overscan = 5,
  className = "",
}: VirtualizedResourceListProps) {
  const {
    resources,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    totalCount,
  } = useInfiniteResourcesList(filters);

  // Ref para el contenedor padre
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Configurar virtualizer
  const rowVirtualizer = useVirtualizer({
    count: resources.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  // Detectar cuando usuario llega al final para cargar más
  React.useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) return;

    // Si el último item visible está cerca del final, cargar más
    if (
      lastItem.index >= resources.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    resources.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando recursos..." />
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No se encontraron recursos</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header con contador */}
      <div className="mb-4 text-sm text-gray-400">
        Mostrando {resources.length} de {totalCount} recursos
        {isFetchingNextPage && " (cargando más...)"}
      </div>

      {/* Contenedor virtualizado */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto border border-gray-700 rounded-lg"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const resource = resources[virtualItem.index];
            if (!resource) return null;

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                onClick={() => onResourceClick?.(resource)}
                className="cursor-pointer"
              >
                {renderItem(resource, virtualItem.index)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading indicator para siguiente página */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner text="Cargando más recursos..." />
        </div>
      )}

      {/* Mensaje de fin */}
      {!hasNextPage && resources.length > 0 && (
        <div className="text-center text-gray-500 text-sm py-4">
          {resources.length === totalCount
            ? "Todos los recursos cargados"
            : `Mostrando ${resources.length} de ${totalCount} recursos`}
        </div>
      )}
    </div>
  );
}
