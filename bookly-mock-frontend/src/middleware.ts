import { i18nConfig } from "@/i18n/config";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(i18nConfig);

// Rutas que requieren autenticación
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/recursos",
  "/categorias",
  "/mantenimientos",
  "/programas",
  "/reservas",
  "/calendario",
  "/lista-espera",
  "/aprobaciones",
  "/vigilancia",
  "/historial-aprobaciones",
  "/check-in",
  "/reportes",
  "/admin/templates",
  "/admin/roles",
  "/admin/auditoria",
];

export default function middleware(request: NextRequest) {
  // 1. Ejecutar middleware de internacionalización
  const response = intlMiddleware(request);

  // Si es una redirección (ej: / -> /es), retornar inmediatamente
  if (response.headers.get("Location")) {
    return response;
  }

  // 2. Verificar autenticación
  const { pathname } = request.nextUrl;

  // Remover el prefijo de idioma para verificar la ruta base
  // Soporta /es, /en, etc. definidos en config
  const localesPattern = `^/(${i18nConfig.locales.join("|")})`;
  const pathnameWithoutLocale =
    pathname.replace(new RegExp(localesPattern), "") || "/";

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(`${route}/`),
  );

  if (isProtectedRoute) {
    // Verificar si hay token en las cookies
    const token = request.cookies.get("accessToken")?.value;

    // Si no hay token, redirigir al login
    if (!token) {
      // Redirigir al login manteniendo el locale actual
      const locale = pathname.split("/")[1]; // es o en
      const loginUrl = new URL(`/${locale}/login`, request.url);
      const requestedPath = `${pathname}${request.nextUrl.search}`;
      loginUrl.searchParams.set("callback", requestedPath);
      loginUrl.searchParams.set("callbackUrl", requestedPath);
      return NextResponse.redirect(loginUrl);
    }

    // NOTA: La protección por roles se maneja en tres capas:
    // 1. UI: AppSidebar oculta opciones según rol del usuario
    // 2. Backend: Cada endpoint verifica permisos (capa principal de seguridad)
    // 3. Middleware: Verifica autenticación básica (token presente)
    //
    // La verificación de roles específicos NO se hace en middleware porque:
    // - Requeriría decodificar JWT en cada request (overhead)
    // - Backend ya valida permisos correctamente
    // - UI ya oculta opciones no autorizadas
    //
    // Si se necesita agregar verificación de roles en middleware:
    // 1. Instalar: npm install jsonwebtoken @types/jsonwebtoken
    // 2. Decodificar token: const decoded = jwt.decode(token)
    // 3. Validar roles: if (!decoded?.roles?.includes('admin')) { redirect }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
