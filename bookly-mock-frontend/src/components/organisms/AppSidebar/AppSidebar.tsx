"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Link, usePathname } from "@/i18n/navigation";
import { normalizeRoles } from "@/utils/roleUtils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

const TRANSLATION_KEYS: Record<string, string> = {
  "/dashboard": "navigation.dashboard",
  "/profile": "navigation.profile",
  "/recursos": "navigation.resources",
  "/categorias": "navigation.categories",
  "/mantenimientos": "navigation.maintenance",
  "/programas": "navigation.programs",
  "/reservas": "navigation.reservations",
  "/calendario": "navigation.calendar",
  "/lista-espera": "navigation.waitlist",
  "/aprobaciones": "navigation.approvals",
  "/vigilancia": "navigation.vigilance",
  "/historial-aprobaciones": "navigation.approval_history",
  "/check-in": "navigation.check_in",
  "/reportes": "navigation.reports",
  "/admin/templates": "navigation.templates",
  "/admin/roles": "navigation.roles",
  "/admin/usuarios": "navigation.users",
  "/admin/auditoria": "navigation.audit",
  "/admin/integraciones": "navigation.integrations",
  "/admin/flujos-aprobacion": "navigation.approval_flows",
  "/admin/horarios": "navigation.schedules",
  "/admin/canales-notificacion": "navigation.notification_channels",
  "/admin/evaluaciones": "navigation.evaluations",
  "/reservas/reasignacion": "navigation.reassignment",
  "/design-system": "navigation.design_system",
  "/reportes/recursos": "reports_section.resources",
  "/reportes/usuarios": "reports_section.users",
  "/reportes/avanzado": "reports_section.advanced",
  "/reportes/demanda-insatisfecha": "reports_section.unsatisfied_demand",
  "/reportes/cumplimiento": "reports_section.compliance",
  "/reportes/conflictos": "reports_section.conflicts",
};

/**
 * AppSidebar - Menú lateral de navegación de la aplicación
 *
 * Menu estandarizado que se usa en todas las páginas principales
 * Resalta automáticamente la ruta activa y soporta submenús.
 */

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  roles?: string[]; // Opcional: restringir por roles
  children?: Array<{ href: string; label: string }>; // Submenú opcional
}

const navigationItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Mi Perfil",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    href: "/recursos",
    label: "Recursos",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    href: "/categorias",
    label: "Categorías",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
    roles: ["admin", "coordinador"], // Solo admin y coordinador pueden gestionar categorías
  },
  {
    href: "/mantenimientos",
    label: "Mantenimientos",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    roles: ["admin", "coordinador"], // Solo admin y coordinador pueden gestionar mantenimientos
  },
  {
    href: "/programas",
    label: "Programas",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    roles: ["admin", "coordinador"], // Solo admin y coordinador pueden gestionar programas académicos
  },
  {
    href: "/reservas",
    label: "Reservas",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    href: "/calendario",
    label: "Calendario",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 11l3 3L22 4"
        />
      </svg>
    ),
  },
  {
    href: "/lista-espera",
    label: "Lista de Espera",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    roles: ["admin", "coordinador"], // Solo admin y coordinador pueden gestionar listas de espera
  },
  {
    href: "/aprobaciones",
    label: "Aprobaciones",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    roles: ["admin", "coordinador"], // Solo admins y coordinadores
  },
  {
    href: "/vigilancia",
    label: "Vigilancia",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
    roles: ["admin", "vigilancia"], // Solo admins y personal de vigilancia
  },
  {
    href: "/historial-aprobaciones",
    label: "Historial de Aprobaciones",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    roles: ["admin", "coordinador", "profesor"], // Historial visible para estos roles
  },
  {
    href: "/check-in",
    label: "Check-in / Check-out",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    roles: ["admin", "profesor", "estudiante", "coordinador"], // Todos los usuarios pueden hacer check-in
  },
  {
    href: "/reportes",
    label: "Reportes",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    roles: ["admin", "coordinador"],
    children: [
      {
        href: "/reportes",
        label: "Dashboard",
      },
      {
        href: "/reportes/recursos",
        label: "Por Recurso",
      },
      {
        href: "/reportes/usuarios",
        label: "Por Usuario",
      },
      {
        href: "/reportes/avanzado",
        label: "Análisis Avanzado",
      },
      {
        href: "/reportes/demanda-insatisfecha",
        label: "Demanda Insatisfecha",
      },
      {
        href: "/reportes/cumplimiento",
        label: "Cumplimiento",
      },
      {
        href: "/reportes/conflictos",
        label: "Conflictos",
      },
    ],
  },
  {
    href: "/reservas/reasignacion",
    label: "Reasignación",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
    roles: ["admin", "coordinador"],
  },
  {
    href: "/admin/templates",
    label: "Plantillas",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    roles: ["admin", "coordinador"],
  },
  {
    href: "/admin/roles",
    label: "Roles y Permisos",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    roles: ["admin"],
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    roles: ["admin"], // Solo admin puede gestionar usuarios
  },
  {
    href: "/admin/integraciones",
    label: "Integraciones",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
    roles: ["admin"],
  },
  {
    href: "/admin/flujos-aprobacion",
    label: "Flujos de Aprobación",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    ),
    roles: ["admin"],
  },
  {
    href: "/admin/horarios",
    label: "Horarios",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    roles: ["admin", "coordinador"],
  },
  {
    href: "/admin/canales-notificacion",
    label: "Canales de Notificación",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
    roles: ["admin"],
  },
  {
    href: "/admin/evaluaciones",
    label: "Evaluaciones",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
    roles: ["admin", "coordinador"],
  },
  {
    href: "/admin/auditoria",
    label: "Auditoría",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    roles: ["admin"],
  },
  {
    href: "/design-system",
    label: "Sistema de Diseño",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
    roles: ["admin"], // Solo admin accede al sistema de diseño (desarrollo)
  },
];

interface AppSidebarProps {
  userRole?: string; // Opcional: filtrar items por rol
  className?: string;
}

export function AppSidebar({
  userRole: userRoleProp,
  className = "",
}: AppSidebarProps) {
  const { user, isLoading } = useAuth();
  const t = useTranslations();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  // Normalizar todos los roles del usuario usando utilidad centralizada
  const userRoles = React.useMemo(() => {
    if (userRoleProp) {
      return [userRoleProp];
    }

    if (!user?.roles || user.roles.length === 0) {
      console.warn("[AppSidebar] Usuario sin roles asignados", { user });
      return [];
    }

    // Usar utilidad centralizada para normalizar roles
    const normalizedRoles = normalizeRoles(user.roles);

    console.log(
      "[AppSidebar] Roles originales:",
      user.roles.map((r) => (typeof r === "string" ? r : r.name)),
    );
    console.log("[AppSidebar] Roles normalizados:", normalizedRoles);

    return normalizedRoles;
  }, [user?.roles, userRoleProp]);

  // Inicializar items expandidos basado en la ruta actual
  React.useEffect(() => {
    const itemsToExpand = navigationItems
      .filter(
        (item) =>
          item.children &&
          item.children.some((child) => pathname.startsWith(child.href)),
      )
      .map((item) => item.href);

    if (itemsToExpand.length > 0) {
      setExpandedItems((prev) => [...new Set([...prev, ...itemsToExpand])]);
    }
  }, [pathname]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href],
    );
  };

  // Filtrar items según los roles del usuario y traducir etiquetas
  const visibleItems = navigationItems
    .filter((item) => {
      // Si el item no tiene roles definidos, siempre mostrarlo
      if (!item.roles || item.roles.length === 0) {
        return true;
      }

      // Si el item tiene roles pero el usuario no tiene roles asignados, no mostrarlo
      if (!userRoles || userRoles.length === 0) {
        console.log(
          `[AppSidebar] Ocultando "${item.href}" - usuario sin roles`,
        );
        return false;
      }

      // Verificar si alguno de los roles del usuario coincide con los roles permitidos del item
      const hasAccess = item.roles.some((requiredRole) =>
        userRoles.includes(requiredRole),
      );

      if (!hasAccess) {
        console.log(
          `[AppSidebar] Ocultando "${item.href}" - requiere roles:`,
          item.roles,
          "usuario tiene:",
          userRoles,
        );
      }

      return hasAccess;
    })
    .map((item) => ({
      ...item,
      label: TRANSLATION_KEYS[item.href]
        ? t(TRANSLATION_KEYS[item.href])
        : item.label,
      children: item.children?.map((child) => ({
        ...child,
        label:
          child.href === "/reportes" && child.label === "Dashboard"
            ? t("reports_section.dashboard")
            : TRANSLATION_KEYS[child.href]
              ? t(TRANSLATION_KEYS[child.href])
              : child.label,
      })),
    }));

  return (
    <nav className={`space-y-2 ${className}`}>
      {visibleItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.children
            ? item.children.some((child) => pathname === child.href)
            : pathname.startsWith(`${item.href}/`));
        const isExpanded = expandedItems.includes(item.href);
        const hasChildren = item.children && item.children.length > 0;

        return (
          <div key={item.href} className="flex flex-col">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(item.href)}
                className={`
                  flex items-center justify-between w-full px-4 py-2 rounded-md transition-colors
                  ${
                    isActive
                      ? "bg-brand-primary-600 text-white"
                      : "hover:bg-slate-700 text-[var(--color-text-tertiary)]"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {item.icon && (
                    <span className="flex-shrink-0">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-md transition-colors
                  ${
                    isActive
                      ? "bg-brand-primary-600 text-white"
                      : "hover:bg-slate-700 text-[var(--color-text-tertiary)]"
                  }
                `}
              >
                {item.icon && (
                  <span className="flex-shrink-0">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </Link>
            )}

            {/* Submenú */}
            {hasChildren && isExpanded && (
              <div className="ml-4 mt-1 pl-4 border-l border-[var(--color-border-strong)] space-y-1">
                {item.children?.map((child) => {
                  const isChildActive = pathname === child.href;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`
                        block px-4 py-2 rounded-md transition-colors text-sm
                        ${
                          isChildActive
                            ? "text-brand-primary-400 font-medium"
                            : "text-[var(--color-text-tertiary)] hover:text-white hover:bg-slate-700"
                        }
                      `}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
