/**
 * Tipos para Check-in/Check-out Digital
 */

export type CheckInOutType = "CHECK_IN" | "CHECK_OUT";

export type CheckInOutMethod =
  | "QR" // Escaneo de código QR
  | "MANUAL" // Registro manual por vigilancia
  | "AUTOMATIC" // Automático por sistema
  | "BIOMETRIC"; // Biométrico (huella/facial)

export type CheckInOutStatus = "SUCCESS" | "FAILED" | "PENDING" | "CANCELLED";

/**
 * Registro de check-in/check-out
 */
export interface CheckInOut {
  id: string;
  reservationId: string;
  approvalRequestId?: string;
  resourceId: string;
  userId: string;
  status: CheckInOutStatus;

  // Check-in fields
  checkInTime?: Date | string;
  checkInBy?: string;
  checkInType?: CheckInOutMethod;
  checkInNotes?: string;

  // Check-out fields
  checkOutTime?: Date | string;
  checkOutBy?: string;
  checkOutType?: CheckInOutMethod;
  checkOutNotes?: string;

  // Time tracking
  expectedReturnTime?: Date | string;
  actualReturnTime?: Date | string;

  // Resource condition
  resourceCondition?: {
    beforeCheckIn?: string;
    afterCheckOut?: string;
    damageReported?: boolean;
    damageDescription?: string;
  };

  // Metadata (incluye qrCode, location, deviceInfo, etc.)
  metadata?: {
    qrCode?: string;
    rfidTag?: string;
    location?: string;
    ipAddress?: string;
    deviceInfo?: string;
    photoUrl?: string;
    signature?: string;
    [key: string]: any;
  };

  // QR Code extraído de metadata para fácil acceso
  qrCode?: string;

  // Campos poblados desde Reservation
  reservationStartTime?: Date | string;
  reservationEndTime?: Date | string;

  // Campos poblados desde Resource
  resourceType?: string;
  resourceName?: string;

  // Campos poblados desde User
  userName?: string;
  userEmail?: string;

  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Datos del código QR
 */
export interface QRCodeData {
  reservationId: string;
  userId: string;
  approvalRequestId?: string;
  timestamp: string;
  expiresAt: string;
  hash: string; // Hash de seguridad
  version: string; // Versión del formato QR
}

/**
 * DTO para realizar check-in
 */
export interface CheckInDto {
  reservationId: string;
  method: CheckInOutMethod;
  qrCode?: string; // Datos del QR escaneado
  location?: string;
  notes?: string;
  photoBase64?: string; // Foto en Base64
  signatureBase64?: string; // Firma en Base64
  vigilantId?: string;
}

/**
 * DTO para realizar check-out
 */
export interface CheckOutDto {
  reservationId: string;
  checkInId: string; // ID del check-in correspondiente
  method: CheckInOutMethod;
  condition?: ResourceCondition;
  notes?: string;
  issues?: string[]; // Problemas reportados
  photoBase64?: string;
  signatureBase64?: string;
  vigilantId?: string;
}

/**
 * Condición del recurso al hacer check-out
 */
export type ResourceCondition =
  | "EXCELLENT" // Excelente
  | "GOOD" // Bueno
  | "FAIR" // Regular
  | "POOR" // Malo
  | "DAMAGED"; // Dañado

/**
 * Validación de check-in/check-out
 */
export interface CheckInOutValidation {
  isValid: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
  reason?: string;
  requiresApproval: boolean;
  requiresVigilance: boolean;
  timeWindow: {
    start: string;
    end: string;
    isWithinWindow: boolean;
  };
  warnings?: string[];
}

/**
 * Estado de vigilancia en tiempo real
 */
export interface VigilanceStatus {
  activeReservations: number;
  pendingCheckIns: number;
  pendingCheckOuts: number;
  lateCheckIns: number;
  issues: number;
  lastUpdate: string;
}

/**
 * Alerta de vigilancia
 */
export interface VigilanceAlert {
  id: string;
  type: VigilanceAlertType;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reservationId: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

/**
 * Tipos de alertas de vigilancia
 */
export type VigilanceAlertType =
  | "LATE_CHECK_IN" // Check-in tardío
  | "NO_CHECK_IN" // No se realizó check-in
  | "LATE_CHECK_OUT" // Check-out tardío
  | "NO_CHECK_OUT" // No se realizó check-out
  | "RESOURCE_ISSUE" // Problema con el recurso
  | "UNAUTHORIZED_ACCESS" // Acceso no autorizado
  | "SUSPICIOUS_ACTIVITY" // Actividad sospechosa
  | "EMERGENCY"; // Emergencia

/**
 * Panel de vigilancia - Vista de reserva activa
 */
export interface ActiveReservationView {
  reservationId: string;
  approvalRequestId?: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  userId: string;
  userName: string;
  userEmail?: string;
  startTime: string;
  endTime: string;
  status: "WAITING" | "CHECKED_IN" | "LATE" | "NO_SHOW" | "CHECKED_OUT";
  checkInId?: string;
  checkInTime?: string;
  checkOutId?: string;
  checkOutTime?: string;
  delayMinutes?: number;
  alerts?: VigilanceAlert[];
  qrCode: string;
  canCheckIn: boolean;
  canCheckOut: boolean;
}

/**
 * Estadísticas de check-in/check-out
 */
export interface CheckInOutStats {
  totalCheckIns: number;
  totalCheckOuts: number;
  onTimeCheckIns: number;
  lateCheckIns: number;
  missedCheckIns: number;
  averageDelayMinutes: number;
  complianceRate: number; // Porcentaje de check-ins/outs realizados
  byMethod: {
    qr: number;
    manual: number;
    automatic: number;
    biometric: number;
  };
  byResource: Record<string, number>;
  byUser: Record<string, number>;
}
