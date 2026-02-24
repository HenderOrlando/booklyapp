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
  title: _title,
  showUser = true,
  className = "",
}: AppHeaderProps) {
  const { data: user } = useCurrentUser();
  const t = useTranslations("auth");

  return (
    <div className={`flex items-center flex-1 relative ${className}`}>
      {/* Logo DSI - Izquierda */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
        <div className="relative w-24 h-24 transition-all duration-300">
          <Image
            src="/images/logo_dsi_white.png"
            alt="DSI UFPS"
            fill
            className="object-contain"
            priority
          />
        </div>
        {showUser && user && (
          <div className="hidden md:flex flex-col items-start leading-tight -space-y-0.5 text-left">
            <span className="text-[13px] font-bold text-white">
              {/* Mostramos el primer rol del usuario, si existe. Si no, su nombre completo como fallback */}
              {user.roles && user.roles.length > 0 
                ? user.roles[0].displayName || user.roles[0].name 
                : `${user.firstName} ${user.lastName}`}
            </span>
            <span className="text-[11px] text-white/70 font-medium">
              {user.email}
            </span>
          </div>
        )}
      </div>

      {/* Título Bookly - Centrado */}
      <div className="flex-1 flex justify-center items-center">
        <span className="text-[28px] font-black text-white leading-tight tracking-tight">
          Bookly
        </span>
      </div>

      {/* Sección Usuario, Theme y Logout - Derecha */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-6">
        <div className="flex items-center gap-4">
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
