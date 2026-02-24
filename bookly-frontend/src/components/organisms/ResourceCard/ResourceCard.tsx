import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { ColorSwatch } from "@/components/atoms/ColorSwatch";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import type { Resource } from "@/types/entities/resource";
import React from "react";

/**
 * ResourceCard - Organism Component
 *
 * Tarjeta completa para mostrar información de un recurso en grids/listas.
 * Incluye imagen, título, estado, categoría y acciones rápidas.
 *
 * Design System:
 * - Usa Card base component
 * - StatusBadge para estados
 * - ColorSwatch para categoría
 * - Botones para acciones
 * - Grid de 8px en spacing
 * - Responsive y accesible
 *
 * @example
 * ```tsx
 * <ResourceCard
 *   resource={recurso}
 *   onView={(id) => router.push(`/recursos/${id}`)}
 *   onEdit={(id) => handleEdit(id)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 * ```
 */

export interface ResourceCardProps {
  /** Recurso a mostrar */
  resource: Resource;
  /** Callback al hacer click en ver */
  onView?: (id: string) => void;
  /** Callback al hacer click en editar */
  onEdit?: (id: string) => void;
  /** Callback al hacer click en eliminar */
  onDelete?: (id: string) => void;
  /** Callback al hacer click en reservar */
  onReserve?: (id: string) => void;
  /** Mostrar acciones */
  showActions?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export const ResourceCard = React.memo(function ResourceCard({
  resource,
  onView,
  onEdit,
  onDelete,
  onReserve,
  showActions = true,
  className = "",
}: ResourceCardProps) {
  return (
    <Card
      className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}
      onClick={() => onView?.(resource.id)}
    >
      {/* Imagen del recurso - Opcional */}
      {(resource as any).imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={(resource as any).imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{resource.name}</CardTitle>
            {resource.code && (
              <CardDescription className="text-xs">
                {resource.code}
              </CardDescription>
            )}
          </div>
          <StatusBadge type="resource" status={resource.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descripción */}
        {resource.description && (
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
            {resource.description}
          </p>
        )}

        {/* Detalles clave */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Tipo */}
          {resource.type && (
            <div>
              <span className="text-[var(--color-text-secondary)]">Tipo:</span>
              <p className="font-medium text-[var(--color-text-primary)]">
                {resource.type}
              </p>
            </div>
          )}

          {/* Capacidad */}
          {resource.capacity && (
            <div>
              <span className="text-[var(--color-text-secondary)]">
                Capacidad:
              </span>
              <p className="font-medium text-[var(--color-text-primary)]">
                {resource.capacity} personas
              </p>
            </div>
          )}

          {/* Categoría con color */}
          {resource.category && (
            <div className="col-span-2">
              <span className="text-[var(--color-text-secondary)]">
                Categoría:
              </span>
              <div className="flex items-center gap-2 mt-1">
                <ColorSwatch color={resource.category.color} size="sm" />
                <p className="font-medium text-[var(--color-text-primary)]">
                  {resource.category.name}
                </p>
              </div>
            </div>
          )}

          {/* Ubicación */}
          {resource.location && (
            <div className="col-span-2">
              <span className="text-[var(--color-text-secondary)]">
                Ubicación:
              </span>
              <p className="font-medium text-[var(--color-text-primary)]">
                {resource.location}
              </p>
            </div>
          )}
        </div>

        {/* Acciones */}
        {showActions && (
          <div
            className="flex gap-2 pt-2 border-t border-[var(--color-border-subtle)]"
            onClick={(e) => e.stopPropagation()}
          >
            {onReserve && resource.status === "AVAILABLE" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onReserve(resource.id)}
                className="flex-1"
              >
                Reservar
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(resource.id)}
              >
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(resource.id)}
              >
                Eliminar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
