import {
  NotificationChannel,
  ReminderFrequency,
  ReminderType,
} from "@libs/common/enums";

/**
 * Reminder Configuration Entity
 * Entidad de dominio para configuración de recordatorios
 */
export class ReminderConfigurationEntity {
  constructor(
    public readonly id: string,
    public readonly type: ReminderType,
    public readonly enabled: boolean,
    public readonly channels: NotificationChannel[],
    public readonly frequency: ReminderFrequency,
    public readonly cronExpression?: string, // Para CUSTOM frequency
    public readonly triggerBeforeMinutes?: number, // Minutos antes del evento
    public readonly maxRetries?: number,
    public readonly messageTemplate?: string,
    public readonly metadata?: {
      targetRoles?: string[]; // Roles a notificar
      includeWeekends?: boolean;
      businessHoursOnly?: boolean;
      [key: string]: any;
    },
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Verifica si el recordatorio está activo
   */
  isActive(): boolean {
    return this.enabled;
  }

  /**
   * Verifica si usa expresión cron
   */
  useCron(): boolean {
    return this.frequency === ReminderFrequency.CUSTOM && !!this.cronExpression;
  }

  /**
   * Verifica si debe enviar en horario laboral
   */
  shouldSendInBusinessHours(): boolean {
    return this.metadata?.businessHoursOnly === true;
  }

  /**
   * Verifica si incluye fines de semana
   */
  includesWeekends(): boolean {
    return this.metadata?.includeWeekends !== false;
  }

  /**
   * Obtiene el intervalo en minutos
   */
  getIntervalMinutes(): number {
    switch (this.frequency) {
      case ReminderFrequency.HOURLY:
        return 60;
      case ReminderFrequency.DAILY:
        return 1440; // 24 horas
      case ReminderFrequency.ONCE:
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Activa el recordatorio
   */
  enable(): ReminderConfigurationEntity {
    return new ReminderConfigurationEntity(
      this.id,
      this.type,
      true,
      this.channels,
      this.frequency,
      this.cronExpression,
      this.triggerBeforeMinutes,
      this.maxRetries,
      this.messageTemplate,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Desactiva el recordatorio
   */
  disable(): ReminderConfigurationEntity {
    return new ReminderConfigurationEntity(
      this.id,
      this.type,
      false,
      this.channels,
      this.frequency,
      this.cronExpression,
      this.triggerBeforeMinutes,
      this.maxRetries,
      this.messageTemplate,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      type: this.type,
      enabled: this.enabled,
      channels: this.channels,
      frequency: this.frequency,
      cronExpression: this.cronExpression,
      triggerBeforeMinutes: this.triggerBeforeMinutes,
      maxRetries: this.maxRetries,
      messageTemplate: this.messageTemplate,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): ReminderConfigurationEntity {
    return new ReminderConfigurationEntity(
      obj.id || obj._id?.toString(),
      obj.type,
      obj.enabled,
      obj.channels,
      obj.frequency,
      obj.cronExpression,
      obj.triggerBeforeMinutes,
      obj.maxRetries,
      obj.messageTemplate,
      obj.metadata,
      obj.createdAt,
      obj.updatedAt
    );
  }

  /**
   * Crea configuración para recordatorio de aprobación pendiente
   */
  static createApprovalPendingReminder(
    channels: NotificationChannel[] = [NotificationChannel.EMAIL],
    triggerBeforeMinutes: number = 60
  ): Omit<ReminderConfigurationEntity, "id" | "createdAt" | "updatedAt"> {
    return {
      type: ReminderType.APPROVAL_PENDING,
      enabled: true,
      channels,
      frequency: ReminderFrequency.DAILY,
      triggerBeforeMinutes,
      maxRetries: 3,
      messageTemplate:
        "Tienes una solicitud de aprobación pendiente. Por favor revísala.",
      metadata: {
        targetRoles: ["approver", "admin"],
        businessHoursOnly: true,
      },
    } as any;
  }

  /**
   * Crea configuración para recordatorio de check-out
   */
  static createCheckOutReminder(
    channels: NotificationChannel[] = [
      NotificationChannel.EMAIL,
      NotificationChannel.SMS,
    ],
    triggerBeforeMinutes: number = 30
  ): Omit<ReminderConfigurationEntity, "id" | "createdAt" | "updatedAt"> {
    return {
      type: ReminderType.CHECK_OUT_REMINDER,
      enabled: true,
      channels,
      frequency: ReminderFrequency.ONCE,
      triggerBeforeMinutes,
      maxRetries: 1,
      messageTemplate:
        "Recuerda devolver el recurso reservado en {triggerBeforeMinutes} minutos.",
      metadata: {
        businessHoursOnly: false,
        includeWeekends: true,
      },
    } as any;
  }
}
