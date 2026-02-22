import { Avatar, AvatarFallback } from "@/components/atoms/Avatar/Avatar";
import { TimelinePoint } from "@/components/atoms/TimelinePoint";
import { cn } from "@/lib/utils";
import type { ApprovalHistoryEntry, ApprovalLevel } from "@/types/entities/approval";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import * as React from "react";

/**
 * ApprovalTimeline - Molecule Component
 *
 * Línea de tiempo visual que muestra el historial de acciones de aprobación
 * con puntos de estado, timestamps y comentarios.
 *
 * @example
 * ```tsx
 * <ApprovalTimeline history={approvalHistory} />
 * <ApprovalTimeline history={history} currentStep={2} />
 * ```
 */

export interface ApprovalTimelineProps {
  /** Historial de entradas de aprobación */
  history: ApprovalHistoryEntry[];
  /** Nivel actual del flujo */
  currentLevel?: ApprovalLevel;
  /** Nivel máximo requerido */
  maxLevel?: ApprovalLevel;
  /** Mostrar timestamps */
  showTimestamps?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

const LEVEL_ORDER: Record<ApprovalLevel, number> = {
  FIRST_LEVEL: 1,
  SECOND_LEVEL: 2,
  FINAL_LEVEL: 3,
};

const LEVEL_LABELS: Record<ApprovalLevel, string> = {
  FIRST_LEVEL: "Primer Nivel",
  SECOND_LEVEL: "Segundo Nivel",
  FINAL_LEVEL: "Nivel Final",
};

const ACTION_LABELS: Record<string, string> = {
  SUBMIT: "Solicitud enviada",
  APPROVE: "Aprobada",
  REJECT: "Rechazada",
  REQUEST_CHANGES: "Cambios solicitados",
  DELEGATE: "Delegada",
  ESCALATE: "Escalada",
  CANCEL: "Cancelada",
  COMMENT: "Comentario agregado",
  GENERATE_DOCUMENT: "Documento generado",
};

export const ApprovalTimeline = React.memo<ApprovalTimelineProps>(
  ({ history, currentLevel, maxLevel, showTimestamps = true, className = "" }) => {
    // Determinar el estado de cada paso
    const getStepStatus = (
      entryLevel: ApprovalLevel,
      action?: string
    ): "completed" | "current" | "pending" | "rejected" => {
      if (action === "REJECT") return "rejected";
      
      if (currentLevel && LEVEL_ORDER[entryLevel] < LEVEL_ORDER[currentLevel]) {
        return "completed";
      }
      if (currentLevel === entryLevel) {
        return "current";
      }
      return "pending";
    };

    // Combinar historial con pasos futuros si maxLevel está presente
    const allSteps = React.useMemo(() => {
      const steps = [...history];
      
      if (maxLevel && currentLevel) {
        const currentOrder = LEVEL_ORDER[currentLevel];
        const maxOrder = LEVEL_ORDER[maxLevel];
        
        // Solo añadir pasos futuros si la solicitud no ha sido rechazada o cancelada
        const lastAction = history[history.length - 1]?.action;
        const isClosed = lastAction === "REJECT" || lastAction === "CANCEL" || lastAction === "APPROVE" && currentLevel === maxLevel;

        if (!isClosed) {
          for (const [level, order] of Object.entries(LEVEL_ORDER)) {
            if (order > currentOrder && order <= maxOrder) {
              steps.push({
                id: `future-${level}`,
                approvalRequestId: "",
                action: "PENDING" as unknown as ApprovalHistoryEntry["action"],
                performedBy: "",
                performerName: "Pendiente de asignación",
                level: level as ApprovalLevel,
                timestamp: new Date().toISOString(),
              });
            }
          }
        }
      }
      return steps;
    }, [history, currentLevel, maxLevel]);

    return (
      <div className={`space-y-0 ${className}`}>
        {allSteps.map((entry, index) => {
          const status = getStepStatus(entry.level, entry.action);
          const isLast = index === allSteps.length - 1;
          const isFuture = entry.id.startsWith("future-");

          return (
            <div key={entry.id} className="relative">
              {/* Línea conectora */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-5 top-10 w-0.5",
                    status === "completed"
                      ? "bg-[var(--color-success-base)]"
                      : status === "rejected"
                        ? "bg-[var(--color-error-base)]"
                        : "bg-[var(--color-bg-muted)] dark:bg-[var(--color-bg-elevated)]",
                    "h-[calc(100%-2.5rem)]"
                  )}
                />
              )}

              {/* Contenido del paso */}
              <div className="flex gap-4 pb-8">
                {/* Punto de timeline */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <TimelinePoint status={status} pulse={status === "current"} />
                </div>

                {/* Información del paso */}
                <div className="flex-1 pt-1">
                  {/* Performer y avatar */}
                  <div className="flex items-center gap-2 mb-2">
                    {!isFuture ? (
                      <>
                        <Avatar size="sm">
                          <AvatarFallback>
                            {entry.performerName.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                              {entry.performerName}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] text-[var(--color-text-secondary)]">
                              {LEVEL_LABELS[entry.level]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                            <span>{ACTION_LABELS[entry.action] || entry.action}</span>
                            {showTimestamps && (
                              <>
                                <span>•</span>
                                <time 
                                  dateTime={entry.timestamp} 
                                  title={format(new Date(entry.timestamp), "PPpp", { locale: es })}
                                >
                                  {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: es })}
                                </time>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 opacity-50">
                        <div className="h-8 w-8 rounded-full border-2 border-dashed border-[var(--color-border-subtle)] flex items-center justify-center">
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">?</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[var(--color-text-tertiary)]">
                            Pendiente: {LEVEL_LABELS[entry.level]}
                          </span>
                          <span className="text-xs text-[var(--color-text-tertiary)] italic">
                            Esperando asignación...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comentarios */}
                  {entry.comments && (
                    <div className="mt-2 p-3 rounded-md bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)]/50 border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
                      <p className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)]">
                        {entry.comments}
                      </p>
                    </div>
                  )}

                  {/* Razón de rechazo */}
                  {entry.reason && entry.action === "REJECT" && (
                    <div className="mt-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                        Motivo del rechazo:
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {entry.reason}
                      </p>
                    </div>
                  )}

                  {/* Metadata adicional */}
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] cursor-pointer hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-tertiary)]">
                        Ver detalles técnicos
                      </summary>
                      <pre className="mt-2 text-xs bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] p-2 rounded overflow-x-auto">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Estado final si no hay historial */}
        {history.length === 0 && (
          <div className="text-center py-8 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
            <p className="text-sm">No hay historial de aprobaciones aún</p>
          </div>
        )}
      </div>
    );
  }
);

ApprovalTimeline.displayName = "ApprovalTimeline";
