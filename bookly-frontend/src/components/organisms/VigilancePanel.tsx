import { Badge } from "@/components/atoms/Badge";
import { Card, CardContent } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { QRViewerModal } from "@/components/organisms/QRViewerModal";
import { CheckInClient } from "@/infrastructure/api/check-in-client";
import type {
  ActiveReservationView,
  VigilanceAlert,
  VigilanceAlertType,
} from "@/types/entities/checkInOut";
import type { ApprovalRequest } from "@/types/entities/approval";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  MapPin,
  Phone,
  QrCode,
  Search,
  Shield,
  User,
  XCircle,
  FileCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * VigilancePanel - Organism Component
 *
 * Panel de vigilancia en tiempo real que muestra reservas activas,
 * con retraso y alertas. Usado por personal de seguridad.
 * Incluye búsqueda y filtros avanzados.
 */

export interface VigilancePanelProps {
  /** Reservas activas (con check-in realizado) */
  activeReservations: ActiveReservationView[];
  /** Reservas con retraso (sin check-in) */
  overdueReservations: ActiveReservationView[];
  /** Aprobaciones del día (sin check-in aún) */
  todayApprovals?: ApprovalRequest[];
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
    labelKey: string;
    variant: "error" | "warning" | "default";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  NO_CHECK_IN: {
    labelKey: "alert_no_checkin",
    variant: "error",
    icon: XCircle,
  },
  LATE_CHECK_IN: {
    labelKey: "alert_late_checkin",
    variant: "warning",
    icon: Clock,
  },
  NO_CHECK_OUT: {
    labelKey: "alert_no_checkout",
    variant: "warning",
    icon: AlertCircle,
  },
  LATE_CHECK_OUT: {
    labelKey: "alert_late_checkout",
    variant: "warning",
    icon: Clock,
  },
  SUSPICIOUS_ACTIVITY: {
    labelKey: "alert_suspicious",
    variant: "error",
    icon: AlertCircle,
  },
  UNAUTHORIZED_ACCESS: {
    labelKey: "alert_unauthorized",
    variant: "error",
    icon: XCircle,
  },
  RESOURCE_ISSUE: {
    labelKey: "alert_resource_issue",
    variant: "warning",
    icon: AlertCircle,
  },
  EMERGENCY: {
    labelKey: "alert_emergency",
    variant: "error",
    icon: XCircle,
  },
};

export const VigilancePanel = React.memo<VigilancePanelProps>(
  ({
    activeReservations,
    overdueReservations,
    todayApprovals = [],
    alerts,
    onContact,
    onResolveAlert,
    loading = false,
    className = "",
  }) => {
    const t = useTranslations("vigilance");
    const [selectedTab, setSelectedTab] = React.useState<
      "active" | "overdue" | "approvals" | "alerts"
    >("active");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [filterType, setFilterType] = React.useState<string>("all");
    const [qrModal, setQrModal] = React.useState<{
      isOpen: boolean;
      value: string;
      title: string;
    }>({
      isOpen: false,
      value: "",
      title: "",
    });
    const queryClient = useQueryClient();

    // Mutations para Check-in/out real
    const checkOutMutation = useMutation({
      mutationFn: (reservationId: string) => CheckInClient.checkOut({
        reservationId,
        checkInId: reservationId,
        method: "MANUAL",
        vigilantId: "current_vigilant",
      }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["vigilance-data"] });
      },
    });

    // Filtros aplicados
    const filteredActive = React.useMemo(() => {
      return activeReservations.filter((res) => {
        const search = searchQuery.toLowerCase();
        const matchesSearch =
          (res.userName?.toLowerCase() || "").includes(search) ||
          (res.resourceName?.toLowerCase() || "").includes(search) ||
          (res.reservationId?.toLowerCase() || "").includes(search);
        const matchesType = filterType === "all" || res.resourceType === filterType;
        return matchesSearch && matchesType;
      });
    }, [activeReservations, searchQuery, filterType]);

    const filteredOverdue = React.useMemo(() => {
      return overdueReservations.filter((res) => {
        const search = searchQuery.toLowerCase();
        const matchesSearch =
          (res.userName?.toLowerCase() || "").includes(search) ||
          (res.resourceName?.toLowerCase() || "").includes(search) ||
          (res.reservationId?.toLowerCase() || "").includes(search);
        const matchesType = filterType === "all" || res.resourceType === filterType;
        return matchesSearch && matchesType;
      });
    }, [overdueReservations, searchQuery, filterType]);

    const filteredApprovals = React.useMemo(() => {
      return todayApprovals.filter((req) => {
        const search = searchQuery.toLowerCase();
        const matchesSearch =
          (req.userName?.toLowerCase() || "").includes(search) ||
          (req.resourceName?.toLowerCase() || "").includes(search) ||
          (req.reservationId?.toLowerCase() || "").includes(search);
        const matchesType = filterType === "all" || req.resourceType === filterType;
        return matchesSearch && matchesType;
      });
    }, [todayApprovals, searchQuery, filterType]);

    // Estadísticas actualizadas según filtros
    const stats = React.useMemo(
      () => ({
        totalActive: filteredActive.length,
        totalOverdue: filteredOverdue.length,
        totalApprovals: filteredApprovals.length,
        totalAlerts: alerts.filter((a) => !a.isResolved).length,
      }),
      [filteredActive, filteredOverdue, filteredApprovals, alerts],
    );

    const handleViewQr = (value: string, title: string) => {
      setQrModal({ isOpen: true, value, title });
    };

    const renderApprovalCard = (request: ApprovalRequest) => {
      const start = new Date(request.startDate);

      return (
        <Card
          key={request.id}
          className="border-blue-200 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-900/10"
        >
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {request.resourceName}
                    </h4>
                    <FileCheck className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{request.resourceType}</span>
                    <span className="text-slate-300">|</span>
                    <Badge variant="outline" className="text-[10px]">APROBADA</Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="primary">
                    <Clock className="h-3 w-3 mr-1" />
                    {Number.isNaN(start.getTime()) ? "N/A" : format(start, "HH:mm")}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{request.userName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{request.userEmail}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onContact?.(request.reservationId)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <Phone className="h-3 w-3" />
                  {t("contact")}
                </button>
                <button
                  onClick={() => handleViewQr(request.id, request.resourceName)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                >
                  <QrCode className="h-3 w-3" />
                  {t("view_qr")}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    };

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
          className={`group transition-all hover:shadow-md ${
            isOverdue
              ? "border-red-200 bg-red-50/30 dark:border-red-900/30 dark:bg-red-900/10"
              : "border-slate-200 dark:border-slate-800"
          }`}
        >
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header con estado */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {reservation.resourceName}
                    </h4>
                    <button
                      title={t("view_resource_details")}
                      className="p-1 text-slate-400 hover:text-brand-primary-500 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{reservation.resourceType}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {reservation.reservationId}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {reservation.status === "CHECKED_IN" ||
                  reservation.status === "CHECKED_OUT" ? (
                    <Badge variant="success" className="animate-pulse-subtle">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t("badge_in_use")}
                    </Badge>
                  ) : isOverdue ? (
                    <Badge variant="error" className="animate-bounce-subtle">
                      <XCircle className="h-3 w-3 mr-1" />
                      {t("badge_overdue")}
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <Clock className="h-3 w-3 mr-1" />
                      {t("badge_upcoming")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Grid de Información Principal */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{t("label_user")}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-brand-primary-100 dark:bg-brand-primary-900/30 flex items-center justify-center text-brand-primary-700 dark:text-brand-primary-300">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                        {reservation.userName || t("unknown_user")}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        {reservation.userEmail || "Sin email"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{t("label_schedule")}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {Number.isNaN(start.getTime()) ? "N/A" : format(start, "HH:mm")} - {Number.isNaN(end.getTime()) ? "N/A" : format(end, "HH:mm")}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {isActive ? t("in_progress") : t("today")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerta de retraso mejorada */}
              {isOverdue && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold">
                      {t("overdue_warning", { minutes: minutesOverdue })}
                    </p>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {t("overdue_recommendation")}
                    </p>
                  </div>
                </div>
              )}

              {/* Información de check-in / QR */}
              <div className="flex items-center justify-between text-xs">
                {reservation.checkInTime ? (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    <span>{t("checkin_at")} <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {Number.isNaN(new Date(reservation.checkInTime).getTime()) ? "N/A" : format(new Date(reservation.checkInTime), "HH:mm:ss")}
                    </span></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400 italic">
                    <QrCode className="h-3.5 w-3.5" />
                    <span>{t("waiting_qr")}</span>
                  </div>
                )}
                
                {reservation.qrCode && (
                  <button 
                    onClick={() => handleViewQr(reservation.reservationId, reservation.resourceName)}
                    title={t("view_qr")}
                    className="text-brand-primary-600 hover:underline font-medium"
                  >
                    {t("view_qr")}
                  </button>
                )}
              </div>

              {/* Acciones Expandidas */}
              <div className="flex gap-2 pt-2">
                {onContact && (
                  <button
                    onClick={() => onContact(reservation.reservationId)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                  >
                    <Phone className="h-4 w-4 text-brand-primary-500" />
                    {t("contact")}
                  </button>
                )}
                {reservation.canCheckOut && (
                  <button
                    onClick={() => checkOutMutation.mutate(reservation.reservationId)}
                    disabled={checkOutMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    {t("finish")}
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
          className="border-amber-200 bg-amber-50/20 dark:border-amber-900/30 dark:bg-amber-900/10"
        >
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-xl ${
                    alert.severity === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">
                        {t(config.labelKey)}
                      </h4>
                      <Badge variant={alert.severity === 'HIGH' ? 'error' : 'warning'} className="text-[10px] px-1.5 py-0">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-white/50 dark:bg-black/20 p-2 rounded-lg text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="font-semibold">{t("reservation_id")}</span>
                  <span className="font-mono">{alert.reservationId}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 justify-end">
                  <Clock className="h-3 w-3" />
                  <span>
                    {Number.isNaN(new Date(alert.timestamp).getTime()) ? "N/A" : format(new Date(alert.timestamp), "HH:mm:ss")}
                  </span>
                </div>
              </div>

              {!alert.isResolved && onResolveAlert && (
                <button
                  onClick={() => onResolveAlert(alert.id)}
                  className="w-full px-3 py-2 text-sm font-bold text-white bg-slate-800 dark:bg-slate-700 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-all"
                >
                  {t("mark_resolved")}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    };

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Barra de Búsqueda y Filtros */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder={t("search_filter_placeholder")}
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-slate-400 hidden md:block" />
            <select 
              title={t("filter")}
              className="flex-1 md:w-48 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary-500 outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">{t("filter_all_resources")}</option>
              <option value="Sala">{t("filter_rooms")}</option>
              <option value="Auditorio">{t("filter_auditoriums")}</option>
              <option value="Laboratorio">{t("filter_labs")}</option>
            </select>
          </div>
        </div>

        {/* Tabs de Navegación Mejorados */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
          <button
            onClick={() => setSelectedTab("active")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
              selectedTab === "active"
                ? "bg-white dark:bg-slate-700 text-brand-primary-600 dark:text-brand-primary-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <CheckCircle className={`h-4 w-4 ${selectedTab === 'active' ? 'text-brand-primary-500' : ''}`} />
            {t("tab_in_use")}
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
              selectedTab === 'active' ? 'bg-brand-primary-100 dark:bg-brand-primary-900/30' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {stats.totalActive}
            </span>
          </button>
          <button
            onClick={() => setSelectedTab("overdue")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
              selectedTab === "overdue"
                ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Clock className={`h-4 w-4 ${selectedTab === 'overdue' ? 'text-red-500' : ''}`} />
            {t("tab_overdue")}
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
              selectedTab === 'overdue' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {stats.totalOverdue}
            </span>
          </button>
          <button
            onClick={() => setSelectedTab("approvals")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
              selectedTab === "approvals"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <FileCheck className={`h-4 w-4 ${selectedTab === 'approvals' ? 'text-blue-500' : ''}`} />
            {t("tab_approvals") || "Aprobadas"}
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
              selectedTab === 'approvals' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {stats.totalApprovals}
            </span>
          </button>
          <button
            onClick={() => setSelectedTab("alerts")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
              selectedTab === "alerts"
                ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Bell className={`h-4 w-4 ${selectedTab === 'alerts' ? 'text-amber-500' : ''}`} />
            {t("tab_alerts")}
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
              selectedTab === 'alerts' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {stats.totalAlerts}
            </span>
          </button>
        </div>

        {/* Grid de Contenido con Layout Adaptable */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-brand-primary-500 animate-spin" />
              <Shield className="absolute inset-0 m-auto h-5 w-5 text-brand-primary-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 animate-pulse">{t("loading_monitor")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {selectedTab === "active" &&
              filteredActive.map((res) => renderReservationCard(res))}
            {selectedTab === "overdue" &&
              filteredOverdue.map((res) =>
                renderReservationCard(res, true),
              )}
            {selectedTab === "approvals" &&
              filteredApprovals.map((req) => renderApprovalCard(req))}
            {selectedTab === "alerts" &&
              alerts
                .filter((a) => !a.isResolved)
                .map((alert) => renderAlert(alert))}

            {/* Empty states mejorados */}
            {selectedTab === "active" && filteredActive.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-6">
                  <CheckCircle className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t("empty_active_title")}</h3>
                <p className="text-slate-500 mt-2 max-w-sm text-center">
                  {searchQuery ? t("empty_active_search") : t("empty_active_desc")}
                </p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="mt-4 text-brand-primary-600 font-bold hover:underline">
                    {t("clear_search")}
                  </button>
                )}
              </div>
            )}
            {selectedTab === "overdue" && filteredOverdue.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-green-50/30 dark:bg-green-900/10 rounded-2xl border-2 border-dashed border-green-200 dark:border-green-900/30">
                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-6">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400">{t("empty_overdue_title")}</h3>
                <p className="text-green-600/70 dark:text-green-400/70 mt-2">
                  {t("empty_overdue_desc")}
                </p>
              </div>
            )}
            {selectedTab === "approvals" && filteredApprovals.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900/30">
                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-6">
                  <FileCheck className="h-12 w-12 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400">{t("empty_approvals_title")}</h3>
                <p className="text-blue-600/70 dark:text-blue-400/70 mt-2">
                  {t("empty_approvals_desc")}
                </p>
              </div>
            )}
            {selectedTab === "alerts" && stats.totalAlerts === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-6">
                  <Bell className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t("empty_alerts_title")}</h3>
                <p className="text-slate-500 mt-2">
                  {t("empty_alerts_desc")}
                </p>
              </div>
            )}
          </div>
        )}
        {/* Modal de QR */}
        <QRViewerModal
          isOpen={qrModal.isOpen}
          onClose={() => setQrModal({ ...qrModal, isOpen: false })}
          qrValue={qrModal.value}
          title={`Acceso: ${qrModal.title}`}
          description="Presenta este código al personal de vigilancia para ingresar."
        />
      </div>
    );
  },
);

VigilancePanel.displayName = "VigilancePanel";
