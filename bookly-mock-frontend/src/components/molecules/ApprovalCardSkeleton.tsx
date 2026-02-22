import { Skeleton } from "@/components/atoms/Skeleton/Skeleton";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import * as React from "react";

/**
 * ApprovalCardSkeleton - Molecule Component
 * 
 * Estado de carga (Skeleton) para la tarjeta de aprobación.
 * Mantiene las dimensiones y estructura de ApprovalCard para evitar saltos de layout.
 */
export const ApprovalCardSkeleton: React.FC = () => {
  return (
    <Card className="h-full border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" /> {/* Status Badge */}
              <Skeleton className="h-5 w-16" /> {/* Level Badge */}
            </div>
            <Skeleton className="h-6 w-3/4" /> {/* Title/Resource Name */}
            <Skeleton className="h-4 w-1/2" /> {/* Description/Category */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Solicitante */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Fecha y Hora Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>

        {/* Propósito */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2 border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};

ApprovalCardSkeleton.displayName = "ApprovalCardSkeleton";
