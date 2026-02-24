import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { google } from "googleapis";
import {
  IOAuthProvider,
  OAuthAuthorizationResult,
  OAuthCodeExchangeRequest,
  OAuthProvider,
  OAuthProviderConfig,
  OAuthPurpose,
  OAuthRefreshTokenRequest,
  OAuthTokens,
  OAuthUserInfo,
} from "../interfaces/oauth.interface";
import { TokenEncryptionUtil } from "../utils/token-encryption.util";

/**
 * Google OAuth Provider
 * Soporta SSO y Calendar integration
 */
@Injectable()
export class GoogleOAuthProvider implements IOAuthProvider {
  readonly name = OAuthProvider.GOOGLE;
  readonly purpose: OAuthPurpose;
  private readonly logger = new Logger(GoogleOAuthProvider.name);
  private readonly oauth2Client: any;

  constructor(config: OAuthProviderConfig) {
    this.purpose = config.purpose;

    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    this.logger.log(
      `Google OAuth Provider initialized for ${config.purpose} with scopes: ${config.scopes.join(", ")}`
    );
  }

  /**
   * Generar URL de autorización
   */
  async getAuthorizationUrl(
    redirectUri: string
  ): Promise<OAuthAuthorizationResult> {
    this.oauth2Client.redirectUri = redirectUri;

    const state = TokenEncryptionUtil.generateState();

    // Scopes según propósito
    const scopes =
      this.purpose === OAuthPurpose.SSO
        ? ["email", "profile", "openid"]
        : [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
          ];

    const url = this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      state,
      prompt: "consent", // Forzar obtención de refresh token
      include_granted_scopes: true,
    });

    return { url, state };
  }

  /**
   * Intercambiar código por tokens
   */
  async exchangeCodeForTokens(
    request: OAuthCodeExchangeRequest
  ): Promise<OAuthTokens> {
    try {
      this.oauth2Client.redirectUri = request.redirectUri;

      const { tokens } = await this.oauth2Client.getToken(request.code);

      if (!tokens.refresh_token && this.purpose === OAuthPurpose.CALENDAR) {
        this.logger.warn(
          "No refresh token received. User must re-authorize with prompt=consent."
        );
      }

      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || "",
        expiresAt: new Date(tokens.expiry_date!),
        scope: tokens.scope,
        tokenType: tokens.token_type,
      };
    } catch (error) {
      this.logger.error(`Error exchanging Google code: ${error.message}`);
      throw new UnauthorizedException("Failed to exchange authorization code");
    }
  }

  /**
   * Refrescar access token
   */
  async refreshAccessToken(
    request: OAuthRefreshTokenRequest
  ): Promise<OAuthTokens> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: request.refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      return {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token || request.refreshToken,
        expiresAt: new Date(credentials.expiry_date!),
        scope: credentials.scope,
        tokenType: credentials.token_type,
      };
    } catch (error) {
      this.logger.error(`Error refreshing Google token: ${error.message}`);
      throw new UnauthorizedException("Failed to refresh access token");
    }
  }

  /**
   * Obtener información del usuario
   */
  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken,
      });

      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: "v2",
      });

      const { data } = await oauth2.userinfo.get();

      return {
        id: data.id!,
        email: data.email!,
        name: data.name || undefined,
        firstName: data.given_name || undefined,
        lastName: data.family_name || undefined,
        photoUrl: data.picture || undefined,
      };
    } catch (error) {
      this.logger.error(`Error getting Google user info: ${error.message}`);
      throw new UnauthorizedException("Failed to get user information");
    }
  }

  /**
   * Validar token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: "v2",
      });

      this.oauth2Client.setCredentials({
        access_token: accessToken,
      });

      await oauth2.tokeninfo({ access_token: accessToken });
      return true;
    } catch (error) {
      this.logger.debug(`Token validation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Revocar token
   */
  async revokeToken(token: string): Promise<void> {
    try {
      await this.oauth2Client.revokeToken(token);
      this.logger.log("Token revoked successfully");
    } catch (error) {
      this.logger.error(`Error revoking token: ${error.message}`);
      throw new UnauthorizedException("Failed to revoke token");
    }
  }
}
