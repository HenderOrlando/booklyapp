import { extractMappedError } from "@/infrastructure/http/errorMapper";

type TranslateFn = {
  (key: string): string;
  has?: (key: string) => boolean;
};

export type ErrorTranslator = TranslateFn;

function tryTranslate(
  translate: TranslateFn | undefined,
  key: string,
): string | null {
  if (!translate) {
    return null;
  }

  if (typeof translate.has === "function" && !translate.has(key)) {
    return null;
  }

  try {
    return translate(key);
  } catch {
    return null;
  }
}

export function resolveErrorMessage(
  error: unknown,
  translate?: TranslateFn,
): string {
  const directMessage =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";

  const mapped =
    typeof error === "object" && error !== null && "mapped" in error
      ? (error as { mapped?: ReturnType<typeof extractMappedError> }).mapped
      : undefined;

  const resolved = mapped ?? extractMappedError(error);

  const namespaceScopedKey = resolved.i18nKey.startsWith("errors.")
    ? resolved.i18nKey.replace(/^errors\./, "")
    : resolved.i18nKey;

  const moduleFallbackKey = `${namespaceScopedKey.split(".")[0]}.default`;

  const translatedMapped = tryTranslate(translate, resolved.i18nKey);
  if (translatedMapped) {
    return translatedMapped;
  }

  const translatedScoped = tryTranslate(translate, namespaceScopedKey);
  if (translatedScoped) {
    return translatedScoped;
  }

  const translatedModuleFallback = tryTranslate(translate, moduleFallbackKey);
  if (translatedModuleFallback) {
    return translatedModuleFallback;
  }

  const translatedGeneric = tryTranslate(translate, "errors.generic.unknown");
  const translatedScopedGeneric = tryTranslate(translate, "generic.unknown");

  return (
    resolved.fallbackMessage ||
    directMessage ||
    translatedGeneric ||
    translatedScopedGeneric ||
    "Error desconocido"
  );
}
