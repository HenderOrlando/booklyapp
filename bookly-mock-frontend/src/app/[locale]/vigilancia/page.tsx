"use client";

import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { VigilancePanel } from "@/components/organisms/VigilancePanel";
import { MainLayout } from "@/components/templates/MainLayout";
import type {
  ActiveReservationView,
  CheckInOutStats,
  VigilanceAlert,
} from "@/types/entities/checkInOut";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Shield } from "lucide-react";
import * as React from "react";

/**
 * Página de Vigilancia - /vigilancia
 *
 * Panel de control en tiempo real para personal de vigilancia.
 * Muestra reservas activas, con retraso y alertas.
 * Implementa RF-23 (Pantalla de vigilancia).
 */

// Mock data temporal
const getMockVigilanceData = (): {
  active: ActiveReservationView[];
  overdue: ActiveReservationView[];
  alerts: VigilanceAlert[];
  stats: CheckInOutStats;
} => ({
  active: [
    {
      reservationId: "res_001",
      approvalRequestId: "apr_001",
      resourceId: "resource_001",
      resourceName: "Auditorio Principal",
      resourceType: "Auditorio",
      userId: "user_001",
      userName: "Carlos Rodríguez",
      userEmail: "carlos@ufps.edu.co",
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Comenzó hace 30 min
      endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // Termina en 90 min
      status: "CHECKED_IN",
      checkInId: "checkin_001",
      checkInTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      qrCode: "QR_RES_001",
      canCheckIn: false,
      canCheckOut: true,
    },
    {
      reservationId: "res_002",
      resourceId: "resource_002",
      resourceName: "Sala de Reuniones B",
      resourceType: "Sala",
      userId: "user_002",
      userName: "María González",
      userEmail: "maria@ufps.edu.co",
      startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      status: "CHECKED_IN",
      checkInId: "checkin_002",
      checkInTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      qrCode: "QR_RES_002",
      canCheckIn: false,
      canCheckOut: true,
    },
  ],
  overdue: [
    {
      reservationId: "res_003",
      resourceId: "resource_003",
      resourceName: "Laboratorio de Cómputo 3",
      resourceType: "Laboratorio",
      userId: "user_003",
      userName: "Jorge Martínez",
      userEmail: "jorge@ufps.edu.co",
      startTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // Comenzó hace 20 min
      endTime: new Date(Date.now() + 40 * 60 * 1000).toISOString(),
      status: "LATE",
      qrCode: "QR_RES_003",
      canCheckIn: true,
      canCheckOut: false,
    },
    {
      reservationId: "res_004",
      resourceId: "resource_004",
      resourceName: "Sala de Conferencias A",
      resourceType: "Sala",
      userId: "user_004",
      userName: "Ana López",
      userEmail: "ana@ufps.edu.co",
      startTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
      status: "LATE",
      qrCode: "QR_RES_004",
      canCheckIn: true,
      canCheckOut: false,
    },
  ],
  alerts: [
    {
      id: "alert_001",
      type: "NO_CHECK_IN",
      severity: "HIGH",
      reservationId: "res_003",
      resourceId: "resource_003",
      resourceName: "Laboratorio de Cómputo 3",
      userId: "user_003",
      userName: "Jorge Martínez",
      message:
        "El usuario no ha realizado check-in después de 20 minutos del inicio.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isResolved: false,
    },
    {
      id: "alert_002",
      type: "LATE_CHECK_IN",
      severity: "MEDIUM",
      reservationId: "res_004",
      resourceId: "resource_004",
      resourceName: "Sala de Conferencias A",
      userId: "user_004",
      userName: "Ana López",
      message: "Check-in realizado con 15 minutos de retraso.",
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      isResolved: false,
    },
  ],
  stats: {
    totalCheckIns: 45,
    totalCheckOuts: 42,
    onTimeCheckIns: 38,
    lateCheckIns: 5,
    missedCheckIns: 2,
    averageDelayMinutes: 12,
    complianceRate: 95.5,
    byMethod: {
      qr: 30,
      manual: 12,
      automatic: 0,
      biometric: 3,
    },
    byResource: {},
    byUser: {},
  },
});

export default function VigilanciaPage() {
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  // Query con auto-refresh cada 30 segundos
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["vigilance-data"],
    queryFn: async () => getMockVigilanceData(),
    refetchInterval: autoRefresh ? 30000 : false, // 30 segundos
    staleTime: 10000, // 10 segundos
  });

  const handleContact = (reservationId: string) => {
    console.log("Contactar reserva:", reservationId);
    // TODO: Implementar sistema de contacto (llamada, email, SMS)
    alert(`Contactando usuario de reserva: ${reservationId}`);
  };

  const handleResolveAlert = (alertId: string) => {
    console.log("Resolver alerta:", alertId);
    // TODO: Implementar con mutation
    alert(`Alerta ${alertId} marcada como resuelta`);
  };

  const handleManualRefresh = () => {
    refetch();
  };

  return (
    <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Panel de Vigilancia
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Monitor en tiempo real de reservas y accesos
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle auto-refresh */}
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-[var(--color-primary-base)] focus:ring-[var(--color-primary-base)]"
              />
              Auto-actualizar (30s)
            </label>

            {/* Manual refresh */}
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary-base)] rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {data?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Activos Ahora
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.active.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Check-ins Hoy
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.stats.totalCheckIns}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Retrasos
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {data.stats.lateCheckIns}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ausencias
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {data.overdue.length}
              </p>
            </div>
          </div>
        )}

        {/* Panel principal */}
        {data && (
          <VigilancePanel
            activeReservations={data.active}
            overdueReservations={data.overdue}
            alerts={data.alerts}
            onContact={handleContact}
            onResolveAlert={handleResolveAlert}
            loading={isLoading}
          />
        )}

        {/* Última actualización */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          Última actualización:{" "}
          {new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      </div>
    </MainLayout>
  );
}
