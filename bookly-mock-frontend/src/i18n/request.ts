import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import type { AbstractIntlMessages } from "use-intl";
import { i18nConfig } from "./config";

type AppLocale = (typeof i18nConfig.locales)[number];

const isValidLocale = (value: string): value is AppLocale => {
  return i18nConfig.locales.includes(value as AppLocale);
};

// Lista de namespaces que se cargarán dinámicamente
const namespaces = [
  "common",
  "errors",
  "navigation",
  "reports_section",
  "dashboard",
  "auth",
  "resources",
  "reservations",
  "profile",
  "approvals",
  "calendar",
  "admin",
  "reports",
  "programs",
  "resource_detail",
  "characteristics",
  "categories",
  "maintenance",
  "check_in",
  "vigilance",
  "waitlist",
];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  // Validar que el locale solicitado sea válido
  if (!locale || !isValidLocale(locale)) {
    notFound();
  }

  // Cargar todos los archivos de traducción del locale
  const messages: AbstractIntlMessages = {};

  for (const namespace of namespaces) {
    try {
      const namespaceMessages = (
        await import(`./translations/${locale}/${namespace}.json`)
      ).default;
      messages[namespace] = namespaceMessages;
    } catch (error) {
      console.warn(
        `Warning: Could not load translation file for namespace "${namespace}" in locale "${locale}"`,
        error,
      );
    }
  }

  return {
    locale,
    messages,
  };
});
