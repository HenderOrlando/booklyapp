import { ApprovalActionButton } from "@/components/atoms/ApprovalActionButton";
import { Button } from "@/components/atoms/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/Dialog";
import type { ApprovalActionType } from "@/types/entities/approval";
import { AlertCircle } from "lucide-react";
import * as React from "react";

/**
 * ApprovalActions - Molecule Component
 *
 * Grupo de acciones de aprobación con modales de confirmación
 * y campos para comentarios/razones.
 *
 * @example
 * ```tsx
 * <ApprovalActions
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 *   onComment={handleComment}
 * />
 * ```
 */

export interface ApprovalActionsProps {
  /** Handler para aprobar */
  onApprove?: (comments: string) => void;
  /** Handler para rechazar */
  onReject?: (reason: string) => void;
  /** Handler para solicitar cambios */
  onRequestChanges?: (comments: string) => void;
  /** Handler para delegar */
  onDelegate?: (userId: string, comments: string) => void;
  /** Handler para agregar comentario */
  onComment?: (comment: string) => void;
  /** Estado de carga */
  loading?: boolean;
  /** Deshabilitar acciones */
  disabled?: boolean;
  /** Mostrar solo acciones principales */
  compact?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export const ApprovalActions = React.memo<ApprovalActionsProps>(
  ({
    onApprove,
    onReject,
    onRequestChanges,
    onDelegate,
    onComment,
    loading = false,
    disabled = false,
    compact = false,
    className = "",
  }) => {
    const [activeAction, setActiveAction] =
      React.useState<ApprovalActionType | null>(null);
    const [inputValue, setInputValue] = React.useState("");

    const handleOpenDialog = (action: ApprovalActionType) => {
      setActiveAction(action);
      setInputValue("");
    };

    const handleCloseDialog = () => {
      setActiveAction(null);
      setInputValue("");
    };

    const handleConfirm = () => {
      if (!activeAction) return;

      switch (activeAction) {
        case "APPROVE":
          onApprove?.(inputValue);
          break;
        case "REJECT":
          if (inputValue.trim()) {
            onReject?.(inputValue);
          }
          break;
        case "REQUEST_CHANGES":
          if (inputValue.trim()) {
            onRequestChanges?.(inputValue);
          }
          break;
        case "COMMENT":
          if (inputValue.trim()) {
            onComment?.(inputValue);
          }
          break;
      }

      handleCloseDialog();
    };

    const getDialogContent = () => {
      switch (activeAction) {
        case "APPROVE":
          return {
            title: "Aprobar Solicitud",
            description: "¿Está seguro que desea aprobar esta solicitud?",
            label: "Comentarios (opcional)",
            placeholder: "Agregue comentarios adicionales...",
            required: false,
            confirmText: "Aprobar",
            confirmVariant: "default" as const,
          };
        case "REJECT":
          return {
            title: "Rechazar Solicitud",
            description: "Por favor proporcione una razón para el rechazo",
            label: "Motivo del rechazo *",
            placeholder: "Explique por qué se rechaza esta solicitud...",
            required: true,
            confirmText: "Rechazar",
            confirmVariant: "destructive" as const,
          };
        case "REQUEST_CHANGES":
          return {
            title: "Solicitar Cambios",
            description: "Especifique los cambios que se deben realizar",
            label: "Cambios requeridos *",
            placeholder: "Describa los cambios necesarios...",
            required: true,
            confirmText: "Solicitar",
            confirmVariant: "secondary" as const,
          };
        case "COMMENT":
          return {
            title: "Agregar Comentario",
            description: "Su comentario será visible en el historial",
            label: "Comentario *",
            placeholder: "Escriba su comentario...",
            required: true,
            confirmText: "Guardar",
            confirmVariant: "default" as const,
          };
        default:
          return null;
      }
    };

    const dialogContent = getDialogContent();

    return (
      <>
        <div className={`flex flex-wrap gap-2 ${className}`}>
          {/* Acciones principales */}
          {onApprove && (
            <ApprovalActionButton
              action="approve"
              onClick={() => handleOpenDialog("APPROVE")}
              disabled={disabled || loading}
              loading={loading && activeAction === "APPROVE"}
            />
          )}

          {onReject && (
            <ApprovalActionButton
              action="reject"
              onClick={() => handleOpenDialog("REJECT")}
              disabled={disabled || loading}
              loading={loading && activeAction === "REJECT"}
            />
          )}

          {/* Acciones secundarias (solo si no es compact) */}
          {!compact && (
            <>
              {onComment && (
                <ApprovalActionButton
                  action="comment"
                  onClick={() => handleOpenDialog("COMMENT")}
                  disabled={disabled || loading}
                  loading={loading && activeAction === "COMMENT"}
                />
              )}

              {onDelegate && (
                <ApprovalActionButton
                  action="delegate"
                  onClick={() => handleOpenDialog("DELEGATE")}
                  disabled={disabled || loading}
                  loading={loading && activeAction === "DELEGATE"}
                />
              )}
            </>
          )}
        </div>

        {/* Modal de confirmación */}
        {dialogContent && (
          <Dialog open={activeAction !== null} onOpenChange={handleCloseDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{dialogContent.title}</DialogTitle>
                <DialogDescription>
                  {dialogContent.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {activeAction === "REJECT" && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Esta acción notificará al solicitante y no podrá
                      deshacerse
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {dialogContent.label}
                  </label>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={dialogContent.placeholder}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-base)] focus:border-transparent"
                    required={dialogContent.required}
                  />
                  {dialogContent.required && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      * Campo obligatorio
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  variant={dialogContent.confirmVariant}
                  onClick={handleConfirm}
                  disabled={
                    loading || (dialogContent.required && !inputValue.trim())
                  }
                >
                  {dialogContent.confirmText}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }
);

ApprovalActions.displayName = "ApprovalActions";
