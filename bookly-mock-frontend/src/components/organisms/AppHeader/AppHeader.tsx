import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { LogoutButton } from "@/components/molecules/LogoutButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTranslations } from "next-intl";
import Image from "next/image";

/**
 * AppHeader - Header superior de la aplicación
 *
 * Header estandarizado que se usa en todas las páginas principales
 * Muestra el logo, organización, información del usuario y acciones
 */

interface AppHeaderProps {
  title?: string;
  showUser?: boolean;
  className?: string;
}

export function AppHeader({
  title,
  showUser = true,
  className = "",
}: AppHeaderProps) {
  const { data: user } = useCurrentUser();
  const t = useTranslations("auth");

  return (
    <div className={`flex items-center justify-between flex-1 ${className}`}>
      {/* Logo y Título (Organización y Bookly) */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* DSI Logo White version */}
          <div className="relative w-20 h-20 transition-all duration-300">
            <Image
              src="/images/logo_dsi_white.png"
              alt="DSI UFPS"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="flex flex-col">
            <span className="text-[24px] font-black text-white leading-tight tracking-tight">
              Bookly
            </span>
          </div>
        </div>
      </div>

      {/* Sección de Usuario, Theme y Logout */}
      <div className="flex items-center gap-6">
        {showUser && user && (
          <div className="hidden md:flex flex-col items-end leading-tight -space-y-0.5">
            <span className="text-[13px] font-bold text-white">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-[11px] text-white/70 font-medium">
              {user.email}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 border-l border-white/20 pl-6">
          <ThemeToggle />
          <LogoutButton
            variant="link"
            className="text-[13px] font-bold text-white hover:text-white/80 transition-colors p-0 h-auto no-underline hover:no-underline"
          >
            {t("logout")}
          </LogoutButton>
        </div>
      </div>
    </div>
  );
}
