import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
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
  CheckCircle,
  Download,
  FileText,
  Mail,
  Printer,
} from "lucide-react";
import * as React from "react";

/**
 * DocumentGenerator - Organism Component
 *
 * Generador de documentos PDF (cartas de aprobación/rechazo) con preview
 * y opciones de exportación. Implementa RF-21.
 *
 * @example
 * ```tsx
 * <DocumentGenerator
 *   approvalRequest={request}
 *   documentType="approval"
 *   onGenerate={handleGenerate}
 * />
 * ```
 */

export interface DocumentGeneratorProps {
  /** Solicitud de aprobación */
  approvalRequest: ApprovalRequest;
  /** Tipo de documento a generar */
  documentType: "approval" | "rejection" | "notification";
  /** Handler para generar documento */
  onGenerate?: (type: string) => void;
  /** Handler para descargar documento */
  onDownload?: () => void;
  /** Handler para enviar por email */
  onSendEmail?: (email: string) => void;
  /** Handler para imprimir */
  onPrint?: () => void;
  /** Estado de generación */
  isGenerating?: boolean;
  /** URL del documento generado */
  generatedDocumentUrl?: string;
  /** Clase CSS adicional */
  className?: string;
}

const DOCUMENT_TEMPLATES = {
  approval: {
    title: "Carta de Aprobación",
    description: "Documento oficial de aprobación de reserva",
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  rejection: {
    title: "Carta de Rechazo",
    description: "Documento oficial de rechazo de solicitud",
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
  },
  notification: {
    title: "Notificación",
    description: "Documento de notificación al solicitante",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
};

export const DocumentGenerator = React.memo<DocumentGeneratorProps>(
  ({
    approvalRequest,
    documentType,
    onGenerate,
    onDownload,
    onSendEmail,
    onPrint,
    isGenerating = false,
    generatedDocumentUrl,
    className = "",
  }) => {
    const [emailAddress, setEmailAddress] = React.useState(
      approvalRequest.userEmail
    );
    const [showEmailInput, setShowEmailInput] = React.useState(false);

    const template = DOCUMENT_TEMPLATES[documentType];
    const Icon = template.icon;

    const handleGenerate = () => {
      onGenerate?.(documentType);
    };

    const handleSendEmail = () => {
      if (emailAddress && onSendEmail) {
        onSendEmail(emailAddress);
        setShowEmailInput(false);
      }
    };

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header con información del documento */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${template.bgColor}`}>
                <Icon className={`h-6 w-6 ${template.color}`} />
              </div>
              <div className="flex-1">
                <CardTitle>{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </div>
              <Badge
                variant={documentType === "approval" ? "success" : "default"}
              >
                {documentType.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Información de la solicitud */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] rounded-lg">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  Solicitante
                </p>
                <p className="text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mt-1">
                  {approvalRequest.userName}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {approvalRequest.userEmail}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  Recurso
                </p>
                <p className="text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mt-1">
                  {approvalRequest.resourceName}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {approvalRequest.resourceType}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  Fecha de Reserva
                </p>
                <p className="text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mt-1">
                  {format(
                    new Date(approvalRequest.startDate),
                    "d 'de' MMMM, yyyy",
                    { locale: es }
                  )}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {format(new Date(approvalRequest.startDate), "HH:mm")} -{" "}
                  {format(new Date(approvalRequest.endDate), "HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  ID de Solicitud
                </p>
                <p className="text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mt-1 font-mono text-sm">
                  {approvalRequest.id}
                </p>
              </div>
            </div>

            {/* Preview del contenido del documento */}
            <div className="p-4 border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] rounded-lg">
              <h4 className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-3">
                Vista Previa del Contenido
              </h4>
              <div className="space-y-2 text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)]">
                <p>
                  Estimado/a <strong>{approvalRequest.userName}</strong>,
                </p>
                {documentType === "approval" ? (
                  <>
                    <p>
                      Por medio de la presente, nos complace informarle que su
                      solicitud de reserva para el recurso{" "}
                      <strong>{approvalRequest.resourceName}</strong> ha sido{" "}
                      <strong className="text-green-600 dark:text-green-400">
                        APROBADA
                      </strong>
                      .
                    </p>
                    <p>
                      Detalles de la reserva:
                      <br />- Fecha:{" "}
                      {format(
                        new Date(approvalRequest.startDate),
                        "d 'de' MMMM, yyyy",
                        { locale: es }
                      )}
                      <br />- Horario:{" "}
                      {format(new Date(approvalRequest.startDate), "HH:mm")} -{" "}
                      {format(new Date(approvalRequest.endDate), "HH:mm")}
                      <br />- Código QR:{" "}
                      {approvalRequest.qrCode || "Por generar"}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Por medio de la presente, lamentamos informarle que su
                      solicitud de reserva para el recurso{" "}
                      <strong>{approvalRequest.resourceName}</strong> ha sido{" "}
                      <strong className="text-red-600 dark:text-red-400">
                        RECHAZADA
                      </strong>
                      .
                    </p>
                    {approvalRequest.rejectionReason && (
                      <p>
                        Motivo: <em>{approvalRequest.rejectionReason}</em>
                      </p>
                    )}
                  </>
                )}
                <p className="pt-2">
                  Atentamente,
                  <br />
                  {approvalRequest.reviewerName ||
                    "Sistema de Gestión de Reservas"}
                  <br />
                  Universidad Francisco de Paula Santander
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-3">
              {!generatedDocumentUrl ? (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generar Documento PDF
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button onClick={onDownload} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button onClick={onPrint} variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button
                    onClick={() => setShowEmailInput(!showEmailInput)}
                    variant="outline"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar por Email
                  </Button>
                </>
              )}
            </div>

            {/* Input de email */}
            {showEmailInput && (
              <div className="flex gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="flex-1 px-3 py-2 border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)] rounded-lg bg-white dark:bg-[var(--color-bg-inverse)] text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]"
                />
                <Button onClick={handleSendEmail} size="sm">
                  Enviar
                </Button>
                <Button
                  onClick={() => setShowEmailInput(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            )}

            {/* Información de documento generado */}
            {generatedDocumentUrl && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Documento generado exitosamente
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                    {generatedDocumentUrl}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
          <p>
            * El documento será generado en formato PDF siguiendo la plantilla
            oficial de la institución.
          </p>
          <p>
            * Incluirá código QR único para validación en el proceso de
            check-in.
          </p>
        </div>
      </div>
    );
  }
);

DocumentGenerator.displayName = "DocumentGenerator";
