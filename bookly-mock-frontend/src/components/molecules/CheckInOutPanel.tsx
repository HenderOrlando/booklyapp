import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { CheckInButton } from "@/components/atoms/CheckInButton";
import { CheckOutButton } from "@/components/atoms/CheckOutButton";
import { QRCodeDisplay } from "@/components/atoms/QRCodeDisplay";
import type { CheckInOutValidation } from "@/types/entities/checkInOut";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import * as React from "react";

/**
 * CheckInOutPanel - Molecule Component
 *
 * Panel que combina check-in y check-out con validación,
 * código QR y feedback visual del estado.
 *
 * @example
 * ```tsx
 * <CheckInOutPanel
 *   reservationId="res_123"
 *   validation={validationData}
 *   onCheckIn={handleCheckIn}
 *   onCheckOut={handleCheckOut}
 * />
 * ```
 */

export interface CheckInOutPanelProps {
  /** ID de la reserva */
  reservationId: string;
  /** Validación de check-in/out */
  validation: CheckInOutValidation;
  /** Handler para check-in */
  onCheckIn?: () => void;
  /** Handler para check-out */
  onCheckOut?: () => void;
  /** Código QR para la reserva */
  qrCode?: string;
  /** Estado de carga */
  loading?: boolean;
  /** Información de check-in existente */
  checkInInfo?: {
    timestamp: string;
    method: string;
  };
  /** Clase CSS adicional */
  className?: string;
}

export const CheckInOutPanel = React.memo<CheckInOutPanelProps>(
  ({
    reservationId,
    validation,
    onCheckIn,
    onCheckOut,
    qrCode,
    loading = false,
    checkInInfo,
    className = "",
  }) => {
    const { canCheckIn, canCheckOut, reason, timeWindow, warnings } =
      validation;

    // Determinar el estado visual
    const getStatusInfo = () => {
      if (checkInInfo) {
        return {
          icon: CheckCircle,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          title: "Check-in realizado",
          message: `Registrado el ${format(
            new Date(checkInInfo.timestamp),
            "d 'de' MMM 'a las' HH:mm",
            { locale: es }
          )}`,
        };
      }

      if (!validation.isValid) {
        return {
          icon: XCircle,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          title: "No disponible",
          message: reason || "La reserva no está disponible para registro",
        };
      }

      if (!timeWindow.isWithinWindow) {
        return {
          icon: Clock,
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          title: "Fuera de horario",
          message: `Disponible desde ${format(
            new Date(timeWindow.start),
            "HH:mm"
          )} hasta ${format(new Date(timeWindow.end), "HH:mm")}`,
        };
      }

      return {
        icon: CheckCircle,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        title: "Listo para registro",
        message: "Puede realizar el check-in ahora",
      };
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Control de Acceso</CardTitle>
          <CardDescription>Registro de entrada y salida</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Estado actual */}
          <div
            className={`flex items-start gap-3 p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}
          >
            <StatusIcon
              className={`h-5 w-5 ${statusInfo.color} flex-shrink-0 mt-0.5`}
            />
            <div className="flex-1">
              <h4 className={`font-semibold text-sm ${statusInfo.color}`}>
                {statusInfo.title}
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {statusInfo.message}
              </p>
            </div>
          </div>

          {/* Advertencias */}
          {warnings && warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((warning, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Código QR */}
          {qrCode && (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Escanea el código QR
              </p>
              <QRCodeDisplay
                value={qrCode}
                size={200}
                includeMargin={true}
                className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
                El código QR puede ser escaneado por el personal de vigilancia
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {onCheckIn && (
              <CheckInButton
                onClick={onCheckIn}
                disabled={!canCheckIn || loading || !!checkInInfo}
                loading={loading}
                className="flex-1"
              >
                {checkInInfo ? "Ya registrado" : "Check-in"}
              </CheckInButton>
            )}

            {onCheckOut && (
              <CheckOutButton
                onClick={onCheckOut}
                disabled={!canCheckOut || loading || !checkInInfo}
                loading={loading}
                className="flex-1"
              >
                Check-out
              </CheckOutButton>
            )}
          </div>

          {/* Información de requisitos */}
          {validation.requiresApproval && (
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              Esta reserva requiere aprobación previa
            </p>
          )}
          {validation.requiresVigilance && (
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              El registro debe ser validado por vigilancia
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
);

CheckInOutPanel.displayName = "CheckInOutPanel";
