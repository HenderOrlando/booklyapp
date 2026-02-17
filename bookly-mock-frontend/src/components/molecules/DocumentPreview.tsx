import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Download, Eye, FileText, Printer } from "lucide-react";
import * as React from "react";

/**
 * DocumentPreview - Molecule Component
 *
 * Componente para previsualizar documentos PDF generados (cartas de aprobación).
 * Muestra información del documento y opciones para descargar, imprimir o ver.
 *
 * @example
 * ```tsx
 * <DocumentPreview
 *   documentId="doc_123"
 *   title="Carta de Aprobación"
 *   onDownload={handleDownload}
 *   onPrint={handlePrint}
 * />
 * ```
 */

export interface DocumentPreviewProps {
  /** ID del documento */
  documentId?: string;
  /** Título del documento */
  title: string;
  /** Descripción del documento */
  description?: string;
  /** URL del PDF (opcional, para preview iframe) */
  pdfUrl?: string;
  /** Tamaño del archivo en bytes */
  fileSize?: number;
  /** Fecha de generación */
  generatedAt?: string;
  /** Handler para descargar */
  onDownload?: () => void;
  /** Handler para imprimir */
  onPrint?: () => void;
  /** Handler para ver en modal completo */
  onView?: () => void;
  /** Estado de carga */
  loading?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DocumentPreview = React.memo<DocumentPreviewProps>(
  ({
    documentId,
    title,
    description,
    pdfUrl,
    fileSize,
    generatedAt,
    onDownload,
    onPrint,
    onView,
    loading = false,
    className = "",
  }) => {
    const [previewError, setPreviewError] = React.useState(false);

    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]" />
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Información del documento */}
          {(fileSize || generatedAt || documentId) && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {fileSize && (
                <div>
                  <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                    Tamaño:
                  </span>
                  <span className="ml-2 font-medium">
                    {formatFileSize(fileSize)}
                  </span>
                </div>
              )}
              {generatedAt && (
                <div>
                  <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                    Generado:
                  </span>
                  <span className="ml-2 font-medium">
                    {new Date(generatedAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
              )}
              {documentId && (
                <div className="col-span-2">
                  <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">ID:</span>
                  <code className="ml-2 text-xs bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] px-2 py-0.5 rounded">
                    {documentId}
                  </code>
                </div>
              )}
            </div>
          )}

          {/* Preview del PDF (iframe) */}
          {pdfUrl && !previewError && (
            <div className="relative rounded-lg border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] overflow-hidden">
              <div className="aspect-[8.5/11] min-h-[300px]">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title={`Preview: ${title}`}
                  onError={() => setPreviewError(true)}
                />
              </div>
            </div>
          )}

          {/* Error de preview */}
          {pdfUrl && previewError && (
            <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] text-center">
              <FileText className="h-12 w-12 text-[var(--color-text-tertiary)] dark:text-[var(--color-text-secondary)] mb-3" />
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                No se puede mostrar la vista previa
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] mt-1">
                Use el botón de descarga para ver el documento
              </p>
            </div>
          )}

          {/* Si no hay pdfUrl, mostrar placeholder */}
          {!pdfUrl && (
            <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] text-center">
              <FileText className="h-12 w-12 text-[var(--color-text-tertiary)] dark:text-[var(--color-text-secondary)] mb-3" />
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                Documento disponible
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] mt-1">
                Use las opciones de abajo para visualizar
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
            {onView && (
              <Button
                variant="default"
                onClick={onView}
                disabled={loading}
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Completo
              </Button>
            )}

            {onDownload && (
              <Button
                variant="secondary"
                onClick={onDownload}
                disabled={loading}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            )}

            {onPrint && (
              <Button variant="outline" onClick={onPrint} disabled={loading}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            )}
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-primary-base)]" />
              <span className="ml-3 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                Generando documento...
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

DocumentPreview.displayName = "DocumentPreview";
