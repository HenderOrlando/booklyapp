"use client";

import { Badge } from "@/components/atoms/Badge/Badge";
import { Button } from "@/components/atoms/Button/Button";
import { Card } from "@/components/atoms/Card/Card";
import { Switch } from "@/components/atoms/Switch/Switch";
import { DataTable } from "@/components/molecules/DataTable";
import { Checkbox } from "@/components/atoms/Checkbox/Checkbox";
import {
  useNotificationChannels,
  useNotificationPreferences,
} from "@/hooks/useNotificationChannels";
import { cn } from "@/lib/utils";
import {
  Mail,
  MessageCircle,
  Smartphone,
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

  const columns = [
    {
      key: "event_type",
      header: t("notifications.event_type"),
      cell: (pref: NotificationPreference) => (
        <span className="font-medium text-[var(--color-text-primary)]">
          {t(`notifications.events.${pref.eventType}` as any)}
        </span>
      ),
    },
    {
      key: "email",
      header: (
        <div className="flex items-center justify-center gap-1">
          <Mail className="h-4 w-4" /> {t("notifications.email")}
        </div>
      ),
      className: "text-center",
      cell: (pref: NotificationPreference) => (
        <div className="flex justify-center">
          <Checkbox
            checked={pref.channels.email}
            onCheckedChange={() => togglePreference(pref.eventType, "email")}
            aria-label={`${t(`notifications.events.${pref.eventType}` as any)} por email`}
          />
        </div>
      ),
    },
    {
      key: "whatsapp",
      header: (
        <div className="flex items-center justify-center gap-1">
          <MessageCircle className="h-4 w-4" /> {t("notifications.whatsapp")}
        </div>
      ),
      className: "text-center",
      cell: (pref: NotificationPreference) => (
        <div className="flex justify-center">
          <Checkbox
            checked={pref.channels.whatsapp}
            onCheckedChange={() => togglePreference(pref.eventType, "whatsapp")}
            aria-label={`${t(`notifications.events.${pref.eventType}` as any)} por whatsapp`}
          />
        </div>
      ),
    },
    {
      key: "push",
      header: (
        <div className="flex items-center justify-center gap-1">
          <Smartphone className="h-4 w-4" /> {t("notifications.push")}
        </div>
      ),
      className: "text-center",
      cell: (pref: NotificationPreference) => (
        <div className="flex justify-center">
          <Checkbox
            checked={pref.channels.push}
            onCheckedChange={() => togglePreference(pref.eventType, "push")}
            aria-label={`${t(`notifications.events.${pref.eventType}` as any)} por push`}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {t("notifications.title")}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {t("notifications.subtitle")}
          </p>
        </div>

        {/* Channels */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
            {t("notifications.available_channels")}
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
                        <Badge variant="success">{t("notifications.configured")}</Badge>
                      ) : (
                        <Badge variant="warning">{t("notifications.not_configured")}</Badge>
                      )}
                    </div>
                    <Switch
                      checked={channel.enabled}
                      onCheckedChange={() => toggleChannel(channel.id)}
                      disabled={!channel.configured}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Preferences Matrix */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
            {t("notifications.preferences_by_event")}
          </h2>
          <DataTable 
            data={preferences}
            columns={columns}
            pageSize={preferences.length}
            totalItems={preferences.length}
          />
        </div>

        <div className="flex justify-end">
          <Button>{t("notifications.save_preferences")}</Button>
        </div>
      </div>
    </>
  );
}
