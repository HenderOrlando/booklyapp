"use client";

import { Badge } from "@/components/atoms/Badge/Badge";
// import { Button } from "@/components/atoms/Button/Button";
import { cn } from "@/lib/utils";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import * as React from "react";

/**
 * NotificationInbox — RF-22, RF-28: Inbox de notificaciones
 *
 * Dropdown que muestra lista de notificaciones con acciones
 * de marcar como leída, marcar todas como leídas.
 */

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationInboxProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

const typeStyles: Record<string, string> = {
  info: "border-l-brand-primary-500",
  success: "border-l-state-success-500",
  warning: "border-l-state-warning-500",
  error: "border-l-state-error-500",
};

export function NotificationInbox({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
  className,
}: NotificationInboxProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={cn(
        "w-80 max-h-96 overflow-hidden rounded-lg border bg-[var(--color-bg-surface)] shadow-lg",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[var(--color-text-secondary)]" />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            Notificaciones
          </span>
          {unreadCount > 0 && (
            <Badge variant="primary" className="text-[10px] px-1.5 py-0">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 text-xs text-brand-primary-500 hover:text-brand-primary-600"
          >
            <CheckCheck className="h-3 w-3" />
            Marcar todas
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text-tertiary)]">
            <Bell className="mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm">Sin notificaciones</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "border-b border-l-4 px-4 py-3 transition-colors cursor-pointer",
                typeStyles[notification.type] || typeStyles.info,
                notification.read
                  ? "bg-transparent opacity-70"
                  : "bg-brand-primary-50/5"
              )}
              onClick={() => onNotificationClick?.(notification)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm truncate",
                      !notification.read && "font-semibold"
                    )}
                  >
                    {notification.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">
                    {new Date(notification.createdAt).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                      className="rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-muted)] hover:text-brand-primary-500"
                      aria-label="Marcar como leída"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                      className="rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-muted)] hover:text-state-error-500"
                      aria-label="Eliminar notificación"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
