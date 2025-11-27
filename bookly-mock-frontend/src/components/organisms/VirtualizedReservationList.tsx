/**
 * VirtualizedReservationList - Lista virtualizada de reservas
 *
 * Optimizada para historial largo de reservas
 */

"use client";

import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { useInfiniteReservationsList } from "@/hooks/useInfiniteReservations";
import type { Reservation } from "@/types/entities/reservation";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

interface VirtualizedReservationListProps {
  filters?: any;
  renderItem: (reservation: Reservation, index: number) => React.ReactNode;
  onReservationClick?: (reservation: Reservation) => void;
  itemHeight?: number;
  overscan?: number;
  className?: string;
}

/**
 * Lista virtualizada de reservas con infinite scrolling
 *
 * Ideal para historial largo de reservas (100+ items)
 *
 * @example
 * ```typescript
 * <VirtualizedReservationList
 *   filters={{ status: 'CONFIRMED' }}
 *   renderItem={(reservation) => (
 *     <ReservationCard reservation={reservation} />
 *   )}
 *   itemHeight={100}
 * />
 * ```
 */
export function VirtualizedReservationList({
  filters,
  renderItem,
  onReservationClick,
  itemHeight = 100,
  overscan = 5,
  className = "",
}: VirtualizedReservationListProps) {
  const {
    reservations,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    totalCount,
  } = useInfiniteReservationsList(filters);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: reservations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  // Auto-load más items cuando llega al final
  React.useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) return;

    if (
      lastItem.index >= reservations.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    reservations.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando reservas..." />
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No se encontraron reservas</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          Mostrando {reservations.length} de {totalCount} reservas
        </span>
        {isFetchingNextPage && (
          <span className="text-sm text-blue-400 animate-pulse">
            Cargando más...
          </span>
        )}
      </div>

      {/* Contenedor virtualizado */}
      <div
        ref={parentRef}
        className="h-[700px] overflow-auto border border-gray-700 rounded-lg bg-gray-900/50"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const reservation = reservations[virtualItem.index];
            if (!reservation) return null;

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
                onClick={() => onReservationClick?.(reservation)}
                className="cursor-pointer px-2"
              >
                {renderItem(reservation, virtualItem.index)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {!hasNextPage && reservations.length > 0 && (
        <div className="text-center text-gray-500 text-sm py-4">
          Todas las reservas cargadas
        </div>
      )}
    </div>
  );
}
