import { ApprovalActionButton } from "@/components/atoms/ApprovalActionButton";
import { ApprovalStatusBadge } from "@/components/atoms/ApprovalStatusBadge";
import { Badge } from "@/components/atoms/Badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/Tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import type { ApprovalRequest } from "@/types/entities/approval";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  MapPin,
  User,
  Users,
} from "lucide-react";
import * as React from "react";

/**
 * ApprovalCard - Molecule Component
 *
 * Tarjeta que muestra información resumida de una solicitud de aprobación
 * con opciones para ver detalle, aprobar o rechazar.
 *
 * @example
 * ```tsx
 * <ApprovalCard
 *   request={approvalRequest}
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 *   onViewDetails={handleViewDetails}
 * />
 * ```
 */

export interface ApprovalCardProps {
  /** Solicitud de aprobación */
  request: ApprovalRequest;
  /** Handler para aprobar */
  onApprove?: (id: string) => void;
  /** Handler para rechazar */
  onReject?: (id: string) => void;
  /** Handler para ver detalles */
  onViewDetails?: (id: string) => void;
  /** Mostrar acciones de aprobación */
  showActions?: boolean;
  /** Estado de carga de acciones */
  loading?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export const ApprovalCard = React.memo<ApprovalCardProps>(
  ({
    request,
    onApprove,
    onReject,
    onViewDetails,
    showActions = true,
    loading = false,
    className = "",
  }) => {
    const startDate = request.startDate ? new Date(request.startDate) : null;
    const endDate = request.endDate ? new Date(request.endDate) : null;
    const isValidStartDate = startDate && !isNaN(startDate.getTime());
    const isValidEndDate = endDate && !isNaN(endDate.getTime());

    // Calcular si está cerca de expirar
    const isNearExpiry = React.useMemo(() => {
      if (!request.expiresAt) return false;
      const now = new Date();
      const expiry = new Date(request.expiresAt);
      if (isNaN(expiry.getTime())) return false;
      const hoursRemaining =
        (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursRemaining < 24 && hoursRemaining > 0;
    }, [request.expiresAt]);

    return (
      <Card className={`hover:shadow-lg transition-shadow ${className}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <ApprovalStatusBadge status={request.status} />
                {request.currentLevel && (
                  <Badge variant="outline" className="text-xs">
                    {request.currentLevel.replace("_", " ")}
                  </Badge>
                )}
                <TooltipProvider>
                  {request.priority === "HIGH" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="warning" className="text-xs cursor-help">
                          Alta Prioridad
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Esta solicitud requiere atención prioritaria.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {request.priority === "URGENT" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="error" className="text-xs cursor-help">
                          Urgente
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Atención inmediata: Esta solicitud es crítica.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
              <CardTitle className="text-lg">{request.resourceName}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {request.categoryName || request.resourceType}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Información del solicitante */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]" />
            <span className="font-medium">{request.userName}</span>
            {request.userRole && (
              <Badge variant="outline" className="text-xs">
                {request.userRole}
              </Badge>
            )}
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-0.5" />
              <div>
                {isValidStartDate ? (
                  <>
                    <p className="font-medium">
                      {format(startDate, "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                      {format(startDate, "EEEE", { locale: es })}
                    </p>
                  </>
                ) : (
                  <p className="font-medium text-red-500 text-xs">Fecha no disponible</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-0.5" />
              <div>
                {isValidStartDate && isValidEndDate ? (
                  <>
                    <p className="font-medium">
                      {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                      {Math.round(
                        (endDate.getTime() - startDate.getTime()) / (1000 * 60)
                      )}{" "}
                      minutos
                    </p>
                  </>
                ) : (
                  <p className="font-medium text-red-500 text-xs">Hora no disponible</p>
                )}
              </div>
            </div>
          </div>

          {/* Propósito */}
          {request.purpose && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-0.5 flex-shrink-0" />
              <p className="text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] line-clamp-2">
                {request.purpose}
              </p>
            </div>
          )}

          {/* Asistentes */}
          {request.attendees && request.attendees > 1 && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
              <Users className="h-4 w-4" />
              <span>{request.attendees} asistentes</span>
            </div>
          )}

          {/* Alerta de expiración */}
          {isNearExpiry && (
            <div className="flex items-center gap-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-2 text-sm text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Expira pronto - Requiere atención</span>
            </div>
          )}

          {/* Acciones */}
          {showActions && request.status === "PENDING" && (
            <div className="flex gap-2 pt-2 border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
              <button
                onClick={() => onViewDetails?.(request.id)}
                className="flex-1 text-sm font-medium text-[var(--color-primary-base)] hover:underline"
              >
                Ver Detalle
              </button>
              {onApprove && (
                <ApprovalActionButton
                  action="approve"
                  onClick={() => onApprove(request.id)}
                  loading={loading}
                  size="sm"
                />
              )}
              {onReject && (
                <ApprovalActionButton
                  action="reject"
                  onClick={() => onReject(request.id)}
                  loading={loading}
                  size="sm"
                />
              )}
            </div>
          )}

          {/* Estado reviewed */}
          {(request.status === "APPROVED" || request.status === "REJECTED") && (
            <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] pt-2 border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
              {request.status === "APPROVED" ? "Aprobada" : "Rechazada"} por{" "}
              <span className="font-medium">{request.reviewerName}</span>
              {request.reviewedAt && (
                <>
                  {" "}
                  el {format(new Date(request.reviewedAt), "d/MM/yyyy HH:mm")}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

ApprovalCard.displayName = "ApprovalCard";
