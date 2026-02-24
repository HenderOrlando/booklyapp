/**
 * Configuración de internacionalización (i18n)
 * Soporta español e inglés
 */

export const i18nConfig = {
  locales: ["es", "en"],
  defaultLocale: "es",
  localeDetection: false,
} as const;

export type Locale = (typeof i18nConfig.locales)[number];
