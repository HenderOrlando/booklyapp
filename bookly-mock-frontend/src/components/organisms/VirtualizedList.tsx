/**
 * VirtualizedList - Componente genérico para Virtual Scrolling
 *
 * Reutilizable para cualquier tipo de lista (Auditoría, Roles, Categorías, etc.)
 */

"use client";

import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onItemClick?: (item: T) => void;
  itemHeight?: number;
  overscan?: number;
  containerHeight?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Lista virtualizada genérica para cualquier tipo de dato
 *
 * @example
 * ```typescript
 * // Auditoría
 * <VirtualizedList
 *   items={auditLogs}
 *   renderItem={(log) => <AuditLogRow log={log} />}
 *   itemHeight={60}
 *   containerHeight="700px"
 * />
 *
 * // Roles
 * <VirtualizedList
 *   items={roles}
 *   renderItem={(role) => <RoleCard role={role} />}
 *   itemHeight={90}
 * />
 * ```
 */
export function VirtualizedList<T extends { id: string }>({
  items,
  renderItem,
  onItemClick,
  itemHeight = 80,
  overscan = 5,
  containerHeight = "600px",
  isLoading = false,
  emptyMessage = "No hay elementos para mostrar",
  className = "",
}: VirtualizedListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header con contador */}
      <div className="mb-4 text-sm text-gray-400">
        Total: {items.length} elementos
      </div>

      {/* Contenedor virtualizado */}
      <div
        ref={parentRef}
        className="overflow-auto border border-gray-700 rounded-lg bg-gray-900/50"
        style={{ height: containerHeight }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index];
            if (!item) return null;

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
                onClick={() => onItemClick?.(item)}
                className={onItemClick ? "cursor-pointer" : ""}
              >
                {renderItem(item, virtualItem.index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
