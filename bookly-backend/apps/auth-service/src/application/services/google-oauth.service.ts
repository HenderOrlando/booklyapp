import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleOAuthProvider, OAuthPurpose } from "@auth/modules/oauth";

/**
 * Google OAuth Service para auth-service
 * Usa GoogleOAuthProvider de libs/oauth internamente
 * Mantiene compatibilidad con passport-google-oauth20
 */
@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);
  private readonly googleProvider: GoogleOAuthProvider;

  constructor(private readonly configService: ConfigService) {
    // Configurar provider desde libs/oauth
    this.googleProvider = new GoogleOAuthProvider({
      clientId: this.configService.get<string>("GOOGLE_CLIENT_ID")!,
      clientSecret: this.configService.get<string>("GOOGLE_CLIENT_SECRET")!,
      redirectUri:
        this.configService.get<string>("GOOGLE_CALLBACK_URL") ||
        "http://localhost:3001/api/auth/oauth/google/callback",
      scopes: ["email", "profile", "openid"],
      purpose: OAuthPurpose.SSO,
    });

    this.logger.log("Google OAuth Service initialized for SSO");
  }

  /**
   * Obtener provider subyacente
   */
  getProvider(): GoogleOAuthProvider {
    return this.googleProvider;
  }

  /**
   * Generar URL de autorización
   */
  async getAuthorizationUrl(redirectUri?: string) {
    return this.googleProvider.getAuthorizationUrl(
      redirectUri ||
        this.configService.get<string>("GOOGLE_CALLBACK_URL") ||
        "http://localhost:3001/api/auth/oauth/google/callback"
    );
  }

  /**
   * Intercambiar código por tokens
   */
  async exchangeCodeForTokens(code: string, redirectUri?: string) {
    return this.googleProvider.exchangeCodeForTokens({
      code,
      redirectUri:
        redirectUri ||
        this.configService.get<string>("GOOGLE_CALLBACK_URL") ||
        "http://localhost:3001/api/auth/oauth/google/callback",
    });
  }

  /**
   * Obtener información del usuario
   */
  async getUserInfo(accessToken: string) {
    return this.googleProvider.getUserInfo(accessToken);
  }

  /**
   * Validar token
   */
  async validateToken(accessToken: string) {
    return this.googleProvider.validateToken(accessToken);
  }

  /**
   * Refrescar token
   */
  async refreshAccessToken(refreshToken: string) {
    return this.googleProvider.refreshAccessToken({ refreshToken });
  }

  /**
   * Revocar token
   */
  async revokeToken(token: string) {
    return this.googleProvider.revokeToken(token);
  }
}
