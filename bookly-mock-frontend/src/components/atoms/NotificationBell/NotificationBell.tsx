"use client";

import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import * as React from "react";

/**
 * NotificationBell — RF-22, RF-28: Campana de notificaciones
 *
 * Muestra un ícono de campana con badge de conteo de notificaciones no leídas.
 * Se integra en el AppHeader para acceso rápido a notificaciones.
 */

interface NotificationBellProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ count, onClick, className }: NotificationBellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-md p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]",
        className
      )}
      aria-label={`Notificaciones${count > 0 ? ` (${count} sin leer)` : ""}`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-state-error-500 px-1 text-[10px] font-bold text-white"
          aria-hidden="true"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
