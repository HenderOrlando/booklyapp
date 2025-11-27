/**
 * Tipos de entidad User basados en Auth Service
 */

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phoneNumber?: string;
  documentType?: string;
  documentNumber?: string;
  profilePicture?: string;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  roles: Role[];
  permissions: Permission[];
  preferences?: UserPreferences;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  isSystem: boolean;
}

export interface UserPreferences {
  language: string;
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  timezone?: string;
}

// DTOs para creación y actualización
export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  documentType?: string;
  documentNumber?: string;
  roleIds?: string[];
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  documentType?: string;
  documentNumber?: string;
  profilePicture?: string;
  status?: UserStatus;
  preferences?: Partial<UserPreferences>;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
