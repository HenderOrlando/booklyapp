import { AppConfigurationService } from "@auth/application/services/app-configuration.service";
import { AuthService } from "@auth/application/services/auth.service";
import { createLogger } from "@libs/common";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";

const logger = createLogger("GoogleStrategy");

/**
 * Google OAuth2 Strategy
 * Implementa autenticación SSO con Google Workspace
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private readonly authService: AuthService,
    private readonly appConfigService: AppConfigurationService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3001/api/auth/oauth/google/callback",
      scope: ["email", "profile"],
      passReqToCallback: false,
    });

    // Advertir si no están configuradas las credenciales reales
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      logger.warn(
        "Google OAuth credentials not configured. SSO will not work properly.",
      );
    }
  }

  /**
   * Validar usuario de Google y crear/actualizar en BD
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      // Verificar si SSO corporativo está habilitado en AppConfiguration
      const corporateAuthEnabled =
        await this.appConfigService.isCorporateAuthEnabled();
      if (!corporateAuthEnabled) {
        throw new UnauthorizedException(
          "Corporate SSO authentication is currently disabled. Contact your administrator.",
        );
      }

      const { id, emails, name, photos } = profile;

      if (!emails || emails.length === 0) {
        throw new UnauthorizedException("No email found in Google profile");
      }

      const email = emails[0].value;
      const firstName = name?.givenName || "";
      const lastName = name?.familyName || "";
      const photoUrl =
        photos && photos.length > 0 ? photos[0].value : undefined;

      // Verificar dominio permitido desde AppConfiguration (fallback a env vars)
      const allowedDomains = await this.appConfigService.getAllowedDomains();
      const emailDomain = email.split("@")[1];

      if (!allowedDomains.includes(emailDomain)) {
        throw new UnauthorizedException(
          `Domain ${emailDomain} is not allowed. Only ${allowedDomains.join(", ")} are permitted.`,
        );
      }

      // Autenticar o crear usuario SSO
      const user = await this.authService.validateOrCreateSSOUser({
        ssoProvider: "google",
        ssoProviderId: id,
        email,
        firstName,
        lastName,
        ssoEmail: email,
        ssoPhotoUrl: photoUrl,
      });

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
