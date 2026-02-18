import { AuditInfo } from "@libs/common";

export interface UserNotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface UserPreferences {
  language: string;
  theme: "light" | "dark" | "system";
  notifications: UserNotificationPreferences;
  timezone?: string;
}

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  language: "es",
  theme: "system",
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  timezone: "America/Bogota",
};

function normalizeUserPreferences(value: unknown): UserPreferences | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const sourceNotifications =
    typeof source.notifications === "object" && source.notifications !== null
      ? (source.notifications as Record<string, unknown>)
      : {};

  const themeCandidate = source.theme;
  const normalizedTheme =
    themeCandidate === "light" ||
    themeCandidate === "dark" ||
    themeCandidate === "system"
      ? themeCandidate
      : DEFAULT_USER_PREFERENCES.theme;

  return {
    language:
      typeof source.language === "string" && source.language.length > 0
        ? source.language
        : DEFAULT_USER_PREFERENCES.language,
    theme: normalizedTheme,
    timezone:
      typeof source.timezone === "string" && source.timezone.length > 0
        ? source.timezone
        : DEFAULT_USER_PREFERENCES.timezone,
    notifications: {
      email:
        typeof sourceNotifications.email === "boolean"
          ? sourceNotifications.email
          : DEFAULT_USER_PREFERENCES.notifications.email,
      push:
        typeof sourceNotifications.push === "boolean"
          ? sourceNotifications.push
          : DEFAULT_USER_PREFERENCES.notifications.push,
      sms:
        typeof sourceNotifications.sms === "boolean"
          ? sourceNotifications.sms
          : DEFAULT_USER_PREFERENCES.notifications.sms,
    },
  };
}

/**
 * User Domain Entity
 * Representa un usuario del sistema con sus roles y permisos
 */
export class UserEntity {
  constructor(
    public readonly id: string,
    public email: string,
    public password: string | undefined,
    public firstName: string,
    public lastName: string,
    public roles: string[],
    public permissions: string[],
    public isActive: boolean,
    public isEmailVerified: boolean,
    public ssoProvider?: string,
    public ssoProviderId?: string,
    public ssoEmail?: string,
    public ssoPhotoUrl?: string,
    public twoFactorEnabled?: boolean,
    public twoFactorSecret?: string,
    public twoFactorBackupCodes?: string[],
    public lastLogin?: Date,
    public passwordChangedAt?: Date,
    public audit?: AuditInfo,
    public username?: string,
    public isPhoneVerified?: boolean,
    public tenantId?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public phone?: string,
    public documentType?: string,
    public documentNumber?: string,
    public programId?: string,
    public coordinatedProgramId?: string,
    public preferences?: UserPreferences,
  ) {}

  /**
   * Obtener nombre completo del usuario
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  /**
   * Verificar si el usuario tiene todos los roles especificados
   */
  hasAllRoles(roles: string[]): boolean {
    return roles.every((role) => this.hasRole(role));
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  /**
   * Verificar si el usuario tiene alguno de los permisos especificados
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  /**
   * Verificar si el usuario tiene todos los permisos especificados
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission));
  }

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.hasRole("GENERAL_ADMIN");
  }

  /**
   * Agregar rol al usuario
   */
  addRole(role: string): void {
    if (!this.hasRole(role)) {
      this.roles.push(role);
    }
  }

  /**
   * Remover rol del usuario
   */
  removeRole(role: string): void {
    this.roles = this.roles.filter((r) => r !== role);
  }

  /**
   * Agregar permiso al usuario
   */
  addPermission(permission: string): void {
    if (!this.hasPermission(permission)) {
      this.permissions.push(permission);
    }
  }

  /**
   * Remover permiso del usuario
   */
  removePermission(permission: string): void {
    this.permissions = this.permissions.filter((p) => p !== permission);
  }

  /**
   * Activar usuario
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Desactivar usuario
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Verificar email
   */
  verifyEmail(): void {
    this.isEmailVerified = true;
  }

  /**
   * Actualizar último login
   */
  updateLastLogin(): void {
    this.lastLogin = new Date();
  }

  /**
   * Marcar cambio de contraseña
   */
  markPasswordChanged(): void {
    this.passwordChangedAt = new Date();
  }

  /**
   * Verificar si la cuenta está activa y verificada
   */
  canLogin(): boolean {
    return this.isActive && this.isEmailVerified;
  }

  /**
   * Verificar si el usuario es SSO
   */
  isSSOUser(): boolean {
    return !!this.ssoProvider && !!this.ssoProviderId;
  }

  /**
   * Verificar si el usuario usa un proveedor SSO específico
   */
  usesSSOProvider(provider: string): boolean {
    return this.ssoProvider === provider;
  }

  /**
   * Actualizar información SSO
   */
  updateSSOInfo(
    provider: string,
    providerId: string,
    email: string,
    photoUrl?: string,
  ): void {
    this.ssoProvider = provider;
    this.ssoProviderId = providerId;
    this.ssoEmail = email;
    if (photoUrl) {
      this.ssoPhotoUrl = photoUrl;
    }
  }

  /**
   * Verificar si el usuario tiene 2FA habilitado
   */
  has2FAEnabled(): boolean {
    return this.twoFactorEnabled === true;
  }

  /**
   * Habilitar 2FA
   */
  enable2FA(secret: string, backupCodes: string[]): void {
    this.twoFactorEnabled = true;
    this.twoFactorSecret = secret;
    this.twoFactorBackupCodes = backupCodes;
  }

  /**
   * Deshabilitar 2FA
   */
  disable2FA(): void {
    this.twoFactorEnabled = false;
    this.twoFactorSecret = undefined;
    this.twoFactorBackupCodes = [];
  }

  /**
   * Usar código de backup
   */
  useBackupCode(code: string): boolean {
    if (!this.twoFactorBackupCodes) return false;
    const index = this.twoFactorBackupCodes.indexOf(code);
    if (index > -1) {
      this.twoFactorBackupCodes.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Regenerar códigos de backup
   */
  regenerateBackupCodes(newCodes: string[]): void {
    this.twoFactorBackupCodes = newCodes;
  }

  /**
   * Convertir a objeto plano (para persistencia)
   */
  toObject(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      roles: this.roles,
      permissions: this.permissions,
      isActive: this.isActive,
      isEmailVerified: this.isEmailVerified,
      ssoProvider: this.ssoProvider,
      ssoProviderId: this.ssoProviderId,
      ssoEmail: this.ssoEmail,
      ssoPhotoUrl: this.ssoPhotoUrl,
      twoFactorEnabled: this.twoFactorEnabled,
      twoFactorSecret: this.twoFactorSecret,
      twoFactorBackupCodes: this.twoFactorBackupCodes,
      lastLogin: this.lastLogin,
      passwordChangedAt: this.passwordChangedAt,
      audit: this.audit,
      username: this.username,
      isPhoneVerified: this.isPhoneVerified,
      tenantId: this.tenantId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      phone: this.phone,
      documentType: this.documentType,
      documentNumber: this.documentNumber,
      programId: this.programId,
      coordinatedProgramId: this.coordinatedProgramId,
      preferences: this.preferences,
    };
  }

  /**
   * Crear desde objeto plano
   */
  static fromObject(data: any): UserEntity {
    return new UserEntity(
      data.id || data._id?.toString(),
      data.email,
      data.password,
      data.firstName,
      data.lastName,
      data.roles || [],
      data.permissions || [],
      data.isActive ?? true,
      data.isEmailVerified ?? false,
      data.ssoProvider,
      data.ssoProviderId,
      data.ssoEmail,
      data.ssoPhotoUrl,
      data.twoFactorEnabled ?? false,
      data.twoFactorSecret,
      data.twoFactorBackupCodes || [],
      data.lastLogin,
      data.passwordChangedAt,
      data.audit,
      data.username,
      data.isPhoneVerified ?? false,
      data.tenantId ?? "UFPS",
      data.createdAt,
      data.updatedAt,
      data.phone,
      data.documentType,
      data.documentNumber,
      data.programId,
      data.coordinatedProgramId,
      normalizeUserPreferences(data.preferences),
    );
  }
}
