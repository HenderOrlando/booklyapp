import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { i18nConfig } from "./config";

// Lista de namespaces que se cargarán dinámicamente
const namespaces = [
  "common",
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
];

export default getRequestConfig(async ({ locale }) => {
  // Validar que el locale solicitado sea válido
  if (!i18nConfig.locales.includes(locale as any)) notFound();

  // Cargar todos los archivos de traducción del locale
  const messages: Record<string, any> = {};

  for (const namespace of namespaces) {
    try {
      const namespaceMessages = (
        await import(`./translations/${locale}/${namespace}.json`)
      ).default;
      messages[namespace] = namespaceMessages;
    } catch (error) {
      console.warn(
        `Warning: Could not load translation file for namespace "${namespace}" in locale "${locale}"`,
        error
      );
    }
  }

  return {
    locale,
    messages,
  };
});
