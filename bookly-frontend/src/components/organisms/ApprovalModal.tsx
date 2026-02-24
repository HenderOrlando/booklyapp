import { ApprovalStatusBadge } from "@/components/atoms/ApprovalStatusBadge";
import { Badge } from "@/components/atoms/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/Dialog";
import { ApprovalActions } from "@/components/molecules/ApprovalActions";
import { ApprovalTimeline } from "@/components/molecules/ApprovalTimeline";
import { ConflictAlert } from "@/components/molecules/ConflictAlert";
import { DocumentPreview } from "@/components/molecules/DocumentPreview";
import type { ApprovalRequest } from "@/types/entities/approval";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";

// Helper para formateo seguro de fechas
const safeFormat = (dateValue: string | Date | null | undefined, formatStr: string, options?: Parameters<typeof format>[2]): string => {
  if (!dateValue) return "Fecha no disponible";
  const date = new Date(dateValue);
  if (!isValid(date)) return "Fecha inválida";
  return format(date, formatStr, options);
};
import {
  AlertCircle,
  Calendar,
  Clock,
  Download,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Share2,
  User,
  Users,
  X,
} from "lucide-react";
import * as React from "react";

/**
 * ApprovalModal - Organism Component
 *
 * Modal completo para ver detalle de una solicitud de aprobación
 * e interactuar con ella. Integra múltiples molecules.
 *
 * @example
 * ```tsx
 * <ApprovalModal
 *   request={request}
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onApprove={handleApprove}
 * />
 * ```
 */

export interface ApprovalModalProps {
  /** Solicitud de aprobación */
  request: ApprovalRequest | null;
  /** Estado de apertura */
  isOpen: boolean;
  /** Handler para cerrar */
  onClose: () => void;
  /** Handler para aprobar */
  onApprove?: (comments?: string) => void;
  /** Handler para rechazar */
  onReject?: (reason: string) => void;
  /** Handler para comentar */
  onComment?: (comment: string) => void;
  /** Handler para delegar */
  onDelegate?: (userId: string, comments: string) => void;
  /** Handler para descargar */
  onDownload?: (requestId: string) => void;
  /** Handler para compartir */
  onShare?: (requestId: string, medium: "email" | "sms" | "whatsapp") => void;
  /** Mostrar acciones */
  showActions?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export const ApprovalModal = React.memo<ApprovalModalProps>(
  ({
    request,
    isOpen,
    onClose,
    onApprove,
    onReject,
    onComment,
    onDelegate,
    onDownload,
    onShare,
    showActions = true,
    className = "",
  }) => {
    const [activeTab, setActiveTab] = React.useState<
      "details" | "timeline" | "document"
    >("details");
    const [showNotificationModal, setShowNotificationModal] =
      React.useState(false);
    const [notificationMedium, setNotificationMedium] = React.useState<
      "email" | "sms" | "whatsapp"
    >("email");
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [isSharing, setIsSharing] = React.useState(false);

    // Reset tab cuando cambia la solicitud
    React.useEffect(() => {
      if (isOpen) {
        setActiveTab("details");
      }
    }, [isOpen, request?.id]);

    if (!request) {
      return null;
    }

    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    const isExpiring = request.expiresAt
      ? new Date(request.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000
      : false;

    // Handler para descargar documento
    const handleDownload = async () => {
      if (!request || !onDownload) return;

      setIsDownloading(true);
      try {
        await onDownload(request.id);
      } catch (error) {
        console.error("Error al descargar:", error);
      } finally {
        setIsDownloading(false);
      }
    };

    // Handler para compartir
    const handleShare = () => {
      setShowNotificationModal(true);
    };

    // Handler para confirmar envío de notificación
    const handleSendNotification = async () => {
      if (!request || !onShare) return;

      setIsSharing(true);
      try {
        await onShare(request.id, notificationMedium);
        setShowNotificationModal(false);
      } catch (error) {
        console.error("Error al compartir:", error);
      } finally {
        setIsSharing(false);
      }
    };

    return (
      <>
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent
            className={`max-w-4xl max-h-[90vh] overflow-hidden ${className}`}
          >
            {/* Header con título y estado */}
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold">
                    Solicitud de Aprobación
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    ID: {request.id}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Botones de acción */}
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-inverse)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Descargar documento"
                  >
                    <Download className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]" />
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-inverse)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Compartir documento"
                  >
                    <Share2 className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]" />
                  </button>

                  {/* Estados */}
                  <ApprovalStatusBadge status={request.status} />
                  {request.priority === "URGENT" && (
                    <Badge variant="error">Urgente</Badge>
                  )}
                  {request.priority === "HIGH" && (
                    <Badge variant="warning">Alta Prioridad</Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Alerta de expiración */}
            {isExpiring && request.status === "PENDING" && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning-text)]">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Solicitud por expirar</p>
                  <p className="text-xs mt-1">
                    Esta solicitud expirará el{" "}
                    {request.expiresAt &&
                      safeFormat(request.expiresAt, "PPpp", {
                        locale: es,
                      })}
                  </p>
                </div>
              </div>
            )}

            {/* Alerta de conflictos de disponibilidad */}
            {request.status === "PENDING" && (
              <ConflictAlert
                resourceId={request.resourceId}
                startDate={request.startDate}
                endDate={request.endDate}
                excludeReservationId={request.reservationId}
              />
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === "details"
                    ? "text-[var(--color-action-primary)] border-b-2 border-[var(--color-action-primary)]"
                    : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-inverse)]"
                }`}
              >
                Detalles
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === "timeline"
                    ? "text-[var(--color-action-primary)] border-b-2 border-[var(--color-action-primary)]"
                    : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-inverse)]"
                }`}
              >
                Historial
              </button>
              {request.documentUrl && (
                <button
                  onClick={() => setActiveTab("document")}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === "document"
                      ? "text-[var(--color-action-primary)] border-b-2 border-[var(--color-action-primary)]"
                      : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-inverse)]"
                  }`}
                >
                  Documento
                </button>
              )}
            </div>

            {/* Contenido scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-300px)] pr-2">
              {/* Tab: Detalles */}
              {activeTab === "details" && (
                <div className="space-y-6 py-4">
                  {/* Información del solicitante */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-3">
                      Solicitante
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]" />
                        <span className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                          {request.userName}
                        </span>
                        {request.userRole && (
                          <Badge variant="outline" className="text-xs">
                            {request.userRole}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                        {request.userEmail}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                        <Calendar className="h-3.5 w-3.5" />
                        Solicitado el{" "}
                        {safeFormat(request.requestedAt, "PPpp", { locale: es })}
                      </div>
                    </div>
                  </div>

                  {/* Información del recurso */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-3">
                      Recurso
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                        <MapPin className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]" />
                        {request.resourceName}
                      </div>
                      {request.resourceType && (
                        <div className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                          Tipo: {request.resourceType}
                        </div>
                      )}
                      {request.categoryName && (
                        <div className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                          Categoría: {request.categoryName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Horario */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-3">
                      Horario de Reserva
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]" />
                        <span className="text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                          {format(startDate, "EEEE d 'de' MMMM 'de' yyyy", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]" />
                        <span className="text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                          {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                        </span>
                        <span className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                          ({Math.round(
                            (endDate.getTime() - startDate.getTime()) /
                              (1000 * 60)
                          )}{" "}
                          minutos)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Propósito */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-3">
                      Propósito
                    </h3>
                    <p className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)]">
                      {request.purpose}
                    </p>
                  </div>

                  {/* Asistentes */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-3">
                      Información Adicional
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]" />
                        <span className="text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                          {request.attendees} asistentes esperados
                        </span>
                      </div>
                      {request.requiresEquipment &&
                        request.requiresEquipment.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                              Equipamiento requerido:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {request.requiresEquipment.map((eq, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {eq}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      {request.specialRequirements && (
                        <div className="text-sm">
                          <span className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                            Requisitos especiales:
                          </span>
                          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
                            {request.specialRequirements}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nivel de aprobación */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-3">
                      Flujo de Aprobación
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                          Nivel actual:
                        </span>
                        <Badge variant="default">{request.currentLevel}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                          Nivel máximo:
                        </span>
                        <Badge variant="outline">{request.maxLevel}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Información de revisión (si existe) */}
                  {request.reviewedAt && (
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-3">
                        Revisión
                      </h3>
                      <div className="space-y-2">
                        {request.reviewerName && (
                          <div className="text-sm">
                            <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                              Revisado por:
                            </span>{" "}
                            <span className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                              {request.reviewerName}
                            </span>
                          </div>
                        )}
                        <div className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                          Fecha:{" "}
                          {safeFormat(request.reviewedAt, "PPpp", {
                            locale: es,
                          })}
                        </div>
                        {request.comments && (
                          <div className="p-3 bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] rounded-lg text-sm">
                            <span className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                              Comentarios:
                            </span>
                            <p className="text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mt-1">
                              {request.comments}
                            </p>
                          </div>
                        )}
                        {request.rejectionReason && (
                          <div className="p-3 bg-[var(--color-state-error-bg)] rounded-lg text-sm">
                            <span className="font-medium text-[var(--color-state-error-text)]">
                              Razón de rechazo:
                            </span>
                            <p className="text-[var(--color-state-error-text)] mt-1">
                              {request.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Timeline */}
              {activeTab === "timeline" && (
                <div className="py-4">
                  {request.history && request.history.length > 0 ? (
                    <ApprovalTimeline
                      history={request.history}
                      currentLevel={request.currentLevel}
                      maxLevel={request.maxLevel}
                    />
                  ) : (
                    <div className="text-center py-12 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No hay historial disponible</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Documento */}
              {activeTab === "document" && request.documentUrl && (
                <div className="py-4">
                  <DocumentPreview
                    pdfUrl={request.documentUrl}
                    title={`Solicitud ${request.id}`}
                  />
                </div>
              )}
            </div>

            {/* Footer con acciones */}
            {showActions && request.status === "PENDING" && (
              <div className="border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] pt-4">
                <ApprovalActions
                  onApprove={
                    onApprove ? (comments) => onApprove(comments) : undefined
                  }
                  onReject={onReject ? (reason) => onReject(reason) : undefined}
                  onComment={
                    onComment ? (comment) => onComment(comment) : undefined
                  }
                  onDelegate={(userId, comments) => {
                    if (onDelegate) {
                      onDelegate(userId, comments);
                    }
                  }}
                />
              </div>
            )}

            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              title="Cerrar"
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-inverse)] transition-colors"
            >
              <X className="h-5 w-5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]" />
            </button>
          </DialogContent>
        </Dialog>

        {/* Modal de notificación/compartir */}
        <Dialog
          open={showNotificationModal}
          onOpenChange={setShowNotificationModal}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Compartir Solicitud</DialogTitle>
              <DialogDescription>
                Seleccione el medio por el cual desea compartir esta solicitud
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Selector de medio */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)]">
                  Medio de envío
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setNotificationMedium("email")}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      notificationMedium === "email"
                        ? "border-[var(--color-action-primary)] bg-[var(--color-state-info-bg)]"
                        : "border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] hover:border-[var(--color-border-strong)] dark:hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <Mail className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">Email</p>
                      <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                        Enviar por correo electrónico
                      </p>
                    </div>
                    {notificationMedium === "email" && (
                      <div className="h-2 w-2 rounded-full bg-[var(--color-action-primary)]" />
                    )}
                  </button>

                  <button
                    onClick={() => setNotificationMedium("sms")}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      notificationMedium === "sms"
                        ? "border-[var(--color-action-primary)] bg-[var(--color-state-info-bg)]"
                        : "border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] hover:border-[var(--color-border-strong)] dark:hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">SMS</p>
                      <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                        Enviar mensaje de texto
                      </p>
                    </div>
                    {notificationMedium === "sms" && (
                      <div className="h-2 w-2 rounded-full bg-[var(--color-action-primary)]" />
                    )}
                  </button>

                  <button
                    onClick={() => setNotificationMedium("whatsapp")}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      notificationMedium === "whatsapp"
                        ? "border-[var(--color-action-primary)] bg-[var(--color-state-info-bg)]"
                        : "border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] hover:border-[var(--color-border-strong)] dark:hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">WhatsApp</p>
                      <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                        Enviar por WhatsApp
                      </p>
                    </div>
                    {notificationMedium === "whatsapp" && (
                      <div className="h-2 w-2 rounded-full bg-[var(--color-action-primary)]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
              <button
                onClick={() => setShowNotificationModal(false)}
                disabled={isSharing}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-inverse)] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendNotification}
                disabled={isSharing}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-inverse)] bg-[var(--color-action-primary)] hover:bg-[var(--color-action-primary-hover)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSharing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-text-inverse)]" />
                    Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

ApprovalModal.displayName = "ApprovalModal";
