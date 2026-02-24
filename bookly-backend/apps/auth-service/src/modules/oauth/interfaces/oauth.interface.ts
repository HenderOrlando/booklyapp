/**
 * Interfaces compartidas para OAuth providers
 */

/**
 * Proveedor OAuth soportado
 */
export enum OAuthProvider {
  GOOGLE = "google",
  MICROSOFT = "microsoft",
  OUTLOOK = "outlook", // Alias para Microsoft
}

/**
 * Propósito del OAuth
 */
export enum OAuthPurpose {
  SSO = "sso", // Single Sign-On (auth-service)
  CALENDAR = "calendar", // Integración de calendarios (availability-service)
}

/**
 * Tokens OAuth
 */
export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope?: string;
  tokenType?: string;
}

/**
 * Información de usuario OAuth
 */
export interface OAuthUserInfo {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

/**
 * Configuración de OAuth provider
 */
export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  purpose: OAuthPurpose;
}

/**
 * Resultado de autorización OAuth
 */
export interface OAuthAuthorizationResult {
  url: string;
  state: string;
  codeVerifier?: string; // Para PKCE
}

/**
 * Request para intercambio de código
 */
export interface OAuthCodeExchangeRequest {
  code: string;
  redirectUri: string;
  codeVerifier?: string; // Para PKCE
}

/**
 * Request para refresh de token
 */
export interface OAuthRefreshTokenRequest {
  refreshToken: string;
}

/**
 * Interfaz base para OAuth providers
 */
export interface IOAuthProvider {
  /**
   * Nombre del provider
   */
  readonly name: OAuthProvider;

  /**
   * Propósito del provider
   */
  readonly purpose: OAuthPurpose;

  /**
   * Generar URL de autorización
   */
  getAuthorizationUrl(redirectUri: string): Promise<OAuthAuthorizationResult>;

  /**
   * Intercambiar código por tokens
   */
  exchangeCodeForTokens(
    request: OAuthCodeExchangeRequest
  ): Promise<OAuthTokens>;

  /**
   * Refrescar access token
   */
  refreshAccessToken(request: OAuthRefreshTokenRequest): Promise<OAuthTokens>;

  /**
   * Obtener información del usuario
   */
  getUserInfo(accessToken: string): Promise<OAuthUserInfo>;

  /**
   * Validar token
   */
  validateToken(accessToken: string): Promise<boolean>;

  /**
   * Revocar token
   */
  revokeToken(token: string): Promise<void>;
}
