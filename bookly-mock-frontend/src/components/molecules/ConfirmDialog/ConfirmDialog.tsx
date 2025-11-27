import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import * as React from "react";

/**
 * ConfirmDialog - Molecule Component
 *
 * Diálogo de confirmación reutilizable para acciones destructivas o importantes.
 * Elimina código duplicado de modales de confirmación en múltiples páginas.
 */

export interface ConfirmDialogProps {
  /** Si el diálogo está abierto */
  open: boolean;
  /** Callback al cerrar el diálogo */
  onClose: () => void;
  /** Callback al confirmar la acción */
  onConfirm: () => void | Promise<void>;
  /** Título del diálogo */
  title: string;
  /** Descripción de la acción */
  description: string;
  /** Texto del botón de confirmación */
  confirmText?: string;
  /** Texto del botón de cancelar */
  cancelText?: string;
  /** Variante del botón de confirmación */
  variant?: "default" | "destructive";
  /** Contenido adicional (preview del elemento, etc.) */
  children?: React.ReactNode;
  /** Si está procesando la acción */
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  children,
  loading = false,
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open) return null;

  const isDisabled = loading || isProcessing;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader>
            <CardTitle id="dialog-title">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {children}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isDisabled}>
                {cancelText}
              </Button>
              <Button
                variant={variant === "destructive" ? "default" : "default"}
                onClick={handleConfirm}
                disabled={isDisabled}
                className={
                  variant === "destructive"
                    ? "bg-[var(--color-state-error-bg)] hover:bg-[var(--color-state-error-text)] border-[var(--color-state-error-border)] text-white"
                    : ""
                }
              >
                {isDisabled && (
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                )}
                {confirmText}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
