import { DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  OAuthProvider,
  OAuthProviderConfig,
  OAuthPurpose,
} from "./interfaces/oauth.interface";
import { GoogleOAuthProvider } from "./providers/google-oauth.provider";
import { MicrosoftOAuthProvider } from "./providers/microsoft-oauth.provider";

/**
 * OAuth Module en auth-service
 * Proporciona providers OAuth para SSO y Calendar integration
 *
 * MIGRADO desde @libs/oauth para resolver errores ESM
 */
@Module({})
export class OAuthModule {
  /**
   * Configurar módulo OAuth con providers específicos
   */
  static forRoot(options: {
    providers: Array<{
      provider: OAuthProvider;
      purpose: OAuthPurpose;
      configPrefix?: string; // Prefijo de env vars (e.g., "GOOGLE_SSO" vs "GOOGLE_CALENDAR")
    }>;
  }): DynamicModule {
    const providers = options.providers.map((providerConfig) => {
      const prefix =
        providerConfig.configPrefix || providerConfig.provider.toUpperCase();

      return {
        provide: `${providerConfig.provider}_${providerConfig.purpose}`,
        useFactory: (configService: ConfigService) => {
          const config: OAuthProviderConfig = {
            clientId: configService.get<string>(`${prefix}_CLIENT_ID`)!,
            clientSecret: configService.get<string>(`${prefix}_CLIENT_SECRET`)!,
            redirectUri: configService.get<string>(`${prefix}_REDIRECT_URI`)!,
            scopes: OAuthModule.getDefaultScopes(
              providerConfig.provider,
              providerConfig.purpose
            ),
            purpose: providerConfig.purpose,
          };

          return OAuthModule.createProvider(providerConfig.provider, config);
        },
        inject: [ConfigService],
      };
    });

    return {
      module: OAuthModule,
      providers,
      exports: providers.map((p) => p.provide),
      global: false,
    };
  }

  /**
   * Configurar módulo OAuth con factory async
   */
  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) => Promise<OAuthProviderConfig[]> | OAuthProviderConfig[];
    inject?: any[];
  }): DynamicModule {
    const provider = {
      provide: "OAUTH_PROVIDERS",
      useFactory: async (...args: any[]) => {
        const configs = await options.useFactory(...args);
        return configs.map((config) =>
          OAuthModule.createProvider(OAuthProvider.GOOGLE, config)
        );
      },
      inject: options.inject || [],
    };

    return {
      module: OAuthModule,
      providers: [provider],
      exports: [provider],
      global: false,
    };
  }

  /**
   * Crear instancia de provider según tipo
   */
  private static createProvider(
    provider: OAuthProvider,
    config: OAuthProviderConfig
  ) {
    switch (provider) {
      case OAuthProvider.GOOGLE:
        return new GoogleOAuthProvider(config);
      case OAuthProvider.MICROSOFT:
      case OAuthProvider.OUTLOOK:
        return new MicrosoftOAuthProvider(config);
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  /**
   * Obtener scopes por defecto según provider y propósito
   */
  private static getDefaultScopes(
    provider: OAuthProvider,
    purpose: OAuthPurpose
  ): string[] {
    if (provider === OAuthProvider.GOOGLE) {
      return purpose === OAuthPurpose.SSO
        ? ["email", "profile", "openid"]
        : [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
          ];
    }

    if (
      provider === OAuthProvider.MICROSOFT ||
      provider === OAuthProvider.OUTLOOK
    ) {
      return purpose === OAuthPurpose.SSO
        ? ["openid", "profile", "email"]
        : ["offline_access", "Calendars.ReadWrite", "User.Read"];
    }

    return [];
  }
}
