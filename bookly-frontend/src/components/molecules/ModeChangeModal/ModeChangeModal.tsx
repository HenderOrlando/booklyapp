"use client";

import { Button } from "@/components/atoms/Button/Button";
import { Badge } from "@/components/atoms/Badge/Badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/atoms/Alert/Alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/atoms/Dialog";
import {
  AlertTriangle,
  Database,
  Globe,
  Monitor,
  Server,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import * as React from "react";

export type ModeChangeType = "data" | "routing";

interface ModeChangeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changeType: ModeChangeType;
  currentMode: string;
  newMode: string;
  currentRouting: string;
  newRouting: string;
}

interface EffectItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  type: "info" | "warning" | "success";
}

function getDataModeEffects(
  newMode: string,
  currentRouting: string,
): EffectItem[] {
  if (newMode === "serve") {
    const isGateway = currentRouting === "gateway";
    return [
      {
        icon: <Server className="h-4 w-4" />,
        label: "Fuente de datos: Backend real",
        description:
          "Todas las consultas se ejecutarán contra los servicios reales (localhost:3000-3005).",
        type: "info",
      },
      {
        icon: <Zap className="h-4 w-4" />,
        label: "Cache invalidado",
        description:
          "Todos los datos en cache se borrarán y se recargarán desde el servidor.",
        type: "warning",
      },
      {
        icon: isGateway ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        ),
        label: isGateway
          ? "WebSocket: Se activará"
          : "WebSocket: Desactivado (requiere Gateway)",
        description: isGateway
          ? "Recibirás notificaciones en tiempo real del servidor via WebSocket."
          : "Para WebSocket, cambia el routing a GATEWAY.",
        type: isGateway ? "success" : "warning",
      },
      {
        icon: <AlertTriangle className="h-4 w-4" />,
        label: "Requiere backend activo",
        description:
          "Si los servicios no están corriendo, las páginas mostrarán errores de conexión.",
        type: "warning",
      },
    ];
  }
  return [
    {
      icon: <Database className="h-4 w-4" />,
      label: "Fuente de datos: Datos locales (Mock)",
      description:
        "Todas las consultas usarán datos simulados locales. No se contactará ningún servidor.",
      type: "info",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: "Cache invalidado",
      description:
        "Todos los datos en cache se borrarán y se recargarán desde datos mock.",
      type: "warning",
    },
    {
      icon: <WifiOff className="h-4 w-4" />,
      label: "WebSocket: Desactivado",
      description:
        "No habrá notificaciones en tiempo real. Los datos se actualizan solo al navegar.",
      type: "info",
    },
    {
      icon: <Monitor className="h-4 w-4" />,
      label: "Sin dependencia de backend",
      description:
        "La aplicación funciona completamente offline con datos de ejemplo.",
      type: "success",
    },
  ];
}

function getRoutingEffects(
  newRouting: string,
  currentMode: string,
): EffectItem[] {
  const isServe = currentMode === "serve";
  if (newRouting === "gateway") {
    return [
      {
        icon: <Globe className="h-4 w-4" />,
        label: "Routing: API Gateway (localhost:3000)",
        description:
          "Todas las peticiones pasan por el Gateway que las enruta al microservicio correcto.",
        type: "info",
      },
      {
        icon: isServe ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        ),
        label: isServe
          ? "WebSocket: Se activará"
          : "WebSocket: Inactivo (modo Mock)",
        description: isServe
          ? "El Gateway gestiona la conexión WebSocket para notificaciones en tiempo real."
          : "WebSocket solo funciona en modo SERVER + GATEWAY.",
        type: isServe ? "success" : "info",
      },
      {
        icon: <Zap className="h-4 w-4" />,
        label: "Cache invalidado",
        description:
          "Se borran los datos en cache para refrescar desde la nueva ruta.",
        type: "warning",
      },
    ];
  }
  return [
    {
      icon: <Server className="h-4 w-4" />,
      label: "Routing: Servicios directos",
      description:
        "Las peticiones van directamente a cada microservicio (auth:3001, resources:3002, etc.).",
      type: "info",
    },
    {
      icon: <WifiOff className="h-4 w-4" />,
      label: "WebSocket: Desactivado",
      description:
        "WebSocket solo funciona via Gateway. En modo directo no hay notificaciones en tiempo real.",
      type: "warning",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: "Cache invalidado",
      description:
        "Se borran los datos en cache para refrescar desde la nueva ruta.",
      type: "warning",
    },
  ];
}

export function ModeChangeModal({
  open,
  onClose,
  onConfirm,
  changeType,
  currentMode,
  newMode,
  currentRouting,
  newRouting,
}: ModeChangeModalProps) {
  if (!open) return null;

  const effects =
    changeType === "data"
      ? getDataModeEffects(newMode, currentRouting)
      : getRoutingEffects(newRouting, currentMode);

  const title =
    changeType === "data"
      ? `Cambiar a modo ${newMode === "serve" ? "SERVER" : "MOCK"}`
      : `Cambiar routing a ${newRouting === "gateway" ? "GATEWAY" : "DIRECTO"}`;

  const typeColors = {
    info: "default",
    warning: "warning",
    success: "success",
  } as const;

  const modeBadgeVariant = (value: string) =>
    value === "mock" ? "warning" : "success";

  const routingBadgeVariant = (value: string) =>
    value === "gateway" ? "primary" : "secondary";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Summary badges */}
        <div className="flex items-center gap-2 mb-4 mt-2">
          <Badge variant={changeType === "data" ? modeBadgeVariant(currentMode) : routingBadgeVariant(currentRouting)}>
            {changeType === "data"
              ? currentMode.toUpperCase()
              : currentRouting.toUpperCase()}
          </Badge>
          <span className="text-[var(--color-text-tertiary)]">→</span>
          <Badge variant={changeType === "data" ? modeBadgeVariant(newMode) : routingBadgeVariant(newRouting)}>
            {changeType === "data"
              ? newMode.toUpperCase()
              : newRouting.toUpperCase()}
          </Badge>
        </div>

        {/* Effects list */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
            Efectos del cambio
          </p>
          {effects.map((effect, i) => (
            <Alert key={i} variant={typeColors[effect.type]}>
              {effect.icon}
              <AlertTitle>{effect.label}</AlertTitle>
              <AlertDescription>{effect.description}</AlertDescription>
            </Alert>
          ))}
        </div>

        {/* Actions */}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={onConfirm}>
            Confirmar cambio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
