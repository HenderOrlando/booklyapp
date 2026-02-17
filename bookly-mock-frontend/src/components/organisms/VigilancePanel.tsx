import { Badge } from "@/components/atoms/Badge";
import { Card, CardContent } from "@/components/atoms/Card";
import type {
  ActiveReservationView,
  VigilanceAlert,
  VigilanceAlertType,
} from "@/types/entities/checkInOut";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import * as React from "react";

/**
 * VigilancePanel - Organism Component
 *
 * Panel de vigilancia en tiempo real que muestra reservas activas,
 * con retraso y alertas. Usado por personal de seguridad.
 *
 * @example
 * ```tsx
 * <VigilancePanel
 *   activeReservations={active}
 *   overdueReservations={overdue}
 *   alerts={alerts}
 *   onContact={handleContact}
 * />
 * ```
 */

export interface VigilancePanelProps {
  /** Reservas activas (con check-in realizado) */
  activeReservations: ActiveReservationView[];
  /** Reservas con retraso (sin check-in) */
  overdueReservations: ActiveReservationView[];
  /** Alertas activas */
  alerts: VigilanceAlert[];
  /** Handler para contactar usuario */
  onContact?: (reservationId: string) => void;
  /** Handler para marcar alerta como resuelta */
  onResolveAlert?: (alertId: string) => void;
  /** Estado de carga */
  loading?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

const ALERT_TYPE_CONFIG: Record<
  VigilanceAlertType,
  {
    label: string;
    variant: "error" | "warning" | "default";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  NO_CHECK_IN: {
    label: "Sin Check-in",
    variant: "error",
    icon: XCircle,
  },
  LATE_CHECK_IN: {
    label: "Check-in Tardío",
    variant: "warning",
    icon: Clock,
  },
  NO_CHECK_OUT: {
    label: "Sin Check-out",
    variant: "warning",
    icon: AlertCircle,
  },
  LATE_CHECK_OUT: {
    label: "Check-out Tardío",
    variant: "warning",
    icon: Clock,
  },
  SUSPICIOUS_ACTIVITY: {
    label: "Actividad Sospechosa",
    variant: "error",
    icon: AlertCircle,
  },
  UNAUTHORIZED_ACCESS: {
    label: "Acceso No Autorizado",
    variant: "error",
    icon: XCircle,
  },
  RESOURCE_ISSUE: {
    label: "Problema con Recurso",
    variant: "warning",
    icon: AlertCircle,
  },
  EMERGENCY: {
    label: "Emergencia",
    variant: "error",
    icon: XCircle,
  },
};

export const VigilancePanel = React.memo<VigilancePanelProps>(
  ({
    activeReservations,
    overdueReservations,
    alerts,
    onContact,
    onResolveAlert,
    loading = false,
    className = "",
  }) => {
    const [selectedTab, setSelectedTab] = React.useState<
      "active" | "overdue" | "alerts"
    >("active");

    // Estadísticas
    const stats = React.useMemo(
      () => ({
        totalActive: activeReservations.length,
        totalOverdue: overdueReservations.length,
        totalAlerts: alerts.filter((a) => !a.isResolved).length,
      }),
      [activeReservations, overdueReservations, alerts],
    );

    const renderReservationCard = (
      reservation: ActiveReservationView,
      isOverdue = false,
    ) => {
      const now = new Date();
      const start = new Date(reservation.startTime);
      const end = new Date(reservation.endTime);
      const isActive = now >= start && now <= end;
      const minutesOverdue = isOverdue
        ? Math.floor((now.getTime() - start.getTime()) / (1000 * 60))
        : 0;

      return (
        <Card
          key={reservation.reservationId}
          className={`${
            isOverdue
              ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10"
              : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header con estado */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                    {reservation.resourceName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{reservation.resourceType}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {reservation.status === "CHECKED_IN" ||
                  reservation.status === "CHECKED_OUT" ? (
                    <Badge variant="success" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Check-in OK
                    </Badge>
                  ) : isOverdue ? (
                    <Badge variant="error" className="text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      Sin Check-in
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Pendiente
                    </Badge>
                  )}
                </div>
              </div>

              {/* Usuario */}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]" />
                <span className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                  {reservation.userName}
                </span>
                {reservation.userEmail && (
                  <span className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                    {reservation.userEmail}
                  </span>
                )}
              </div>

              {/* Horario */}
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {format(start, "HH:mm")} - {format(end, "HH:mm")}
                  </span>
                </div>
                {isActive && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    • En curso
                  </span>
                )}
              </div>

              {/* Alerta de retraso */}
              {isOverdue && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      Retraso de {minutesOverdue} minutos
                    </p>
                    <p className="text-xs mt-1">
                      No se ha realizado check-in. Contacte al usuario.
                    </p>
                  </div>
                </div>
              )}

              {/* Información de check-in */}
              {reservation.checkInTime && (
                <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  Check-in:{" "}
                  {format(new Date(reservation.checkInTime), "HH:mm:ss")}
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-2 pt-2 border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
                {onContact && (
                  <button
                    onClick={() => onContact(reservation.reservationId)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-primary-base)] border border-[var(--color-primary-base)] rounded-lg hover:bg-[var(--color-primary-base)] hover:text-foreground transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Contactar
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    };

    const renderAlert = (alert: VigilanceAlert) => {
      const config = ALERT_TYPE_CONFIG[alert.type];
      const Icon = config.icon;

      return (
        <Card
          key={alert.id}
          className="border-orange-300 dark:border-orange-800"
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                        {config.label}
                      </h4>
                      <Badge variant={config.variant} className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles de la reserva */}
              {alert.reservationId && (
                <div className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  <p>
                    <span className="font-medium">Reserva:</span>{" "}
                    {alert.reservationId}
                  </p>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                {format(new Date(alert.timestamp), "d 'de' MMM, HH:mm:ss", {
                  locale: es,
                })}
              </div>

              {/* Acciones */}
              {!alert.isResolved && onResolveAlert && (
                <button
                  onClick={() => onResolveAlert(alert.id)}
                  className="w-full px-3 py-2 text-sm font-medium text-foreground bg-green-600 dark:bg-green-700 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                >
                  Marcar como Resuelta
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    };

    return (
      <div className={`space-y-4 ${className}`}>
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  Activas
                </p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                  {stats.totalActive}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  Con Retraso
                </p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                  {stats.totalOverdue}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  Alertas
                </p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                  {stats.totalAlerts}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
          <button
            onClick={() => setSelectedTab("active")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              selectedTab === "active"
                ? "text-[var(--color-primary-base)] border-b-2 border-[var(--color-primary-base)]"
                : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-inverse)]"
            }`}
          >
            Activas ({stats.totalActive})
          </button>
          <button
            onClick={() => setSelectedTab("overdue")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              selectedTab === "overdue"
                ? "text-[var(--color-primary-base)] border-b-2 border-[var(--color-primary-base)]"
                : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-inverse)]"
            }`}
          >
            Con Retraso ({stats.totalOverdue})
          </button>
          <button
            onClick={() => setSelectedTab("alerts")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              selectedTab === "alerts"
                ? "text-[var(--color-primary-base)] border-b-2 border-[var(--color-primary-base)]"
                : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-inverse)]"
            }`}
          >
            Alertas ({stats.totalAlerts})
          </button>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-base)]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {selectedTab === "active" &&
              activeReservations.map((res) => renderReservationCard(res))}
            {selectedTab === "overdue" &&
              overdueReservations.map((res) =>
                renderReservationCard(res, true),
              )}
            {selectedTab === "alerts" &&
              alerts
                .filter((a) => !a.isResolved)
                .map((alert) => renderAlert(alert))}

            {/* Empty states */}
            {selectedTab === "active" && activeReservations.length === 0 && (
              <div className="col-span-2 text-center py-12 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                No hay reservas activas en este momento
              </div>
            )}
            {selectedTab === "overdue" && overdueReservations.length === 0 && (
              <div className="col-span-2 text-center py-12 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                ✅ No hay reservas con retraso
              </div>
            )}
            {selectedTab === "alerts" && stats.totalAlerts === 0 && (
              <div className="col-span-2 text-center py-12 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                ✅ No hay alertas activas
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

VigilancePanel.displayName = "VigilancePanel";
