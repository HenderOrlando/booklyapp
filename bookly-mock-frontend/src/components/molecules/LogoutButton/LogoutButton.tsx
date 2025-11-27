"use client";

import { useLogout } from "@/hooks/useCurrentUser";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "button" | "link" | "menuItem";
}

/**
 * LogoutButton - Componente para cerrar sesión
 *
 * Funcionalidades:
 * - Limpia React Query cache
 * - Limpia sessionStorage
 * - Limpia cookies y localStorage
 * - Cierra sesión de NextAuth
 * - Redirige al login
 *
 * MIGRADO A REACT QUERY: Usa useLogout hook
 */
export function LogoutButton({
  children,
  className = "",
  variant = "button",
}: LogoutButtonProps) {
  const router = useRouter();
  const logout = useLogout();
  const t = useTranslations("auth");
  const locale = useLocale();

  const label = children || t("logout");

  const handleLogout = async () => {
    try {
      // 1. Limpiar NextAuth PRIMERO (esto también limpia sus cookies)
      await signOut({ redirect: false });

      // 2. Limpiar React Query + sessionStorage + cookies custom
      logout.mutate(undefined, {
        onSuccess: () => {
          // 3. Redirigir al login
          setTimeout(() => {
            window.location.href = `/${locale}/login`; // Forzar recarga completa preservando locale
          }, 100);
        },
        onError: () => {
          // Aún así redirigir
          window.location.href = `/${locale}/login`;
        },
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Forzar limpieza manual y redirect
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/"
            );
        });
      }
      window.location.href = `/${locale}/login`;
    }
  };

  // Estilos según variante
  const getClassName = () => {
    const baseClass = className;

    switch (variant) {
      case "link":
        return `text-white hover:underline text-sm cursor-pointer ${baseClass}`;
      case "menuItem":
        return `text-state-error-700 cursor-pointer ${baseClass}`;
      case "button":
      default:
        return `cursor-pointer ${baseClass}`;
    }
  };

  return (
    <button onClick={handleLogout} className={getClassName()}>
      {label}
    </button>
  );
}
