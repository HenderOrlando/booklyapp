"use client";

import { Badge } from "@/components/atoms/Badge/Badge";
import { Button } from "@/components/atoms/Button/Button";
import { Card } from "@/components/atoms/Card/Card";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import {
  useNotificationChannels,
  useNotificationPreferences,
} from "@/hooks/useNotificationChannels";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Mail,
  MessageCircle,
  Smartphone,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Page: Configuración de Canales de Notificación — RF-27
 *
 * Permite al admin configurar los canales de comunicación:
 * - Email (SMTP config)
 * - WhatsApp (API integration)
 * - Push notifications
 * - Preferencias por tipo de evento
 */

interface ChannelConfig {
  id: string;
  name: string;
  type: "email" | "whatsapp" | "push";
  enabled: boolean;
  configured: boolean;
  description: string;
}

interface NotificationPreference {
  eventType: string;
  label: string;
  channels: { email: boolean; whatsapp: boolean; push: boolean };
}

const mockChannels: ChannelConfig[] = [
  {
    id: "ch-1",
    name: "Email SMTP",
    type: "email",
    enabled: true,
    configured: true,
    description: "Servidor SMTP institucional configurado",
  },
  {
    id: "ch-2",
    name: "WhatsApp Business",
    type: "whatsapp",
    enabled: false,
    configured: false,
    description: "Integración con WhatsApp Business API",
  },
  {
    id: "ch-3",
    name: "Push Notifications",
    type: "push",
    enabled: true,
    configured: true,
    description: "Notificaciones push del navegador",
  },
];

const mockPreferences: NotificationPreference[] = [
  {
    eventType: "reservation_created",
    label: "Reserva creada",
    channels: { email: true, whatsapp: false, push: true },
  },
  {
    eventType: "reservation_approved",
    label: "Reserva aprobada",
    channels: { email: true, whatsapp: false, push: true },
  },
  {
    eventType: "reservation_rejected",
    label: "Reserva rechazada",
    channels: { email: true, whatsapp: false, push: true },
  },
  {
    eventType: "reservation_cancelled",
    label: "Reserva cancelada",
    channels: { email: true, whatsapp: false, push: true },
  },
  {
    eventType: "reservation_reminder",
    label: "Recordatorio de reserva",
    channels: { email: true, whatsapp: false, push: true },
  },
  {
    eventType: "waitlist_available",
    label: "Disponibilidad en lista de espera",
    channels: { email: true, whatsapp: false, push: false },
  },
  {
    eventType: "maintenance_scheduled",
    label: "Mantenimiento programado",
    channels: { email: true, whatsapp: false, push: false },
  },
];

const channelIcons = {
  email: Mail,
  whatsapp: MessageCircle,
  push: Smartphone,
};

export default function CanalesNotificacionPage() {
  const t = useTranslations("admin");
  const { data: serverChannels } = useNotificationChannels();
  const { data: serverPreferences } = useNotificationPreferences();
  const [channels, setChannels] = React.useState(mockChannels);
  const [preferences, setPreferences] = React.useState(mockPreferences);

  React.useEffect(() => {
    if (serverChannels && serverChannels.length > 0)
      setChannels(serverChannels as any);
  }, [serverChannels]);

  React.useEffect(() => {
    if (serverPreferences && serverPreferences.length > 0)
      setPreferences(serverPreferences as any);
  }, [serverPreferences]);

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch)),
    );
  };

  const togglePreference = (
    eventType: string,
    channel: "email" | "whatsapp" | "push",
  ) => {
    setPreferences((prev) =>
      prev.map((p) =>
        p.eventType === eventType
          ? {
              ...p,
              channels: { ...p.channels, [channel]: !p.channels[channel] },
            }
          : p,
      ),
    );
  };

  return (
    <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Canales de Notificación
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Configura los canales y preferencias de notificación del sistema
          </p>
        </div>

        {/* Channels */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
            Canales disponibles
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {channels.map((channel) => {
              const Icon = channelIcons[channel.type];
              return (
                <Card key={channel.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "rounded-lg p-2",
                          channel.enabled
                            ? "bg-brand-primary-100"
                            : "bg-[var(--color-bg-tertiary)]",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            channel.enabled
                              ? "text-brand-primary-600"
                              : "text-[var(--color-text-tertiary)]",
                          )}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--color-text-primary)]">
                          {channel.name}
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {channel.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {channel.configured ? (
                        <Badge variant="success">Configurado</Badge>
                      ) : (
                        <Badge variant="warning">Sin configurar</Badge>
                      )}
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={channel.enabled}
                      onClick={() => toggleChannel(channel.id)}
                      disabled={!channel.configured}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                        channel.enabled
                          ? "bg-brand-primary-500"
                          : "bg-[var(--color-bg-muted)]",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--color-bg-primary)] shadow transition-transform",
                          channel.enabled ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Preferences Matrix */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
            Preferencias por evento
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-[var(--color-bg-muted)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                      Tipo de evento
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                      <div className="flex items-center justify-center gap-1">
                        <Mail className="h-4 w-4" /> Email
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                      <div className="flex items-center justify-center gap-1">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                      <div className="flex items-center justify-center gap-1">
                        <Smartphone className="h-4 w-4" /> Push
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {preferences.map((pref) => (
                    <tr key={pref.eventType} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                        {pref.label}
                      </td>
                      {(["email", "whatsapp", "push"] as const).map((ch) => (
                        <td key={ch} className="px-4 py-3 text-center">
                          <button
                            onClick={() => togglePreference(pref.eventType, ch)}
                            className="mx-auto"
                            aria-label={`${pref.label} por ${ch}: ${pref.channels[ch] ? "activado" : "desactivado"}`}
                          >
                            {pref.channels[ch] ? (
                              <CheckCircle2 className="h-5 w-5 text-state-success-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-tertiary)]" />
                            )}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button>Guardar preferencias</Button>
        </div>
      </div>
    </MainLayout>
  );
}
