"use client";

import { useToast } from "@/hooks/useToast";
import { i18nConfig } from "@/i18n/config";
import { AuthClient } from "@/infrastructure/api/auth-client";
import {
  type ErrorTranslator,
  resolveErrorMessage,
} from "@/infrastructure/http/errorMessageResolver";
import {
  clearPostAuthRedirect,
  consumePostAuthRedirect,
  isAuthEntryRoute,
  resolveDashboardFallbackPath,
  resolvePostAuthRedirect,
} from "@/lib/auth/post-auth-redirect";
import { User } from "@/types/entities/auth";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// Configuración de timeouts (en milisegundos)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos de inactividad
const SESSION_WARNING_TIME = 5 * 60 * 1000; // Avisar 5 minutos antes
const REFRESH_TOKEN_INTERVAL = 10 * 60 * 1000; // Refresh cada 10 minutos
const POST_AUTH_REDIRECT_RETRY_DELAY = 220;
const POST_AUTH_REDIRECT_MAX_RETRIES = 2;

interface TokenRefreshPayload {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
}

interface AuthContextHttpError {
  message?: string;
  code?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
}

function toAuthContextHttpError(error: unknown): AuthContextHttpError {
  if (typeof error === "object" && error !== null) {
    return error as AuthContextHttpError;
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: String(error) };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const { showError, showWarning, showSuccess, showInfo } = useToast();

  // Referencias para timers
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const checkAuthRetryRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const lastValidUserRef = useRef<User | null>(null);
  const postAuthRedirectHandledRef = useRef(false);
  const postAuthRedirectRetryRef = useRef<NodeJS.Timeout | null>(null);
  const postAuthRedirectRetryCountRef = useRef(0);

  const navigateToPostAuthDestination = useCallback(() => {
    if (postAuthRedirectHandledRef.current) {
      return;
    }

    const currentPath =
      typeof window !== "undefined"
        ? window.location.pathname
        : `/${i18nConfig.defaultLocale}/login`;

    const fallbackPath = resolveDashboardFallbackPath(
      currentPath,
      i18nConfig.locales,
      i18nConfig.defaultLocale,
    );

    const destination =
      typeof window !== "undefined"
        ? (resolvePostAuthRedirect({
            pathname: currentPath,
            search: window.location.search,
            storageRedirect: consumePostAuthRedirect(),
            origin: window.location.origin,
            locales: i18nConfig.locales,
          }) ?? fallbackPath)
        : fallbackPath;

    postAuthRedirectHandledRef.current = true;
    clearPostAuthRedirect();
    router.replace(destination);
  }, [router]);

  const schedulePostAuthRedirectRetry = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (postAuthRedirectRetryRef.current) {
      clearTimeout(postAuthRedirectRetryRef.current);
    }

    postAuthRedirectRetryRef.current = setTimeout(() => {
      const stillOnAuthEntry = isAuthEntryRoute(
        window.location.pathname,
        i18nConfig.locales,
      );

      if (!stillOnAuthEntry || !getToken()) {
        postAuthRedirectRetryCountRef.current = 0;
        return;
      }

      if (
        postAuthRedirectRetryCountRef.current >= POST_AUTH_REDIRECT_MAX_RETRIES
      ) {
        postAuthRedirectRetryCountRef.current = 0;
        return;
      }

      postAuthRedirectRetryCountRef.current += 1;
      postAuthRedirectHandledRef.current = false;
      navigateToPostAuthDestination();
      schedulePostAuthRedirectRetry();
    }, POST_AUTH_REDIRECT_RETRY_DELAY);
  }, [navigateToPostAuthDestination]);

  // Cargar usuario desde localStorage al montar (sincrónico)
  useEffect(() => {
    const cachedUser = getUserFromStorage();
    const token = getToken();

    if (cachedUser && token) {
      console.log("💾 Cargando usuario desde localStorage");
      setUser(cachedUser);
      lastValidUserRef.current = cachedUser;
    }

    // Verificar sesión con backend (asincrónico)
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Configurar auto-refresh de token
  useEffect(() => {
    if (user && !!user) {
      setupTokenRefresh();
      setupSessionTimeout();
      setupActivityListeners();
    }

    return () => {
      clearAllTimers();
      removeActivityListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Si ya hay sesión y estamos en login/callback, redirigir una sola vez
  useEffect(() => {
    if (!user || typeof window === "undefined") {
      return;
    }

    const currentPath = window.location.pathname;
    if (!isAuthEntryRoute(currentPath, i18nConfig.locales)) {
      postAuthRedirectHandledRef.current = false;
      postAuthRedirectRetryCountRef.current = 0;
      if (postAuthRedirectRetryRef.current) {
        clearTimeout(postAuthRedirectRetryRef.current);
        postAuthRedirectRetryRef.current = null;
      }
      return;
    }

    navigateToPostAuthDestination();
    schedulePostAuthRedirectRetry();
  }, [user, navigateToPostAuthDestination, schedulePostAuthRedirectRetry]);

  const checkAuth = async () => {
    const token = getToken();
    console.log("🔐 checkAuth - Token encontrado:", !!token);

    if (!token) {
      console.log("❌ checkAuth - No hay token, saltando verificación");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("📡 checkAuth - Llamando a AuthClient.getProfile()...");

      // Obtener datos del usuario desde el backend
      const response = await AuthClient.getProfile();
      console.log("📥 checkAuth - Respuesta recibida:", {
        success: response.success,
        hasData: !!response.data,
        data: response.data,
      });

      if (response.success && response.data) {
        console.log("✅ checkAuth - Usuario obtenido correctamente");
        setUser(response.data);
        lastValidUserRef.current = response.data; // Guardar usuario válido
        setUserToStorage(response.data); // Persistir en localStorage
        // Resetear contador de reintentos si auth fue exitoso
        retryCountRef.current = 0;
        if (checkAuthRetryRef.current) {
          clearTimeout(checkAuthRetryRef.current);
          checkAuthRetryRef.current = null;
        }
      } else {
        console.log(
          "⚠️ checkAuth - Respuesta sin éxito, intentando refresh...",
        );
        // Token inválido, intentar refresh
        const refreshSuccess = await attemptTokenRefresh();
        if (!refreshSuccess) {
          console.log("❌ checkAuth - Refresh falló, limpiando sesión");
          clearToken();
          clearRefreshToken();
          setUser(null);
        } else {
          console.log(
            "✅ checkAuth - Refresh exitoso, reintentando getProfile...",
          );
          // Intentar obtener perfil nuevamente con el nuevo token
          const retryResponse = await AuthClient.getProfile();
          if (retryResponse.success && retryResponse.data) {
            console.log("✅ checkAuth - Usuario obtenido después de refresh");
            setUser(retryResponse.data);
          } else {
            console.log("❌ checkAuth - getProfile falló después de refresh");
            clearToken();
            clearRefreshToken();
            setUser(null);
          }
        }
      }
    } catch (error: unknown) {
      const normalizedError = toAuthContextHttpError(error);
      console.error("❌ checkAuth - Error capturado:", {
        message: normalizedError.message,
        status: normalizedError.response?.status,
        data: normalizedError.response?.data,
      });

      // Solo limpiar sesión si es un error de autenticación válido
      const isAuthError =
        normalizedError.response?.status === 401 ||
        normalizedError.response?.status === 403;

      const normalizedMessage = (normalizedError.message || "").toLowerCase();

      const isNetworkError =
        !normalizedError.response ||
        normalizedMessage.includes("network") ||
        normalizedMessage.includes("fetch") ||
        normalizedError.code === "ECONNREFUSED";

      if (isAuthError) {
        console.log(
          "🔄 checkAuth - Error de autenticación detectado, intentando refresh...",
        );
        const refreshSuccess = await attemptTokenRefresh();
        if (refreshSuccess) {
          // Reintentar obtener perfil
          try {
            const retryResponse = await AuthClient.getProfile();
            if (retryResponse.success && retryResponse.data) {
              console.log("✅ checkAuth - Usuario obtenido después de refresh");
              setUser(retryResponse.data);
              setIsLoading(false);
              return;
            }
          } catch (retryError) {
            console.error(
              "❌ checkAuth - Error en retry después de refresh:",
              retryError,
            );
          }
        }

        // Solo limpiar si el refresh también falló
        console.log("🧹 checkAuth - Token inválido, limpiando sesión");
        clearToken();
        clearRefreshToken();
        setUser(null);
      } else if (isNetworkError) {
        // Error de red: mantener el token, usuario Y reintentar
        console.warn(
          "⚠️ checkAuth - Error de red/backend, manteniendo sesión completa. Reintentando en 3 segundos...",
        );
        // No limpiar tokens ni usuario - mantener UI funcional
        // Si hay un usuario válido previo, usarlo
        if (lastValidUserRef.current && !user) {
          console.log(
            "💾 checkAuth - Restaurando último usuario válido desde cache",
          );
          setUser(lastValidUserRef.current);
        }
        // Programar reintento automático
        if (retryCountRef.current < 3) {
          retryCountRef.current += 1;
          if (checkAuthRetryRef.current) {
            clearTimeout(checkAuthRetryRef.current);
          }
          checkAuthRetryRef.current = setTimeout(() => {
            console.log(
              `🔄 Reintentando checkAuth (intento ${retryCountRef.current}/3)...`,
            );
            checkAuth();
          }, 3000);
        } else {
          console.warn(
            "⚠️ checkAuth - Máximo de reintentos alcanzado. Usuario debe recargar manualmente.",
          );
          retryCountRef.current = 0;
        }
        // NO hacer setUser(null) - mantener usuario actual o restaurado
      } else {
        // Otro tipo de error: ser conservador y mantener sesión completa
        console.warn(
          "⚠️ checkAuth - Error desconocido, manteniendo sesión completa. Error:",
          normalizedError.message,
        );
        // Si hay un usuario válido previo, usarlo
        if (lastValidUserRef.current && !user) {
          console.log(
            "💾 checkAuth - Restaurando último usuario válido desde cache",
          );
          setUser(lastValidUserRef.current);
        }
        // NO hacer setUser(null) - mantener usuario actual o restaurado
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para intentar refresh sin mostrar errores al usuario
  const attemptTokenRefresh = async (): Promise<boolean> => {
    try {
      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        return false;
      }

      const response = await AuthClient.refreshToken(currentRefreshToken);

      if (response.success && response.data) {
        const tokenPayload = response.data as TokenRefreshPayload;
        const newAccessToken = tokenPayload.accessToken || tokenPayload.token;
        const newRefreshToken = tokenPayload.refreshToken;
        const rememberMe = isRememberMeEnabled();

        if (newAccessToken) {
          setToken(newAccessToken, rememberMe);
        }
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken, rememberMe);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error en attemptTokenRefresh:", error);
      return false;
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false,
  ) => {
    postAuthRedirectHandledRef.current = false;

    try {
      setIsLoading(true);
      const response = await AuthClient.login({ email, password });

      if (response.success && response.data) {
        // El backend devuelve: { user: {...}, tokens: { accessToken, refreshToken } }
        const { user, tokens } = response.data;

        // Guardar tokens
        setToken(tokens.accessToken, rememberMe);
        setRefreshToken(tokens.refreshToken, rememberMe);

        // Guardar usuario
        setUser(user);
        lastValidUserRef.current = user; // Guardar en cache
        setUserToStorage(user); // Persistir en localStorage

        // Sincronizar idioma del usuario con la cookie NEXT_LOCALE para next-intl
        if (user.preferences?.language) {
          document.cookie = `NEXT_LOCALE=${user.preferences.language}; path=/; max-age=31536000; SameSite=Strict`;
        }

        // Mostrar notificación de éxito
        showSuccess(
          tAuth("login_success"),
          `Bienvenido ${user.firstName || user.email}`,
        );

        navigateToPostAuthDestination();
        schedulePostAuthRedirectRetry();
      } else {
        throw new Error(response.message || "Error al iniciar sesión");
      }
    } catch (error: unknown) {
      console.error("Error en login:", error);
      const resolvedMessage = resolveErrorMessage(
        error,
        tErrors as unknown as ErrorTranslator,
      );
      showError(
        tErrors("auth.default"),
        resolvedMessage || tAuth("default_error"),
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (showMessage: boolean = true) => {
    try {
      // Intentar logout en backend
      await AuthClient.logout();
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      // Limpiar timers
      clearAllTimers();

      // Limpiar estado local siempre
      clearToken();
      clearRefreshToken();
      setUser(null);
      lastValidUserRef.current = null; // Limpiar cache de usuario
      setUserToStorage(null); // Limpiar de localStorage
      postAuthRedirectHandledRef.current = false;
      postAuthRedirectRetryCountRef.current = 0;
      if (postAuthRedirectRetryRef.current) {
        clearTimeout(postAuthRedirectRetryRef.current);
        postAuthRedirectRetryRef.current = null;
      }
      clearPostAuthRedirect();

      if (showMessage) {
        showInfo("Sesión cerrada", "Has cerrado sesión exitosamente");
      }

      router.push("/login");
    }
  };

  const refreshUser = async () => {
    try {
      const response = await AuthClient.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        lastValidUserRef.current = response.data; // Actualizar cache
        setUserToStorage(response.data); // Persistir en localStorage

        // Sincronizar idioma del usuario con la cookie NEXT_LOCALE
        if (response.data.preferences?.language) {
          document.cookie = `NEXT_LOCALE=${response.data.preferences.language}; path=/; max-age=31536000; SameSite=Strict`;
        }
      }
    } catch (error) {
      console.error("Error refrescando usuario:", error);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        return false;
      }

      const response = await AuthClient.refreshToken(currentRefreshToken);

      if (response.success && response.data) {
        // El backend puede devolver { token, expiresIn } o { accessToken, refreshToken }
        const tokenPayload = response.data as TokenRefreshPayload;
        const newAccessToken = tokenPayload.accessToken || tokenPayload.token;
        const newRefreshToken = tokenPayload.refreshToken;
        const rememberMe = isRememberMeEnabled();

        if (newAccessToken) {
          setToken(newAccessToken, rememberMe);
        }
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken, rememberMe);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error refrescando token:", error);
      // Si falla el refresh, cerrar sesión
      await logout(false);
      const resolvedMessage = resolveErrorMessage(
        error,
        tErrors as unknown as ErrorTranslator,
      );
      showError(
        tErrors("auth.default"),
        resolvedMessage || tErrors("http.unauthorized"),
      );
      return false;
    }
  };

  // Setup auto-refresh de token
  const setupTokenRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(async () => {
      await refreshToken();
    }, REFRESH_TOKEN_INTERVAL);
  };

  // Setup session timeout por inactividad
  const setupSessionTimeout = () => {
    resetSessionTimeout();
  };

  const resetSessionTimeout = () => {
    // Limpiar timers anteriores
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Actualizar última actividad
    lastActivityRef.current = Date.now();

    // Warning antes del timeout
    warningTimeoutRef.current = setTimeout(() => {
      showWarning(
        "Sesión por expirar",
        "Tu sesión se cerrará en 5 minutos por inactividad. Mueve el mouse para mantenerla activa.",
      );
    }, SESSION_TIMEOUT - SESSION_WARNING_TIME);

    // Timeout final
    sessionTimeoutRef.current = setTimeout(async () => {
      await logout(false);
      showError(
        "Sesión cerrada por inactividad",
        "Tu sesión se cerró automáticamente después de 30 minutos de inactividad.",
      );
    }, SESSION_TIMEOUT);
  };

  // Detectar actividad del usuario
  const handleUserActivity = () => {
    if (user && !!user) {
      resetSessionTimeout();
    }
  };

  const setupActivityListeners = () => {
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleUserActivity);
      window.addEventListener("keydown", handleUserActivity);
      window.addEventListener("click", handleUserActivity);
      window.addEventListener("scroll", handleUserActivity);
    }
  };

  const removeActivityListeners = () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
    }
  };

  const clearAllTimers = () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    if (checkAuthRetryRef.current) {
      clearTimeout(checkAuthRetryRef.current);
    }
    if (postAuthRedirectRetryRef.current) {
      clearTimeout(postAuthRedirectRetryRef.current);
      postAuthRedirectRetryRef.current = null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

// Helper functions para manejar el token
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function setToken(token: string, rememberMe: boolean = false): void {
  if (typeof window === "undefined") return;

  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 días o 24 horas

  // Guardar en localStorage
  localStorage.setItem("accessToken", token);
  // Guardar en cookie para el middleware
  document.cookie = `accessToken=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

function clearToken(): void {
  if (typeof window === "undefined") return;
  // Limpiar localStorage
  localStorage.removeItem("accessToken");
  // Limpiar cookie
  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Strict";
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

function setRefreshToken(token: string, rememberMe: boolean = false): void {
  if (typeof window === "undefined") return;

  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 días o 7 días

  // Guardar en localStorage
  localStorage.setItem("refreshToken", token);
  // Guardar en cookie (httpOnly sería ideal, pero solo el backend puede hacerlo)
  document.cookie = `refreshToken=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

function clearRefreshToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("refreshToken");
  document.cookie = "refreshToken=; path=/; max-age=0; SameSite=Strict";
}

function isRememberMeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("rememberMe") === "true";
}

// Helpers para persistir usuario en localStorage
function getUserFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error("Error al parsear usuario desde localStorage:", error);
    return null;
  }
}

function setUserToStorage(user: User | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
}

// Exportar helpers para usar en httpClient
export {
  clearRefreshToken,
  clearToken,
  getRefreshToken,
  getToken,
  setRefreshToken,
  setToken,
};
