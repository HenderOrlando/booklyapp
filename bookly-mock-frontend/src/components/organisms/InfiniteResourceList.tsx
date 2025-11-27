/**
 * InfiniteResourceList - Componente con Infinite Scrolling
 *
 * Implementa scroll infinito para listados de recursos
 * usando Intersection Observer API
 */

"use client";

import { Button } from "@/components/atoms/Button";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { useInfiniteResourcesList } from "@/hooks/useInfiniteResources";
import type { Resource } from "@/types/entities/resource";
import * as React from "react";

interface InfiniteResourceListProps {
  filters?: any;
  renderItem: (resource: Resource) => React.ReactNode;
  onResourceClick?: (resource: Resource) => void;
  className?: string;
}

/**
 * Lista infinita de recursos con scroll detection automático
 *
 * @example
 * ```typescript
 * <InfiniteResourceList
 *   filters={{ status: 'AVAILABLE' }}
 *   renderItem={(resource) => <ResourceCard resource={resource} />}
 *   onResourceClick={(r) => router.push(`/recursos/${r.id}`)}
 * />
 * ```
 */
export function InfiniteResourceList({
  filters,
  renderItem,
  onResourceClick,
  className = "",
}: InfiniteResourceListProps) {
  const {
    resources,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    totalCount,
  } = useInfiniteResourcesList(filters);

  // Ref para el elemento trigger de scroll infinito
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  // Intersection Observer para detectar cuando el usuario llega al final
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 } // Trigger cuando el 50% del elemento es visible
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
      {/* Header con count */}
      <div className="mb-4 text-sm text-gray-400">
        Mostrando {resources.length} de {totalCount} recursos
      </div>

      {/* Lista de recursos */}
      <div className="space-y-3">
        {resources.map((resource: Resource) => (
          <div
            key={resource.id}
            onClick={() => onResourceClick?.(resource)}
            className="cursor-pointer"
          >
            {renderItem(resource)}
          </div>
        ))}
      </div>

      {/* Trigger element para infinite scroll */}
      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center">
            <LoadingSpinner text="Cargando más recursos..." />
          </div>
        )}

        {!hasNextPage && resources.length > 0 && (
          <div className="text-center text-gray-500 text-sm">
            No hay más recursos para mostrar
          </div>
        )}
      </div>

      {/* Botón manual de "Cargar más" (fallback) */}
      {hasNextPage && !isFetchingNextPage && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            className="w-full md:w-auto"
          >
            Cargar más recursos
          </Button>
        </div>
      )}
    </div>
  );
}
