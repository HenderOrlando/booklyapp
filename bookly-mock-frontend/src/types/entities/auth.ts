/**
 * Tipos de autenticación basados en Auth Service
 */

import { User } from "./user";

// Re-exportar User para facilitar imports
export type { User };

export interface LoginDto {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  documentType?: string;
  documentNumber?: string;
}

export interface LoginResponse {
  requiresTwoFactor: boolean;
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface VerifyTwoFactorDto {
  code: string;
  userId: string;
}

export interface GoogleAuthDto {
  credential: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}
