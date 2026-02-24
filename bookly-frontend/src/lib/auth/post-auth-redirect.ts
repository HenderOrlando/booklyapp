import { i18nConfig } from "@/i18n/config";

const CALLBACK_QUERY_KEYS = ["callback", "callbackUrl", "redirectTo"] as const;
const STATE_REDIRECT_KEYS = [
  "callback",
  "callbackUrl",
  "redirectTo",
  "targetPath",
  "path",
] as const;
const AUTH_ENTRY_BASE_PATHS = new Set(["/login", "/auth/callback"]);

export const POST_AUTH_REDIRECT_STORAGE_KEY = "postAuthRedirect";

interface ResolvePostAuthRedirectOptions {
  pathname: string;
  search?: string;
  oidcState?: unknown;
  storageRedirect?: string | null;
  origin?: string;
  locales?: readonly string[];
}

function normalizePath(pathname: string): string {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function stripLocalePrefix(pathname: string, locales: readonly string[]): string {
  const normalizedPath = normalizePath(pathname);
  const segments = normalizedPath.split("/").filter(Boolean);

  if (segments.length > 0 && locales.includes(segments[0])) {
    const pathWithoutLocale = `/${segments.slice(1).join("/")}`;
    return pathWithoutLocale === "/" ? "/" : pathWithoutLocale;
  }

  return normalizedPath;
}

function getLocaleFromPath(
  pathname: string,
  locales: readonly string[],
  defaultLocale: string,
): string {
  const normalizedPath = normalizePath(pathname);
  const [firstSegment] = normalizedPath.split("/").filter(Boolean);

  if (firstSegment && locales.includes(firstSegment)) {
    return firstSegment;
  }

  return defaultLocale;
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function decodeBase64Url(value: string): string | null {
  if (typeof atob !== "function") {
    return null;
  }

  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return atob(padded);
  } catch {
    return null;
  }
}

function extractRedirectFromStateObject(
  state: Record<string, unknown>,
): string | null {
  for (const key of STATE_REDIRECT_KEYS) {
    const value = state[key];
    if (typeof value === "string") {
      return value;
    }
  }

  const nestedRedirect = state.redirect;
  if (typeof nestedRedirect === "string") {
    return nestedRedirect;
  }

  if (nestedRedirect && typeof nestedRedirect === "object") {
    return extractRedirectFromStateObject(
      nestedRedirect as Record<string, unknown>,
    );
  }

  return null;
}

function extractRedirectFromState(state: unknown): string | null {
  if (!state) {
    return null;
  }

  if (typeof state === "object") {
    return extractRedirectFromStateObject(state as Record<string, unknown>);
  }

  if (typeof state !== "string") {
    return null;
  }

  const trimmedState = state.trim();
  if (!trimmedState) {
    return null;
  }

  if (trimmedState.startsWith("/")) {
    return trimmedState;
  }

  const candidates = [trimmedState];
  const uriDecoded = safeDecodeURIComponent(trimmedState);
  if (uriDecoded && uriDecoded !== trimmedState) {
    candidates.push(uriDecoded);
  }

  for (const candidate of candidates) {
    const parsedObject = safeJsonParse(candidate);
    if (parsedObject && typeof parsedObject === "object") {
      const redirectFromObject = extractRedirectFromStateObject(
        parsedObject as Record<string, unknown>,
      );
      if (redirectFromObject) {
        return redirectFromObject;
      }
    }

    if (candidate.startsWith("/")) {
      return candidate;
    }

    const decodedBase64 = decodeBase64Url(candidate);
    if (!decodedBase64) {
      continue;
    }

    if (decodedBase64.startsWith("/")) {
      return decodedBase64;
    }

    const parsedBase64Object = safeJsonParse(decodedBase64);
    if (parsedBase64Object && typeof parsedBase64Object === "object") {
      const redirectFromBase64Object = extractRedirectFromStateObject(
        parsedBase64Object as Record<string, unknown>,
      );
      if (redirectFromBase64Object) {
        return redirectFromBase64Object;
      }
    }
  }

  return null;
}

function sanitizeRedirectTarget(
  candidate: string | null,
  origin: string,
  locales: readonly string[],
): string | null {
  if (!candidate) {
    return null;
  }

  const trimmedCandidate = candidate.trim();
  if (!trimmedCandidate || trimmedCandidate.startsWith("//")) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmedCandidate, origin);
    if (parsedUrl.origin !== origin) {
      return null;
    }

    const targetPath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    if (!targetPath.startsWith("/") || targetPath.startsWith("//")) {
      return null;
    }

    if (isAuthEntryRoute(parsedUrl.pathname, locales)) {
      return null;
    }

    return targetPath;
  } catch {
    return null;
  }
}

export function resolveDashboardFallbackPath(
  pathname: string,
  locales: readonly string[] = i18nConfig.locales,
  defaultLocale: string = i18nConfig.defaultLocale,
): string {
  const locale = getLocaleFromPath(pathname, locales, defaultLocale);
  return `/${locale}/dashboard`;
}

export function isAuthEntryRoute(
  pathname: string,
  locales: readonly string[] = i18nConfig.locales,
): boolean {
  const pathWithoutLocale = stripLocalePrefix(pathname, locales);
  return AUTH_ENTRY_BASE_PATHS.has(pathWithoutLocale);
}

export function resolvePostAuthRedirect({
  pathname,
  search = "",
  oidcState,
  storageRedirect,
  origin = "http://localhost",
  locales = i18nConfig.locales,
}: ResolvePostAuthRedirectOptions): string | null {
  const searchParams = new URLSearchParams(search);

  const queryCandidates = CALLBACK_QUERY_KEYS.map((key) => searchParams.get(key));
  const stateCandidate = extractRedirectFromState(
    oidcState ?? searchParams.get("state"),
  );

  const candidates = [
    ...queryCandidates,
    stateCandidate,
    storageRedirect ?? null,
  ];

  for (const candidate of candidates) {
    const sanitized = sanitizeRedirectTarget(candidate, origin, locales);
    if (sanitized) {
      return sanitized;
    }
  }

  // pathname se mantiene como parámetro requerido para garantizar
  // la misma firma en login/callback aunque no existan candidatos.
  void pathname;

  return null;
}

export function persistPostAuthRedirect(path: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(POST_AUTH_REDIRECT_STORAGE_KEY, path);
}

export function readPostAuthRedirect(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY);
}

export function clearPostAuthRedirect(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(POST_AUTH_REDIRECT_STORAGE_KEY);
}

export function consumePostAuthRedirect(): string | null {
  const storedRedirect = readPostAuthRedirect();
  clearPostAuthRedirect();
  return storedRedirect;
}

export function capturePostAuthRedirectFromLocation(
  pathname: string,
  search: string,
  oidcState?: unknown,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const redirectTarget = resolvePostAuthRedirect({
    pathname,
    search,
    oidcState,
    origin: window.location.origin,
    locales: i18nConfig.locales,
  });

  if (redirectTarget) {
    persistPostAuthRedirect(redirectTarget);
  }
}
