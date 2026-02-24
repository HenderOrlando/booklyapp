import { ConfidentialClientApplication } from "@azure/msal-node";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
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
 * Microsoft OAuth Provider
 * Soporta Outlook Calendar integration y Azure AD SSO
 */
@Injectable()
export class MicrosoftOAuthProvider implements IOAuthProvider {
  readonly name = OAuthProvider.MICROSOFT;
  readonly purpose: OAuthPurpose;
  private readonly logger = new Logger(MicrosoftOAuthProvider.name);
  private readonly msalClient: ConfidentialClientApplication;
  private readonly scopes: string[];
  private readonly clientId: string;

  constructor(config: OAuthProviderConfig) {
    this.purpose = config.purpose;
    this.scopes = config.scopes;
    this.clientId = config.clientId;

    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: config.clientId,
        authority: "https://login.microsoftonline.com/common",
        clientSecret: config.clientSecret,
      },
    });

    this.logger.log(
      `Microsoft OAuth Provider initialized for ${config.purpose} with scopes: ${config.scopes.join(", ")}`
    );
  }

  /**
   * Generar URL de autorización
   */
  async getAuthorizationUrl(
    redirectUri: string
  ): Promise<OAuthAuthorizationResult> {
    const state = TokenEncryptionUtil.generateState();

    // Construir URL de autorización
    const authUrl =
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${this.clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_mode=query&` +
      `scope=${encodeURIComponent(this.scopes.join(" "))}&` +
      `state=${state}&` +
      `prompt=consent`; // Forzar obtención de refresh token

    return { url: authUrl, state };
  }

  /**
   * Intercambiar código por tokens
   */
  async exchangeCodeForTokens(
    request: OAuthCodeExchangeRequest
  ): Promise<OAuthTokens> {
    try {
      const tokenRequest = {
        code: request.code,
        scopes: this.scopes,
        redirectUri: request.redirectUri,
      };

      const response = await this.msalClient.acquireTokenByCode(tokenRequest);

      // MSAL no devuelve refresh token directamente en la respuesta
      // El refresh token se almacena internamente en el cache de MSAL
      this.logger.log("Token acquired successfully from Microsoft");

      return {
        accessToken: response.accessToken,
        refreshToken: "", // MSAL maneja refresh tokens internamente
        expiresAt: new Date(response.expiresOn!),
        scope: response.scopes?.join(" ") || this.scopes.join(" "),
        tokenType: response.tokenType || "Bearer",
      };
    } catch (error) {
      this.logger.error(`Error exchanging Microsoft code: ${error.message}`);
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
      // MSAL v2 usa acquireTokenSilent en lugar de acquireTokenByRefreshToken
      const response = await this.msalClient.acquireTokenSilent({
        scopes: this.scopes,
        account: null as any, // MSAL buscará en cache
      });

      return {
        accessToken: response.accessToken,
        refreshToken: request.refreshToken, // Mantener el mismo refresh token
        expiresAt: new Date(response.expiresOn!),
        scope: response.scopes?.join(" ") || this.scopes.join(" "),
        tokenType: response.tokenType || "Bearer",
      };
    } catch (error) {
      this.logger.error(
        `Error refreshing Microsoft token: ${error.message}`
      );
      throw new UnauthorizedException("Failed to refresh access token");
    }
  }

  /**
   * Obtener información del usuario
   */
  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    try {
      const fetch = (await import("node-fetch")).default;
      const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: any = await response.json();

      return {
        id: data.id,
        email: data.userPrincipalName || data.mail,
        name: data.displayName || undefined,
        firstName: data.givenName || undefined,
        lastName: data.surname || undefined,
      };
    } catch (error) {
      this.logger.error(
        `Error getting Microsoft user info: ${error.message}`
      );
      throw new UnauthorizedException("Failed to get user information");
    }
  }

  /**
   * Validar token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const fetch = (await import("node-fetch")).default;
      const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.ok;
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
      // Microsoft no tiene endpoint público de revocación de tokens
      // Los tokens expiran automáticamente
      this.logger.log(
        "Microsoft tokens expire automatically (no revocation endpoint)"
      );
    } catch (error) {
      this.logger.error(`Error revoking token: ${error.message}`);
      throw new UnauthorizedException("Failed to revoke token");
    }
  }
}
